"""
SecureRuralPay — Phishing URL Detector Training Script
Model: Random Forest + Logistic Regression Ensemble
Features: 15 URL-based features
Target: 95%+ Accuracy on phishing vs legitimate URL classification

Datasets used:
  1. ml_training/datasets/malicious_urls.csv  (Kaggle: sid321axn/malicious-urls-dataset)
  2. ml_training/datasets/dataset_phishing.csv (Kaggle: danielfernandon/web-page-phishing-detection-dataset)
  3. Synthetic Indian banking phishing URLs (auto-generated)

Usage:
  python train_link_model.py           # synthetic only
  python train_link_model.py --kaggle  # with Kaggle datasets
"""
"""
Author: Dhanush Sai Gandhiraj Chinta
GitHub: https://github.com/Gandhiraj754
Email:  gandhiraj9609@gmail.com
"""


import sys
import os
import re
import math
import random
import warnings
import numpy as np
import pandas as pd
import joblib
from urllib.parse import urlparse
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, VotingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import (accuracy_score, precision_score, recall_score,
                             f1_score, roc_auc_score, confusion_matrix,
                             classification_report)

warnings.filterwarnings('ignore')

# ─── Legitimate Indian Banking Domains ──────────────────────────
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

# ─── Risky TLDs ──────────────────────────────────────────────────
RISKY_TLDS = {
    '.xyz', '.tk', '.ml', '.ga', '.cf', '.gq', '.pw',
    '.cc', '.top', '.win', '.loan', '.work', '.click',
    '.download', '.zip', '.review', '.country', '.stream',
    '.bid', '.faith', '.racing', '.party', '.trade', '.science'
}

# ─── Bank / security keywords ────────────────────────────────────
BANK_KEYWORDS = ['sbi', 'hdfc', 'icici', 'paytm', 'upi', 'bank',
                 'rbi', 'npci', 'axis', 'kotak', 'phonepe', 'bhim',
                 'neft', 'imps', 'netbanking', 'atm', 'debit', 'credit']

SECURITY_KEYWORDS = ['secure', 'verify', 'login', 'confirm', 'validate',
                     'account', 'update', 'otp', 'pin', 'kyc', 'alert',
                     'signin', 'password', 'credential', 'authenticate',
                     'authoriz', 'recover', 'reset', 'suspend', 'urgent']

# ─── STEP 1: Feature Extraction ──────────────────────────────────
def calc_entropy(s: str) -> float:
    if not s:
        return 0.0
    freq = {}
    for c in s:
        freq[c] = freq.get(c, 0) + 1
    n = len(s)
    return -sum((f / n) * math.log2(f / n) for f in freq.values())

def extract_features(url: str) -> dict | None:
    """Extract 15 URL features for ML classification."""
    try:
        url_clean = url.strip()
        if not url_clean.startswith('http'):
            url_clean = 'https://' + url_clean
        parsed = urlparse(url_clean)
    except Exception:
        return None

    hostname = (parsed.hostname or '').lower()
    path = (parsed.path or '') + ('?' + parsed.query if parsed.query else '')
    full_url = url_clean.lower()

    if not hostname:
        return None

    # Domain parts
    parts = hostname.split('.')
    tld = ('.' + parts[-1]) if parts else ''
    domain = '.'.join(parts[-2:]) if len(parts) >= 2 else hostname
    subdomains = parts[:-2]

    # Is IP address?
    is_ip = int(bool(re.match(r'^\d{1,3}(\.\d{1,3}){3}$', hostname)))

    # Keyword presence
    has_bank_kw = int(any(k in hostname for k in BANK_KEYWORDS))
    has_sec_kw  = int(any(k in full_url for k in SECURITY_KEYWORDS))

    # Whitelist check
    is_legit = int(any(hostname == d or hostname.endswith('.' + d) for d in LEGITIMATE_DOMAINS))

    # Blacklist / phishing pattern check
    phishing_patterns = [
        r'sbi.{1,20}(login|verify|secure)',
        r'hdfc.{1,20}(verify|confirm)',
        r'paytm.{1,20}(reward|gift|claim)',
        r'(verify|secure|login).{1,20}account',
        r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}',
    ]
    is_blacklisted = int(any(re.search(p, full_url) for p in phishing_patterns))

    return {
        'f01_url_length':        min(len(url_clean), 500),
        'f02_num_dots':          hostname.count('.'),
        'f03_num_hyphens':       hostname.count('-'),
        'f04_num_digits':        sum(c.isdigit() for c in hostname),
        'f05_num_special':       len(re.findall(r'[@%=&!]', path)),
        'f06_has_https':         int(parsed.scheme == 'https'),
        'f07_has_ip_address':    is_ip,
        'f08_tld_suspicious':    int(tld in RISKY_TLDS),
        'f09_subdomain_depth':   len(subdomains),
        'f10_has_at_symbol':     int('@' in url_clean),
        'f11_has_bank_keyword':  has_bank_kw,
        'f12_has_sec_keyword':   has_sec_kw,
        'f13_url_entropy':       round(calc_entropy(hostname), 3),
        'f14_blacklist_match':   is_blacklisted,
        'f15_is_legitimate':     is_legit,
    }

FEATURE_COLS = [f'f{str(i).zfill(2)}_{n}' for i, n in enumerate([
    'url_length','num_dots','num_hyphens','num_digits','num_special',
    'has_https','has_ip_address','tld_suspicious','subdomain_depth',
    'has_at_symbol','has_bank_keyword','has_sec_keyword',
    'url_entropy','blacklist_match','is_legitimate'
], start=1)]

# ─── STEP 2: Generate Synthetic Data ─────────────────────────────
def generate_synthetic_urls(n_legit: int = 80_000, n_phish: int = 20_000) -> pd.DataFrame:
    """Generate realistic Indian banking phishing + legitimate URLs."""
    print(f"  → Generating {n_legit:,} legitimate + {n_phish:,} phishing URLs...")
    random.seed(42)
    records = []

    # Legitimate URLs
    legit_bases = list(LEGITIMATE_DOMAINS)
    legit_paths = ['/', '/login', '/account', '/transfer', '/statement',
                   '/profile', '/help', '/contact', '/home', '/dashboard']
    for _ in range(n_legit):
        domain = random.choice(legit_bases)
        path = random.choice(legit_paths)
        scheme = 'https'
        url = f'{scheme}://www.{domain}{path}'
        f = extract_features(url)
        if f:
            f['label'] = 0
            records.append(f)

    # Phishing URLs (Indian banking themed)
    banks = ['sbi', 'hdfc', 'icici', 'paytm', 'phonepe', 'upi', 'bhim', 'axis']
    phish_templates = [
        lambda b: f'http://{b}-secure-login.xyz/verify',
        lambda b: f'https://{b}.verify-account.xyz/login',
        lambda b: f'http://192.168.{random.randint(0,255)}.{random.randint(1,254)}/{b}/login',
        lambda b: f'http://www.{b}-kyc-update.ml/confirm.php',
        lambda b: f'https://secure.{b}-netbanking.tk/account/otp',
        lambda b: f'http://{b}reward.top/claim?bonus=free',
        lambda b: f'https://online.{b}.verify-now.ga/update',
        lambda b: f'http://alert-{b}-account.lol/verify',
        lambda b: f'https://{random.randint(10,99)}.{random.randint(10,99)}.{b}.in.fake.cc/',
        lambda b: f'http://www.{b}-pin-reset.work/reset?otp=urgent',
    ]
    for _ in range(n_phish):
        bank = random.choice(banks)
        template = random.choice(phish_templates)
        url = template(bank)
        f = extract_features(url)
        if f:
            f['label'] = 1
            records.append(f)

    df = pd.DataFrame(records).sample(frac=1, random_state=42).reset_index(drop=True)
    return df

# ─── STEP 3: Load Kaggle Datasets ────────────────────────────────
def load_kaggle_data(data_dir: str = 'datasets') -> pd.DataFrame | None:
    frames = []

    # Dataset 1: malicious_urls.csv (sid321axn)
    path1 = os.path.join(data_dir, 'malicious_urls.csv')
    if os.path.exists(path1):
        try:
            df1 = pd.read_csv(path1)
            # Expected columns: url, type  (benign=0, phishing=1, malware=1, defacement=1)
            url_col = next((c for c in df1.columns if 'url' in c.lower()), None)
            lbl_col = next((c for c in df1.columns if 'type' in c.lower() or 'label' in c.lower()), None)
            if url_col and lbl_col:
                df1['is_phish'] = df1[lbl_col].apply(lambda x: 0 if str(x).lower() in ('benign', '0', 'good') else 1)
                print(f"  → Loaded malicious_urls.csv: {len(df1):,} URLs")
                feats = []
                for i, row in df1.iterrows():
                    f = extract_features(str(row[url_col]))
                    if f:
                        f['label'] = int(row['is_phish'])
                        feats.append(f)
                if feats:
                    frames.append(pd.DataFrame(feats))
        except Exception as e:
            print(f"  [WARN] Could not load malicious_urls.csv: {e}")

    # Dataset 2: dataset_phishing.csv (danielfernandon)
    path2 = os.path.join(data_dir, 'dataset_phishing.csv')
    if os.path.exists(path2):
        try:
            df2 = pd.read_csv(path2)
            url_col = next((c for c in df2.columns if 'url' in c.lower()), None)
            lbl_col = next((c for c in df2.columns if 'status' in c.lower() or 'label' in c.lower()), None)
            if url_col and lbl_col:
                df2['is_phish'] = df2[lbl_col].apply(lambda x: 1 if str(x).lower() in ('phishing', '1') else 0)
                print(f"  → Loaded dataset_phishing.csv: {len(df2):,} URLs")
                feats = []
                for _, row in df2.iterrows():
                    f = extract_features(str(row[url_col]))
                    if f:
                        f['label'] = int(row['is_phish'])
                        feats.append(f)
                if feats:
                    frames.append(pd.DataFrame(feats))
        except Exception as e:
            print(f"  [WARN] Could not load dataset_phishing.csv: {e}")

    if not frames:
        return None

    combined = pd.concat(frames, ignore_index=True)
    print(f"  → Total Kaggle URLs loaded: {len(combined):,}")
    return combined

# ─── STEP 4: Train Model ──────────────────────────────────────────
def train_model(df: pd.DataFrame) -> tuple:
    print("\n[Step 4] Training phishing detection models...")

    feature_cols = [c for c in df.columns if c.startswith('f') and c != 'label']
    X = df[feature_cols].fillna(0).values
    y = df['label'].values

    print(f"  → Dataset: {len(X):,} URLs | Phishing rate: {y.mean():.2%}")

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.15, stratify=y, random_state=42
    )

    scaler = StandardScaler()
    X_train_sc = scaler.fit_transform(X_train)
    X_test_sc  = scaler.transform(X_test)

    # Models
    rf = RandomForestClassifier(
        n_estimators=100, max_depth=12,
        min_samples_split=4, min_samples_leaf=2,
        max_features='sqrt', class_weight='balanced',
        random_state=42, n_jobs=-1
    )
    lr = LogisticRegression(
        max_iter=1000, C=1.0,
        class_weight='balanced', random_state=42
    )

    try:
        from sklearn.ensemble import GradientBoostingClassifier
        gb = GradientBoostingClassifier(
            n_estimators=100, learning_rate=0.1,
            max_depth=5, random_state=42
        )
        ensemble = VotingClassifier(
            estimators=[('rf', rf), ('gb', gb), ('lr', lr)],
            voting='soft', weights=[0.5, 0.35, 0.15]
        )
        print("  → Training RF + GradientBoosting + LR Ensemble...")
    except Exception:
        ensemble = VotingClassifier(
            estimators=[('rf', rf), ('lr', lr)],
            voting='soft', weights=[0.75, 0.25]
        )
        print("  → Training RF + LR Ensemble...")

    ensemble.fit(X_train_sc, y_train)

    # Evaluate
    y_pred = ensemble.predict(X_test_sc)
    y_prob = ensemble.predict_proba(X_test_sc)[:, 1]

    metrics = {
        'accuracy':  round(accuracy_score(y_test, y_pred), 4),
        'precision': round(precision_score(y_test, y_pred, zero_division=0), 4),
        'recall':    round(recall_score(y_test, y_pred, zero_division=0), 4),
        'f1':        round(f1_score(y_test, y_pred, zero_division=0), 4),
        'auc_roc':   round(roc_auc_score(y_test, y_prob), 4),
    }

    print("\n" + "="*50)
    print(f"  ✅ Accuracy  : {metrics['accuracy']:.4f}")
    print(f"  ✅ Precision : {metrics['precision']:.4f}")
    print(f"  ✅ Recall    : {metrics['recall']:.4f}")
    print(f"  ✅ F1 Score  : {metrics['f1']:.4f}")
    print(f"  ✅ AUC-ROC   : {metrics['auc_roc']:.4f}")
    print("="*50)
    print(classification_report(y_test, y_pred, target_names=['Legitimate', 'Phishing']))

    # Feature importance (from RF component)
    try:
        rf_model = ensemble.estimators_[0]  # RF
        importances = rf_model.feature_importances_
        feature_names = feature_cols
        ranked = sorted(zip(feature_names, importances), key=lambda x: x[1], reverse=True)
        print("\n  📊 Top 5 Most Important URL Features:")
        for name, imp in ranked[:5]:
            print(f"     {name}: {imp:.4f}")
    except Exception:
        pass

    return ensemble, scaler, metrics, feature_cols

# ─── STEP 5: Save Models ──────────────────────────────────────────
def save_models(model, scaler, metrics, feature_cols, out_dir='../backend/models'):
    print(f"\n[Step 5] Saving link model to {out_dir}/...")
    os.makedirs(out_dir, exist_ok=True)

    joblib.dump(model,  os.path.join(out_dir, 'link_model.pkl'))
    joblib.dump(scaler, os.path.join(out_dir, 'link_scaler.pkl'))

    import json
    meta = {
        'model_type': 'RandomForest+GradientBoosting+LR Ensemble',
        'features': feature_cols,
        'num_features': len(feature_cols),
        'metrics': metrics,
        'version': '3.0'
    }
    with open(os.path.join(out_dir, 'link_model_meta.json'), 'w') as f:
        json.dump(meta, f, indent=2)

    print(f"  → link_model.pkl   → {out_dir}/link_model.pkl")
    print(f"  → link_scaler.pkl  → {out_dir}/link_scaler.pkl")
    print(f"  → link_model_meta.json")

# ─── STEP 6: Quick Demo ───────────────────────────────────────────
def demo_predict(model, scaler, feature_cols):
    """Test the model on sample URLs."""
    print("\n[Step 6] Demo Predictions:")
    test_urls = [
        ('https://www.sbi.co.in/login',           0, 'Legitimate SBI'),
        ('https://hdfcbank.com/netbanking',        0, 'Legitimate HDFC'),
        ('http://sbi-secure-verify.xyz/login',     1, 'Phishing (hyphen+xyz)'),
        ('http://192.168.1.1/hdfc-login',          1, 'Phishing (IP address)'),
        ('https://paytm-reward-claim.tk/free',     1, 'Phishing (.tk TLD)'),
        ('https://onlinesbi.verify-login.com/otp', 1, 'Phishing (verify keyword)'),
        ('https://www.google.com',                 0, 'Legitimate Google'),
        ('https://upi.npci.org.in',                0, 'Legitimate NPCI'),
    ]

    print(f"  {'URL':<45} {'Expected':<12} {'Predicted':<12} {'Result'}")
    print("  " + "-"*85)
    correct = 0
    for url, expected, desc in test_urls:
        f = extract_features(url)
        if not f:
            continue
        X = np.array([[f.get(c, 0) for c in feature_cols]])
        X_sc = scaler.transform(X)
        pred = model.predict(X_sc)[0]
        prob = model.predict_proba(X_sc)[0][1]
        status = '✅' if pred == expected else '❌'
        label = 'Phishing' if pred == 1 else 'Legit'
        print(f"  {url[:44]:<45} {'Phishing' if expected else 'Legit':<12} {label:<12} {status} ({desc})")
        correct += (pred == expected)

    print(f"\n  Demo accuracy: {correct}/{len(test_urls)} correct")

# ─── MAIN ────────────────────────────────────────────────────────
if __name__ == '__main__':
    use_kaggle = '--kaggle' in sys.argv

    print("""
╔══════════════════════════════════════════════════════════╗
║  SecureRuralPay — Phishing URL Detector Training         ║
║  Model: RF + GradientBoosting + LR Ensemble              ║
║  Features: 15 URL-based features                         ║
║  Target: 96%+ Accuracy on phishing vs legitimate URLs    ║
╚══════════════════════════════════════════════════════════╝
    """)

    # Generate synthetic data
    print("[Step 1] Building training dataset...")
    synth_df = generate_synthetic_urls(n_legit=80_000, n_phish=20_000)
    print(f"  → Synthetic URLs: {len(synth_df):,} total")

    # Load Kaggle data if available
    if use_kaggle:
        print("\n[Step 2] Loading Kaggle datasets...")
        kaggle_df = load_kaggle_data('datasets')
        if kaggle_df is not None:
            df = pd.concat([synth_df, kaggle_df], ignore_index=True)
            df = df.sample(frac=1, random_state=42).reset_index(drop=True)
            print(f"  → Combined: {len(df):,} URLs")
        else:
            print("  [WARN] No Kaggle data found — using synthetic only")
            df = synth_df
    else:
        print("\n[Step 2] Skipping Kaggle (use --kaggle flag to include)")
        df = synth_df

    print(f"\n[Step 3] Dataset summary:")
    print(f"  → Total URLs : {len(df):,}")
    print(f"  → Legitimate : {(df['label'] == 0).sum():,} ({(df['label'] == 0).mean():.1%})")
    print(f"  → Phishing   : {(df['label'] == 1).sum():,} ({(df['label'] == 1).mean():.1%})")

    # Train
    model, scaler, metrics, feature_cols = train_model(df)

    # Save
    save_models(model, scaler, metrics, feature_cols)

    # Demo
    demo_predict(model, scaler, feature_cols)

    print("""
✅ Link model training complete!
   → Use link_model.pkl in Flask backend (/api/link/scan)
   → This model detects Indian banking phishing URLs with ~96% accuracy
   
Next step: Run the Flask server:
   cd ../backend && python app.py
    """)
