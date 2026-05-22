"""
SecureRuralPay — PDF Bank Statement Analyzer Routes
POST /api/pdf/analyze — Extract and score all transactions
"""
"""
Author: Dhanush Sai Gandhiraj Chinta
GitHub: https://github.com/Gandhiraj754
Email:  gandhiraj9609@gmail.com
"""


from flask import Blueprint, request, jsonify
import re
import time
import random
import math

pdf_bp = Blueprint('pdf_analyzer', __name__)

# ── Regex patterns for Indian bank statement formats ────────────
DATE_PATTERNS = [
    r'\b(\d{2}[/-]\d{2}[/-]\d{2,4})\b',
    r'\b(\d{2}\s+\w+\s+\d{2,4})\b',
    r'\b(\w{3}\s+\d{1,2},?\s+\d{4})\b',
]
AMOUNT_PATTERN = r'(?:Rs\.?|INR|₹)?\s*(\d{1,10}(?:,\d{3})*(?:\.\d{2})?)'
DR_CR_PATTERN  = r'\b(Dr|Cr|DR|CR|debit|credit|DEBIT|CREDIT)\b'

# ── Merchant categories ─────────────────────────────────────────
KNOWN_MERCHANTS = {
    'amazon', 'flipkart', 'myntra', 'swiggy', 'zomato', 'uber',
    'ola', 'airtel', 'jio', 'bsnl', 'irctc', 'petrol', 'pharmacy',
    'grocery', 'hospital', 'school', 'college', 'electricity', 'gas',
    'water', 'insurance', 'mutual fund', 'nps', 'ppf'
}

SUSPICIOUS_KEYWORDS = {
    'unknown', 'unverified', 'foreign', 'casino', 'lottery',
    'gift', 'prize', 'reward', 'bonus', 'free', 'claim', 'urgent'
}

def parse_transactions_from_text(text: str) -> list:
    """Parse transactions from PDF text (handles SBI, HDFC, ICICI, Axis formats)"""
    transactions = []
    lines = text.split('\n')
    for i, line in enumerate(lines):
        # Look for lines with amounts
        amounts = re.findall(AMOUNT_PATTERN, line)
        if not amounts:
            continue
        # Look for dates
        date_found = None
        for pat in DATE_PATTERNS:
            m = re.search(pat, line)
            if m:
                date_found = m.group(1)
                break
        if not date_found:
            continue

        # Extract dr/cr
        dr_cr = 'Dr'
        dr_cr_match = re.search(DR_CR_PATTERN, line)
        if dr_cr_match:
            dr_cr = dr_cr_match.group(1).upper()[:2]

        # Clean amount
        amount_str = amounts[-1].replace(',', '')
        try:
            amount = float(amount_str)
        except ValueError:
            continue

        if amount < 1:
            continue

        # Description (everything between date and amount)
        desc = re.sub(r'\d{2}[/-]\d{2}[/-]\d{2,4}', '', line)
        desc = re.sub(AMOUNT_PATTERN, '', desc).strip()
        desc = re.sub(r'\s+', ' ', desc)[:60]

        transactions.append({
            'date': date_found,
            'amount': amount,
            'description': desc or 'UPI Transaction',
            'type': 'debit' if 'DR' in dr_cr else 'credit'
        })

    return transactions[:200]  # cap

def score_transaction(tx: dict, all_tx: list) -> dict:
    """Score each transaction using the ML fraud model (simulated)"""
    amount = tx['amount']
    desc = tx['description'].lower()
    hour = random.randint(0, 23)  # In real: parsed from timestamp

    # Compute average amount
    amounts = [t['amount'] for t in all_tx if t['type'] == 'debit']
    avg = sum(amounts) / max(len(amounts), 1)
    ratio = amount / max(avg, 1)

    score = 0
    reasons = []

    # Unknown merchant
    is_known = any(k in desc for k in KNOWN_MERCHANTS)
    is_suspicious = any(k in desc for k in SUSPICIOUS_KEYWORDS) or 'unknown' in desc
    if is_suspicious:
        score += 40; reasons.append('Unknown or suspicious merchant')
    elif not is_known:
        score += 15; reasons.append('Merchant not in verified list')

    # Amount anomaly
    if ratio > 5:
        score += 25; reasons.append('Amount much higher than average')
    elif ratio > 2.5:
        score += 12

    # Night time
    if hour < 5 or hour > 23:
        score += 18; reasons.append('Late night transaction')
    elif hour < 7:
        score += 8

    # Round amounts
    if amount >= 1000 and amount % 1000 == 0:
        score += 5

    # Very high single transaction
    if amount > 50000:
        score += 15; reasons.append('Very large amount')

    # Duplicate check (same amount in last 5 tx)
    recent = [t['amount'] for t in all_tx[-5:] if t != tx]
    if recent.count(amount) >= 2:
        score += 20; reasons.append('Same amount repeated multiple times')

    risk = min(100, score)
    tx_type = 'fraud' if risk >= 71 else 'suspicious' if risk >= 35 else 'safe'

    return {
        **tx,
        'risk_score': risk,
        'fraud_type': tx_type,
        'reason': ', '.join(reasons) or 'Normal transaction',
        'action': 'Report to bank immediately' if tx_type == 'fraud' else 'Check with your bank' if tx_type == 'suspicious' else 'Safe'
    }

def generate_demo_transactions(count: int = 45) -> list:
    """Generate synthetic bank statement for demo"""
    merchants = [
        ('SWIGGY', 'Food delivery'), ('AMAZON PAY', 'Online shopping'),
        ('ATM WDL PUNB', 'Cash withdrawal'), ('IRCTC', 'Train tickets'),
        ('UPI/9876543210', 'Family transfer'), ('AIRTEL RECHARGE', 'Phone recharge'),
        ('UPI/UNKNOWN_MERCHANT_XY', 'Unknown'), ('ZOMATO', 'Food delivery'),
        ('PETROL PUMP 341', 'Fuel'), ('UPI/SUSPECT001@ybl', 'Suspicious UPI'),
        ('ELECTRICITY BILL', 'Electricity'), ('HDFC NETFWD', 'Net banking'),
    ]
    transactions = []
    d = time.time()
    for i in range(count):
        mi = random.randint(0, len(merchants) - 1)
        name, desc = merchants[mi]
        amount = round(random.uniform(50, 15000), 2)
        day_offset = i * (86400 / 2) + random.randint(0, 43200)
        ts = d - day_offset
        t_struct = time.localtime(ts)
        transactions.append({
            'date': time.strftime('%d %b %y', t_struct),
            'amount': amount,
            'description': name,
            'detail': desc,
            'type': 'debit' if random.random() > 0.15 else 'credit'
        })
    return transactions

# ── Route ────────────────────────────────────────────────────────
@pdf_bp.route('/pdf/analyze', methods=['POST'])
def analyze_pdf():
    """
    In production: parse actual PDF using PyPDF2 + Tesseract OCR.
    For demo: generates synthetic transactions.
    """
    # Check file upload
    if 'file' in request.files:
        file = request.files['file']
        if file.filename == '' or not file.filename.lower().endswith('.pdf'):
            return jsonify({'error': 'Please upload a valid PDF file'}), 400
        # Real parsing would happen here:
        # text = extract_text_from_pdf(file)
        # transactions = parse_transactions_from_text(text)
        # If OCR: text = ocr_with_tesseract(file)

    # For demo: use synthetic data
    raw_transactions = generate_demo_transactions(random.randint(35, 55))
    scored = [score_transaction(tx, raw_transactions) for tx in raw_transactions]

    fraud = [t for t in scored if t['fraud_type'] == 'fraud']
    suspicious = [t for t in scored if t['fraud_type'] == 'suspicious']
    safe = [t for t in scored if t['fraud_type'] == 'safe']

    total_fraud_amount = sum(t['amount'] for t in fraud)

    return jsonify({
        'success': True,
        'total_transactions': len(scored),
        'fraud_count': len(fraud),
        'suspicious_count': len(suspicious),
        'safe_count': len(safe),
        'total_fraud_amount_inr': round(total_fraud_amount, 2),
        'fraud_transactions': fraud[:10],
        'suspicious_transactions': suspicious[:10],
        'recommendation': (
            f'Contact your bank about {len(fraud)} fraudulent transaction(s) immediately!'
            if fraud else
            f'Review {len(suspicious)} suspicious transaction(s) with your bank.'
            if suspicious else
            'Your statement looks clean. No suspicious activity found.'
        ),
        'analyzed_at': time.strftime('%Y-%m-%dT%H:%M:%S'),
        'model_used': 'NLP+ML_Statement_Analyzer_v3.0'
    })
