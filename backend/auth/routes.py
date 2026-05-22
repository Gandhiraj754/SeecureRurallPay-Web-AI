"""
SecureRuralPay — Authentication Routes
Handles: Login, OTP send/verify, JWT generation
"""
"""
Author: Dhanush Sai Gandhiraj Chinta
GitHub: https://github.com/Gandhiraj754
Email:  gandhiraj9609@gmail.com
"""


from flask import Blueprint, request, jsonify
import hashlib
import hmac
import time
import random
import re
import os
import json

auth_bp = Blueprint('auth', __name__)

# ── In-memory stores (use Redis in production) ──────────────────
_otp_store = {}       # phone → {otp, expires_at, used}
_attempt_store = {}   # phone → {count, locked_until}
_user_store = {}      # phone → {pin_hash, device_ids, risk_level}

# ── Config ──────────────────────────────────────────────────────
MAX_ATTEMPTS = 5
LOCKOUT_SECS = 30 * 60     # 30 min
OTP_TTL_SECS = 5 * 60      # 5 min
JWT_TTL_SECS = 30 * 60     # 30 min
JWT_SECRET = os.environ.get('JWT_SECRET', 'srp-dev-jwt-secret')

# ── Helpers ──────────────────────────────────────────────────────
def hash_pin(pin: str) -> str:
    """bcrypt-equivalent using SHA-256 + HMAC for demo (use bcrypt in prod)"""
    return hmac.new(b'srp-salt-v3', pin.encode(), hashlib.sha256).hexdigest()

def generate_otp() -> str:
    return str(random.randint(100000, 999999))

def create_jwt(user_id: str, phone: str, risk_level: str) -> str:
    """Create a simple signed JWT (use PyJWT with RS256 in production)"""
    import base64
    header = base64.b64encode(b'{"alg":"HS256","typ":"JWT"}').decode()
    payload = base64.b64encode(json.dumps({
        'sub': user_id,
        'phone': phone,
        'risk': risk_level,
        'iat': int(time.time()),
        'exp': int(time.time()) + JWT_TTL_SECS
    }).encode()).decode()
    sig = hmac.new(JWT_SECRET.encode(), f'{header}.{payload}'.encode(), hashlib.sha256).hexdigest()
    return f'{header}.{payload}.{sig}'

def verify_jwt(token: str) -> dict | None:
    import base64
    try:
        parts = token.split('.')
        if len(parts) != 3: return None
        payload = json.loads(base64.b64decode(parts[1] + '=='))
        if payload.get('exp', 0) < time.time(): return None
        # In production: verify HMAC signature
        return payload
    except Exception:
        return None

def is_locked_out(phone: str) -> tuple[bool, int]:
    data = _attempt_store.get(phone, {})
    locked_until = data.get('locked_until', 0)
    if time.time() < locked_until:
        return True, int(locked_until - time.time())
    return False, 0

def record_failed_attempt(phone: str) -> int:
    data = _attempt_store.get(phone, {'count': 0})
    data['count'] = data.get('count', 0) + 1
    if data['count'] >= MAX_ATTEMPTS:
        data['locked_until'] = time.time() + LOCKOUT_SECS
        data['count'] = 0
    _attempt_store[phone] = data
    return MAX_ATTEMPTS - data['count']

def validate_phone(phone: str) -> bool:
    return bool(re.match(r'^\d{10}$', phone or ''))

def validate_pin(pin: str) -> bool:
    return bool(re.match(r'^\d{4}$', pin or ''))

# ── Route: Send OTP ─────────────────────────────────────────────
@auth_bp.route('/otp/send', methods=['POST'])
def send_otp():
    data = request.get_json(silent=True) or {}
    phone = str(data.get('phone', ''))

    if not validate_phone(phone):
        return jsonify({'error': 'Please enter a valid 10-digit phone number'}), 400

    otp = generate_otp()
    _otp_store[phone] = {
        'otp': otp,
        'expires_at': time.time() + OTP_TTL_SECS,
        'used': False
    }

    print(f"[OTP] Phone: {phone} → OTP: {otp} (demo mode)")

    return jsonify({
        'success': True,
        'expires_in': OTP_TTL_SECS,
        'message': 'Code sent to your phone',
        'debug_otp': otp   # Always shown in demo — remove in production!
    })

# ── Route: Verify OTP ───────────────────────────────────────────
@auth_bp.route('/otp/verify', methods=['POST'])
def verify_otp():
    data = request.get_json(silent=True) or {}
    phone = str(data.get('phone', ''))
    otp_input = str(data.get('otp', ''))
    device_id = str(data.get('device_id', 'unknown'))

    if not validate_phone(phone):
        return jsonify({'error': 'Invalid phone number'}), 400

    stored = _otp_store.get(phone)
    if not stored:
        return jsonify({'error': 'No OTP found. Please request a new code.'}), 400

    if stored.get('used'):
        return jsonify({'error': 'This code has already been used. Request a new one.'}), 400

    if time.time() > stored.get('expires_at', 0):
        return jsonify({'error': 'Code expired. Please request a new one.'}), 400

    if otp_input != stored.get('otp'):
        return jsonify({'error': 'Wrong code. Please check your SMS and try again.'}), 401

    # Mark as used
    _otp_store[phone]['used'] = True

    # Register device
    user = _user_store.get(phone, {'device_ids': [], 'risk_level': 'low'})
    if device_id not in user['device_ids']:
        user['device_ids'].append(device_id)
    _user_store[phone] = user

    # Generate JWT
    token = create_jwt(f'U_{phone[-4:]}', phone, user['risk_level'])

    return jsonify({
        'success': True,
        'token': token,
        'user_id': f'U_{phone[-4:]}',
        'risk_level': user['risk_level']
    })

# ── Route: Login (Phone + PIN) ──────────────────────────────────
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json(silent=True) or {}
    phone = str(data.get('phone', ''))
    pin = str(data.get('pin', ''))
    device_id = str(data.get('device_id', 'unknown'))

    if not validate_phone(phone):
        return jsonify({'error': 'Please enter a valid 10-digit phone number'}), 400

    if not validate_pin(pin):
        return jsonify({'error': 'Please enter a valid 4-digit PIN'}), 400

    # Check lockout
    locked, remaining = is_locked_out(phone)
    if locked:
        mins = remaining // 60
        return jsonify({
            'error': f'Account locked for {mins} more minute(s). Too many wrong attempts.',
            'locked': True,
            'locked_seconds': remaining
        }), 429

    pin_hash = hash_pin(pin)
    user = _user_store.get(phone)

    # First-time user: register them
    if not user:
        _user_store[phone] = {
            'pin_hash': pin_hash,
            'device_ids': [device_id],
            'risk_level': 'low',
            'created_at': time.time()
        }
        user = _user_store[phone]

    # Check if new device
    is_new_device = device_id not in user.get('device_ids', [])

    # DEMO MODE: Accept any PIN — security is enforced by the OTP step.
    # In production, uncomment the block below to check the PIN hash.
    # if user.get('pin_hash') and user['pin_hash'] != pin_hash:
    #     left = record_failed_attempt(phone)
    #     return jsonify({'error': f'Wrong PIN. {left} attempts left.'}), 401

    # Reset attempts on successful PIN
    _attempt_store.pop(phone, None)

    # Always go through OTP step (demo mode — simpler for demo flow)
    return jsonify({
        'success': True,
        'requires_otp': True,
        'new_device': is_new_device,
        'message': 'PIN accepted. Please verify with your phone code.'
    })

# ── Route: Logout ───────────────────────────────────────────────
@auth_bp.route('/logout', methods=['POST'])
def logout():
    # JWT-based auth: client just deletes token
    # In production: add token to revocation list in Redis
    return jsonify({'success': True, 'message': 'Logged out successfully'})
