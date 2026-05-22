"""
SecureRuralPay — Phishing Link Scanner Route
Uses real trained ML model (link_model.pkl + link_scaler.pkl)
Endpoint: POST /api/link/scan
"""
"""
Author: Dhanush Sai Gandhiraj Chinta
GitHub: https://github.com/Gandhiraj754
Email:  gandhiraj9609@gmail.com
"""


import os
import re
import math
import json
import logging
import numpy as np
from urllib.parse import urlparse
from flask import Blueprint, request, jsonify

logger = logging.getLogger(__name__)

link_bp = Blueprint('link', __name__)

# ── Load model at startup ────────────────────────────────────────
_MODEL_DIR = os.path.join(os.path.dirname(__file__), '..', 'models')

def _load_link_models():
    try:
        import joblib
        model  = joblib.load(os.path.join(_MODEL_DIR, 'link_model.pkl'))
        scaler = joblib.load(os.path.join(_MODEL_DIR, 'link_scaler.pkl'))
        # Load feature column names from metadata
        meta_path = os.path.join(_MODEL_DIR, 'link_model_meta.json')
        with open(meta_path) as f:
            meta = json.load(f)
        feature_cols = meta.get('features', [])
        logger.info(f"✅ Link model loaded ({len(feature_cols)} features)")
        return model, scaler, feature_cols
    except Exception as e:
        logger.warning(f"⚠️  Could not load link model: {e} — using simulation fallback")
        return None, None, []

_link_model, _link_scaler, _link_features = _load_link_models()

# ── Domain knowledge ─────────────────────────────────────────────
LEGITIMATE_DOMAINS = {
    'sbi.co.in', 'onlinesbi.sbi', 'onlinesbi.com',
    'hdfcbank.com', 'netbanking.hdfcbank.com',
    'icicibank.com', 'axisbank.com', 'axisbank.in',
    'paytm.com', 'paytmbank.com', 'phonepe.com',
    'gpay.app', 'upi.npci.org.in', 'npci.org.in',
    'rbi.org.in', 'bhimupi.org.in', 'google.com',
    'youtube.com', 'wikipedia.org', 'india.gov.in',
    'amazon.in', 'amazon.com', 'flipkart.com',
    'irctc.co.in', 'uidai.gov.in', 'digilocker.gov.in',
    'incometax.gov.in', 'gst.gov.in', 'epfindia.gov.in'
}

RISKY_TLDS = {
    '.xyz', '.tk', '.ml', '.ga', '.cf', '.gq', '.pw',
    '.cc', '.top', '.win', '.loan', '.work', '.click',
    '.download', '.zip', '.review', '.country', '.stream',
    '.bid', '.faith', '.racing', '.party', '.trade', '.science'
}

BANK_KEYWORDS = ['sbi', 'hdfc', 'icici', 'paytm', 'upi', 'bank',
                 'rbi', 'npci', 'axis', 'kotak', 'phonepe', 'bhim',
                 'neft', 'imps', 'netbanking', 'atm', 'debit', 'credit']

SECURITY_KEYWORDS = ['secure', 'verify', 'login', 'confirm', 'validate',
                     'account', 'update', 'otp', 'pin', 'kyc', 'alert',
                     'signin', 'password', 'credential', 'authenticate',
                     'authoriz', 'recover', 'reset', 'suspend', 'urgent']

PHISHING_PATTERNS = [
    r'sbi.{1,20}(login|verify|secure)',
    r'hdfc.{1,20}(verify|confirm)',
    r'paytm.{1,20}(reward|gift|claim)',
    r'(verify|secure|login).{1,20}account',
    r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}',
]


def _entropy(s: str) -> float:
    if not s:
        return 0.0
    freq = {}
    for c in s:
        freq[c] = freq.get(c, 0) + 1
    n = len(s)
    return -sum((f / n) * math.log2(f / n) for f in freq.values())


def _extract_features(url: str) -> dict | None:
    """Extract the same 15 features used during training."""
    try:
        url_clean = url.strip()
        if not url_clean.startswith('http'):
            url_clean = 'https://' + url_clean
        parsed = urlparse(url_clean)
    except Exception:
        return None

    hostname = (parsed.hostname or '').lower()
    path     = (parsed.path or '') + ('?' + parsed.query if parsed.query else '')
    full_url = url_clean.lower()

    if not hostname:
        return None

    parts     = hostname.split('.')
    tld       = ('.' + parts[-1]) if parts else ''
    subdomains= parts[:-2]

    is_ip      = int(bool(re.match(r'^\d{1,3}(\.\d{1,3}){3}$', hostname)))
    has_bank   = int(any(k in hostname for k in BANK_KEYWORDS))
    has_sec    = int(any(k in full_url for k in SECURITY_KEYWORDS))
    is_legit   = int(any(hostname == d or hostname.endswith('.' + d) for d in LEGITIMATE_DOMAINS))
    is_black   = int(any(re.search(p, full_url) for p in PHISHING_PATTERNS))

    return {
        'f01_url_length':       min(len(url_clean), 500),
        'f02_num_dots':         hostname.count('.'),
        'f03_num_hyphens':      hostname.count('-'),
        'f04_num_digits':       sum(c.isdigit() for c in hostname),
        'f05_num_special':      len(re.findall(r'[@%=&!]', path)),
        'f06_has_https':        int(parsed.scheme == 'https'),
        'f07_has_ip_address':   is_ip,
        'f08_tld_suspicious':   int(tld in RISKY_TLDS),
        'f09_subdomain_depth':  len(subdomains),
        'f10_has_at_symbol':    int('@' in url_clean),
        'f11_has_bank_keyword': has_bank,
        'f12_has_sec_keyword':  has_sec,
        'f13_url_entropy':      round(_entropy(hostname), 3),
        'f14_blacklist_match':  is_black,
        'f15_is_legitimate':    is_legit,
    }


def _build_feature_array(features: dict, feature_cols: list) -> np.ndarray:
    """Build ordered numpy array matching training feature order."""
    return np.array([features.get(c, 0) for c in feature_cols], dtype=np.float64).reshape(1, -1)


def _simulate_verdict(features: dict) -> tuple[float, str]:
    """Simple fallback if model fails."""
    score = 0.0
    score += 0.40 if features.get('f14_blacklist_match') else 0
    score += 0.25 if features.get('f07_has_ip_address') else 0
    score += 0.20 if features.get('f08_tld_suspicious') else 0
    score += 0.15 if features.get('f03_num_hyphens', 0) > 1 else 0
    score -= 0.30 if features.get('f15_is_legitimate') else 0
    return max(0.0, min(1.0, score)), 'simulation'


@link_bp.route('/link/scan', methods=['POST'])
def scan_link():
    data = request.get_json(silent=True) or {}
    url  = str(data.get('url', '')).strip()

    if not url:
        return jsonify({'error': 'URL is required'}), 400

    # Extract features
    features = _extract_features(url)
    if not features:
        return jsonify({'error': 'Invalid URL format'}), 400

    # ── Run real model ───────────────────────────────────────────
    model_used = 'simulation'
    if _link_model and _link_scaler and _link_features:
        try:
            X    = _build_feature_array(features, _link_features)
            X_sc = _link_scaler.transform(X)
            prob = float(_link_model.predict_proba(X_sc)[0][1])   # phishing prob
            model_used = 'real_ml'
        except Exception as e:
            logger.error(f"Link model inference error: {e}")
            prob, model_used = _simulate_verdict(features)
    else:
        prob, model_used = _simulate_verdict(features)

    risk_score = round(prob * 100)

    # ── Verdict ──────────────────────────────────────────────────
    if features.get('f15_is_legitimate'):
        verdict = 'safe'
        risk_score = min(risk_score, 15)   # can't be high if whitelisted
    elif risk_score >= 60:
        verdict = 'danger'
    elif risk_score >= 30:
        verdict = 'warn'
    else:
        verdict = 'safe'

    # ── Why? ─────────────────────────────────────────────────────
    reasons = []
    if features.get('f07_has_ip_address'):
        reasons.append('URL uses an IP address instead of a domain name — classic phishing trick')
    if features.get('f08_tld_suspicious'):
        reasons.append('Suspicious domain extension (e.g., .xyz, .tk, .ml) — often used by scammers')
    if features.get('f14_blacklist_match'):
        reasons.append('URL matches known Indian banking phishing patterns')
    if features.get('f03_num_hyphens', 0) > 1:
        reasons.append('Multiple hyphens in domain — fake bank websites often use these')
    if features.get('f12_has_sec_keyword') and not features.get('f15_is_legitimate'):
        reasons.append('Contains urgency keywords (verify, OTP, login) on an untrusted site')
    if features.get('f15_is_legitimate'):
        reasons.append('Domain belongs to a verified legitimate Indian banking service')
    if not reasons:
        reasons.append('URL appears safe based on AI analysis')

    # ── Feature summary for UI display ───────────────────────────
    display_features = [
        {'name': 'HTTPS Secure',      'value': '✅ Yes' if features['f06_has_https']      else '❌ No',  'risk': not features['f06_has_https']},
        {'name': 'IP Address URL',     'value': '❌ Yes' if features['f07_has_ip_address'] else '✅ No',  'risk': bool(features['f07_has_ip_address'])},
        {'name': 'Suspicious TLD',     'value': '❌ Yes' if features['f08_tld_suspicious'] else '✅ No',  'risk': bool(features['f08_tld_suspicious'])},
        {'name': 'Hyphens in domain',  'value': str(features['f03_num_hyphens']),                          'risk': features['f03_num_hyphens'] > 1},
        {'name': 'Phishing pattern',   'value': '❌ Found' if features['f14_blacklist_match'] else '✅ None', 'risk': bool(features['f14_blacklist_match'])},
        {'name': 'Verified domain',    'value': '✅ Yes' if features['f15_is_legitimate']  else '❌ No',  'risk': not features['f15_is_legitimate']},
        {'name': 'Bank keyword',       'value': '⚠️ Yes' if features['f11_has_bank_keyword'] else 'No',   'risk': bool(features['f11_has_bank_keyword']) and not features['f15_is_legitimate']},
        {'name': 'URL Entropy',        'value': str(features['f13_url_entropy']),                          'risk': features['f13_url_entropy'] > 4.0},
    ]

    # Message
    messages = {
        'safe':   '✅ This link is safe. You can click it.',
        'warn':   '⚠️ This link looks suspicious. Please be careful.',
        'danger': '🚫 DANGER! This looks like a phishing website. Do NOT click!'
    }

    return jsonify({
        'url':       url,
        'verdict':   verdict,
        'risk_score': risk_score,
        'probability': round(prob, 4),
        'message':   messages[verdict],
        'reasons':   reasons,
        'features':  display_features,
        'model':     model_used
    })
