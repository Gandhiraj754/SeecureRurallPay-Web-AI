"""
SecureRuralPay — Fraud Detection Route
Uses real trained ML model (fraud_model.pkl + scaler.pkl)
Endpoint: POST /api/transaction/check
"""
"""
Author: Dhanush Sai Gandhiraj Chinta
GitHub: https://github.com/Gandhiraj754
Email:  gandhiraj9609@gmail.com
"""


import os
import json
import logging
import numpy as np
from flask import Blueprint, request, jsonify

logger = logging.getLogger(__name__)

fraud_bp = Blueprint('fraud', __name__)

# ── Load model at startup (not per-request) ──────────────────────
_MODEL_DIR = os.path.join(os.path.dirname(__file__), '..', 'models')

def _load_models():
    try:
        import joblib
        model  = joblib.load(os.path.join(_MODEL_DIR, 'fraud_model.pkl'))
        scaler = joblib.load(os.path.join(_MODEL_DIR, 'scaler.pkl'))
        logger.info("✅ Fraud model loaded from fraud_model.pkl")
        return model, scaler
    except Exception as e:
        logger.warning(f"⚠️  Could not load fraud model: {e} — using simulation fallback")
        return None, None

_fraud_model, _fraud_scaler = _load_models()

# 18 features in the exact order the model was trained on
FEATURES = [
    'log_amount', 'amount_vs_avg', 'time_of_day', 'day_of_week',
    'recipient_known', 'recipient_age_days', 'sender_age_days',
    'freq_1hr', 'freq_24hr', 'device_trusted', 'location_known',
    'distance_km', 'network_type', 'merchant_category',
    'is_first_time', 'amount_rounded', 'behavior_score', 'link_score'
]

def _build_feature_vector(data: dict) -> np.ndarray:
    """Map incoming API fields → 18-feature vector the model expects."""
    amount     = float(data.get('amount', 0))
    avg_amount = float(data.get('amount_30day_avg', 600)) or 600

    log_amount    = float(np.log1p(amount))
    amount_vs_avg = amount / avg_amount
    amount_rounded = int((amount % 1000 < 1) or (amount % 500 < 1))

    vec = [
        log_amount,                                          # log_amount
        amount_vs_avg,                                       # amount_vs_avg
        float(data.get('time_of_day', 12)),                  # time_of_day
        float(data.get('day_of_week', 3)),                   # day_of_week
        float(int(data.get('recipient_known', False))),      # recipient_known
        float(data.get('recipient_age_days', 365)),          # recipient_age_days
        float(data.get('sender_age_days', 365)),             # sender_age_days
        float(data.get('transaction_frequency_1hr', 0)),     # freq_1hr
        float(data.get('transaction_frequency_24hr', 0)),    # freq_24hr
        float(int(data.get('device_trusted', True))),        # device_trusted
        float(int(data.get('location_known', True))),        # location_known
        float(data.get('distance_from_home_km', 0)),         # distance_km
        float(data.get('network_type', 0)),                  # network_type
        float(data.get('merchant_category', 0)),             # merchant_category
        float(int(data.get('is_first_time_recipient', False))),  # is_first_time
        float(amount_rounded),                               # amount_rounded
        float(data.get('behavior_score', 0)),                # behavior_score
        float(data.get('link_risk_score', 0)),               # link_score
    ]
    return np.array(vec, dtype=np.float64).reshape(1, -1)


def _simulate_score(data: dict) -> tuple[float, str]:
    """Fallback simulation if model fails to load."""
    amount = float(data.get('amount', 0))
    avg    = float(data.get('amount_30day_avg', 600)) or 600
    score  = 0.0
    score += min(0.35, (amount / avg - 1) * 0.12) if amount > avg else 0
    score += 0.15 if not data.get('recipient_known') else 0
    score += 0.18 if float(data.get('time_of_day', 12)) < 6 else 0
    score += 0.10 if not data.get('device_trusted', True) else 0
    score += 0.08 if (amount % 1000 < 1 or amount % 500 < 1) else 0
    return min(1.0, score), 'ALLOW'


@fraud_bp.route('/transaction/check', methods=['POST'])
def check_transaction():
    data = request.get_json(silent=True) or {}

    amount    = float(data.get('amount', 0))
    recipient = str(data.get('recipient', ''))

    if amount <= 0:
        return jsonify({'error': 'Amount must be positive'}), 400

    # ── Run real model ───────────────────────────────────────────
    if _fraud_model and _fraud_scaler:
        try:
            X     = _build_feature_vector(data)
            X_sc  = _fraud_scaler.transform(X)
            prob  = float(_fraud_model.predict_proba(X_sc)[0][1])   # fraud probability
        except Exception as e:
            logger.error(f"Model inference error: {e}")
            prob, _ = _simulate_score(data)
    else:
        prob, _ = _simulate_score(data)

    risk_score = round(prob * 100)   # 0–100

    # ── Decision logic ───────────────────────────────────────────
    if risk_score >= 70:
        decision = 'BLOCK'
        flags    = ['high_fraud_probability']
    elif risk_score >= 40:
        decision = 'OTP'
        flags    = ['medium_risk_otp_required']
    else:
        decision = 'ALLOW'
        flags    = []

    # ── Human-readable reasons ───────────────────────────────────
    reasons = []
    amount_vs_avg = amount / (float(data.get('amount_30day_avg', 600)) or 600)
    if amount_vs_avg > 3:
        reasons.append('Amount is much higher than your usual payments')
    if not data.get('recipient_known'):
        reasons.append('Unrecognised recipient')
    if float(data.get('time_of_day', 12)) < 6:
        reasons.append('Late-night transaction')
    if not data.get('device_trusted', True):
        reasons.append('Unrecognised device')
    if amount % 1000 < 1 or amount % 500 < 1:
        reasons.append('Suspiciously round amount')
    if float(data.get('behavior_score', 0)) > 50:
        reasons.append('Unusual typing behaviour detected')

    return jsonify({
        'decision':    decision,
        'risk_score':  risk_score,
        'probability': round(prob, 4),
        'flags':       flags,
        'reasons':     reasons,
        'amount':      amount,
        'recipient':   recipient,
        'model':       'real_ml' if (_fraud_model is not None) else 'simulation'
    })
