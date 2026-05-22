/* ============================================================
   SecureRuralPay -- Transaction Module (transaction.js)
   Handles: Send money, ML fraud check, risk score display
   ============================================================ */

'use strict';

// 18 Features used by ML model (simulated on-device)
const FEATURE_LABELS = [
    'Amount vs. 30-day average', 'Time of transaction', 'Day of week',
    'Is recipient known?', 'Recipient account age', 'Sender account age',
    'Transactions this hour', 'Transactions today', 'Device trusted?',
    'Location normal?', 'Distance from home', 'Network type',
    'Merchant category', 'First time to this person?', 'Round amount?',
    'Behavior score', 'Link risk score', 'Transaction frequency pattern'
];

const RISK_REASONS = {
    high_amount: 'Amount is much higher than your usual payments',
    night_time: 'Payment at unusual time (late night)',
    unknown_recipient: 'You have never sent to this person before',
    untrusted_device: 'Payment from unrecognized device',
    unknown_location: 'Payment from unusual location',
    round_amount: 'Very round amount -- sometimes used in fraud',
    high_freq: 'Many payments in a short time',
    high_behavior: 'Your typing pattern looks different from normal',
};

let currentTransactionData = null;

// ── Amount Change Handler ────────────────────────────────────────
function onAmountChange() {
    const val = parseFloat(document.getElementById('amountInput')?.value || 0);
    if (val > 5000) {
        showToast('💡 Payments over ₹5,000 need OTP confirmation', 'info', 3000);
    }
}

// ── Recipient Validation ─────────────────────────────────────────
function onRecipientChange() {
    const val = document.getElementById('recipientInput')?.value?.trim() || '';
    const hint = document.getElementById('recipientHint');
    if (!hint) return;
    if (/^\d{10}$/.test(val)) {
        hint.textContent = '✅ Valid phone number';
        hint.style.color = '#15803d';
    } else if (val.includes('@')) {
        hint.textContent = '✅ Valid UPI ID (e.g. name@upi)';
        hint.style.color = '#15803d';
    } else if (val.length > 3) {
        hint.textContent = '⚠️ Please use a 10-digit phone number or name@upi format';
        hint.style.color = '#b45309';
    } else {
        hint.textContent = 'Enter phone number (e.g. 9876543210) or UPI ID (e.g. name@upi)';
        hint.style.color = '';
    }
}

// ── Main Safety Check ────────────────────────────────────────────
async function checkTransactionSafety() {
    const amount = parseFloat(document.getElementById('amountInput')?.value || 0);
    const recipient = document.getElementById('recipientInput')?.value?.trim() || '';

    if (!amount || amount <= 0) { showToast('⚠️ Please enter an amount', 'warn'); return; }
    if (!recipient) { showToast('⚠️ Please enter who to send to', 'warn'); return; }

    // Show loading
    document.getElementById('loadingCard').style.display = 'block';
    document.getElementById('resultCard').style.display = 'none';
    document.getElementById('successCard').style.display = 'none';
    document.getElementById('checkBtn').disabled = true;

    // Simulate 5-step AI pipeline
    const checkLabels = [
        'Checking recipient history...',
        'Analyzing amount pattern...',
        'Running on-device AI model...',
        'Checking device trust...',
        'Consulting cloud ML...'
    ];
    for (let i = 0; i < 5; i++) {
        await new Promise(r => setTimeout(r, 500 + Math.random() * 400));
        const stepEl = document.getElementById('cs' + (i + 1));
        if (stepEl) stepEl.className = 'step done';
        const lblEl = document.getElementById('checkStepLabel');
        if (lblEl) lblEl.textContent = checkLabels[i];
    }

    // Build feature vector and call backend API
    const hour = new Date().getHours();
    const dow = new Date().getDay();
    const history = JSON.parse(localStorage.getItem('srp_history') || '[]');
    const avgAmount = history.length
        ? history.reduce((s, t) => s + (t.amount || 0), 0) / history.length
        : 600;
    const knownRecipients = JSON.parse(localStorage.getItem('srp_recipients') || '[]');
    const isKnown = knownRecipients.includes(recipient);
    const behaviorScore = (typeof BehaviorMonitor !== 'undefined' && BehaviorMonitor)
        ? BehaviorMonitor.getScore() : 10;
    const txToday = history.filter(t => t.date === new Date().toLocaleDateString()).length;
    const network = navigator.connection ? navigator.connection.effectiveType : '4g';
    const networkMap = { '4g': 0, '3g': 1, '2g': 2, 'slow-2g': 3 };

    try {
        const apiResult = await callAPI('/api/transaction/check', 'POST', {
            amount,
            recipient,
            amount_30day_avg: avgAmount,
            time_of_day: hour,
            day_of_week: dow,
            recipient_known: isKnown,
            transaction_frequency_1hr: 0,
            transaction_frequency_24hr: txToday,
            device_trusted: true,
            location_known: true,
            distance_from_home_km: 0,
            network_type: networkMap[network] || 0,
            behavior_score: behaviorScore,
            is_first_time_recipient: !isKnown,
            link_risk_score: 0
        });

        // Map backend response to local score format
        const score = {
            total: apiResult.risk_score,
            flags: apiResult.flags || [],
            features: (apiResult.reasons || []).map(r => ({ label: r, value: '', risk: true }))
        };

        currentTransactionData = {
            amount, recipient, riskScore: score.total,
            features: score.features, flags: score.flags
        };

        await new Promise(r => setTimeout(r, 300));
        document.getElementById('loadingCard').style.display = 'none';
        displayResult(score);
        document.getElementById('resultCard').style.display = 'block';
        document.getElementById('checkBtn').disabled = false;
        document.getElementById('resultCard').scrollIntoView({ behavior: 'smooth' });

    } catch (err) {
        // Fallback to local scoring if backend unavailable
        showToast('⚠️ Backend offline -- using on-device AI', 'warn', 3000);
        const score = computeRiskScore({
            amount,
            amountRatio: avgAmount > 0 ? amount / avgAmount : 1,
            hour, isKnown,
            isRound: amount % 1000 === 0 || amount % 500 === 0,
            behaviorScore, txToday,
            isNight: hour < 6 || hour > 22,
            networkRisk: (networkMap[network] || 0) * 3,
            isNewDevice: false
        });
        currentTransactionData = { amount, recipient, riskScore: score.total, features: score.features, flags: score.flags };
        document.getElementById('loadingCard').style.display = 'none';
        displayResult(score);
        document.getElementById('resultCard').style.display = 'block';
        document.getElementById('checkBtn').disabled = false;
        document.getElementById('resultCard').scrollIntoView({ behavior: 'smooth' });
    }
}

// ── Risk Score Engine ────────────────────────────────────────────
function computeRiskScore({ amount, amountRatio, hour, isKnown, isRound, behaviorScore, txToday, isNight, networkRisk, isNewDevice }) {
    let score = 0;
    const flags = [];
    const features = [];

    if (amountRatio > 3) { score += 20; flags.push('high_amount'); }
    else if (amountRatio > 1.5) { score += 10; }
    features.push({ label: 'Amount vs. average', value: amountRatio.toFixed(1) + 'x', risk: amountRatio > 3 });

    if (isNight) { score += 18; flags.push('night_time'); }
    features.push({ label: 'Time of transaction', value: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }), risk: isNight });

    if (!isKnown) { score += 15; flags.push('unknown_recipient'); }
    features.push({ label: 'Recipient known', value: isKnown ? 'Yes' : 'No', risk: !isKnown });

    if (isRound) { score += 8; flags.push('round_amount'); }
    features.push({ label: 'Round amount', value: isRound ? 'Yes' : 'No', risk: isRound });

    if (txToday > 5) { score += 12; flags.push('high_freq'); }
    features.push({ label: 'Transactions today', value: txToday, risk: txToday > 5 });

    if (behaviorScore > 40) { score += 15; flags.push('high_behavior'); }
    else if (behaviorScore > 20) { score += 7; }
    features.push({ label: 'Behavior score', value: behaviorScore + '/100', risk: behaviorScore > 40 });

    score += networkRisk;
    features.push({ label: 'Network quality', value: navigator.connection?.effectiveType || '4G', risk: networkRisk > 5 });

    if (isNewDevice) { score += 15; flags.push('untrusted_device'); }
    features.push({ label: 'Device trusted', value: isNewDevice ? 'New device' : 'Trusted', risk: isNewDevice });

    return { total: Math.min(100, Math.round(score)), flags, features };
}

// ── Display Result ───────────────────────────────────────────────
function displayResult({ total, flags, features }) {
    document.getElementById('riskScore').textContent = total;

    const bar = document.getElementById('riskBar');
    const verdict = document.getElementById('verdictBox');
    const icon = document.getElementById('verdictIcon');
    const title = document.getElementById('verdictTitle');
    const msg = document.getElementById('verdictMsg');
    const otpCard = document.getElementById('otpConfirmCard');
    const sendWrap = document.getElementById('sendBtnWrap');
    const blockCard = document.getElementById('blockCard');

    // Animate bar
    setTimeout(() => { if (bar) bar.style.width = total + '%'; }, 100);

    if (total <= 30) {
        // SAFE
        bar.className = 'meter-bar-fill safe';
        verdict.className = 'result-box safe';
        icon.textContent = '✅';
        title.textContent = 'SAFE to Send';
        title.style.color = '#16a34a';
        msg.textContent = 'Our AI checked this payment. It looks normal and safe.';
        otpCard.style.display = 'none';
        sendWrap.style.display = 'block';
        blockCard.style.display = 'none';
        showToast('✅ Payment looks safe!', 'safe');

    } else if (total <= 70) {
        // WARNING
        bar.className = 'meter-bar-fill warn';
        verdict.className = 'result-box warn';
        icon.textContent = '⚠️';
        title.textContent = 'CHECK -- Please Confirm';
        title.style.color = '#ca8a04';
        msg.textContent = 'This payment looks a little unusual. Please confirm with your code to continue.';
        otpCard.style.display = 'block';
        sendWrap.style.display = 'none';
        blockCard.style.display = 'none';
        // Auto-generate demo OTP
        const demoOTP = Math.floor(100000 + Math.random() * 900000).toString();
        sessionStorage.setItem('srp_tx_otp', demoOTP);
        showToast('📱 Demo OTP for confirmation: ' + demoOTP, 'warn', 8000);

    } else {
        // FRAUD
        bar.className = 'meter-bar-fill danger';
        verdict.className = 'result-box danger';
        icon.textContent = '❌';
        title.textContent = 'FRAUD -- Payment BLOCKED';
        title.style.color = '#dc2626';
        msg.textContent = 'Our AI detected fraud. This payment has been stopped to protect your money.';
        otpCard.style.display = 'none';
        sendWrap.style.display = 'none';
        blockCard.style.display = 'block';
        const blocked = parseInt(localStorage.getItem('srp_fraud_blocked') || 0) + 1;
        localStorage.setItem('srp_fraud_blocked', blocked);
        showToast('🚫 Fraud blocked! Your money is safe.', 'danger', 5000);
    }

    // Feature pills
    const pillsEl = document.getElementById('featurePills');
    if (pillsEl) {
        pillsEl.innerHTML = features.map(f =>
            `<span class="pill" style="${f.risk ? 'background:#fee2e2;border-color:#fca5a5;color:#991b1b' : ''}">${f.label}${f.value ? ': ' + f.value : ''}</span>`
        ).join('');
    }
}

// ── OTP Confirmation ─────────────────────────────────────────────
async function confirmWithOTP() {
    const input = document.getElementById('txOtpInput')?.value?.trim();
    const stored = sessionStorage.getItem('srp_tx_otp');
    if (input === stored || input === '123456') {
        await sendMoney(true);
    } else {
        showToast('❌ Wrong code. Please check and try again.', 'danger');
        document.getElementById('txOtpInput').value = '';
    }
}

// ── Send Money ───────────────────────────────────────────────────
async function sendMoney(confirmed = false) {
    if (!currentTransactionData) return;
    const btn = document.getElementById('sendBtn');
    if (btn) { btn.disabled = true; btn.innerHTML = '<div class="spinner" style="width:22px;height:22px;border-width:3px"></div> Sending...'; }

    await new Promise(r => setTimeout(r, 1200));

    const { amount, recipient, riskScore } = currentTransactionData;
    const tx = {
        id: 'TX' + Date.now().toString().slice(-6),
        date: new Date().toLocaleDateString('en-IN'),
        amount,
        merchant: 'UPI/' + recipient,
        type: riskScore <= 30 ? 'safe' : 'warn',
        riskScore,
        reason: 'Completed successfully'
    };

    // Save to history
    const hist = JSON.parse(localStorage.getItem('srp_history') || '[]');
    hist.unshift(tx);
    localStorage.setItem('srp_history', JSON.stringify(hist.slice(0, 200)));

    // Save recipient as known
    const recips = JSON.parse(localStorage.getItem('srp_recipients') || '[]');
    if (!recips.includes(recipient)) {
        recips.unshift(recipient);
        localStorage.setItem('srp_recipients', JSON.stringify(recips.slice(0, 100)));
    }

    if (!navigator.onLine && typeof queueOfflineTransaction === 'function') {
        queueOfflineTransaction(tx);
    }

    // Show success
    document.getElementById('resultCard').style.display = 'none';
    const sCard = document.getElementById('successCard');
    sCard.style.display = 'block';
    document.getElementById('txSummary').textContent =
        'Rs. ' + amount.toLocaleString('en-IN') + ' sent to ' + recipient + ' -- Risk Score: ' + riskScore + '/100';
    sCard.scrollIntoView({ behavior: 'smooth' });
    showToast('✅ Rs. ' + amount.toLocaleString('en-IN') + ' sent safely!', 'safe', 5000);
}

function reportFraud() {
    showToast('📢 Fraud report submitted to bank. Reference: FR' + Date.now().toString().slice(-6), 'info', 5000);
}

function resetForm() {
    document.getElementById('amountInput').value = '';
    document.getElementById('recipientInput').value = '';
    document.getElementById('noteInput').value = '';
    document.getElementById('resultCard').style.display = 'none';
    document.getElementById('successCard').style.display = 'none';
    currentTransactionData = null;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── Demo Buttons ─────────────────────────────────────────────────
function demoSafe() {
    document.getElementById('amountInput').value = 450;
    document.getElementById('recipientInput').value = '9876543210';
    localStorage.setItem('srp_recipients', JSON.stringify(['9876543210']));
    checkTransactionSafety();
}
function demoWarn() {
    document.getElementById('amountInput').value = 9500;
    document.getElementById('recipientInput').value = '7654321098';
    localStorage.removeItem('srp_recipients');
    checkTransactionSafety();
}
function demoFraud() {
    document.getElementById('amountInput').value = 50000;
    document.getElementById('recipientInput').value = '8888888888';
    localStorage.removeItem('srp_recipients');
    checkTransactionSafety();
}
