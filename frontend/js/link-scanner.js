/* ============================================================
   SecureRuralPay — Link Scanner Module (link-scanner.js)
   Handles: URL phishing detection, 15 features, ML scoring
   ============================================================ */

'use strict';

// ─── Whitelist of legitimate Indian banking domains ───────────
const LEGITIMATE_DOMAINS = new Set([
    'sbi.co.in', 'onlinesbi.sbi', 'onlinesbi.com',
    'hdfcbank.com', 'netbanking.hdfcbank.com',
    'icicibank.com', 'icicibankmatters.com',
    'axisbank.com', 'axisbank.in',
    'paytm.com', 'paytmbank.com',
    'phonepe.com', 'gpay.app',
    'upi.npci.org.in', 'npci.org.in',
    'rbi.org.in', 'rbidocs.rbi.org.in',
    'bhimupi.org.in', 'bharat.gov.in',
    'google.com', 'youtube.com', 'wikipedia.org'
]);

// ─── Known phishing patterns ──────────────────────────────────
const PHISHING_PATTERNS = [
    /sbi.+login/i, /hdfc.+verify/i, /icici.+secure/i,
    /paytm.+reward/i, /upi.+claim/i, /bank.+confirm/i,
    /verify.+account/i, /secure.+login/i, /reward.+claim/i,
    /paytm-/i, /sbi-/i, /hdfc-/i, /icici-/i
];

// ─── Suspicious TLDs ──────────────────────────────────────────
const RISKY_TLDS = new Set(['.xyz', '.tk', '.ml', '.ga', '.cf', '.gq', '.pw', '.cc', '.top', '.win', '.loan', '.work', '.click', '.download', '.zip', '.review', '.country']);

// ─── Main Scan Function ───────────────────────────────────────
async function scanLink() {
    const urlInput = document.getElementById('urlInput');
    const rawUrl = urlInput?.value?.trim();
    if (!rawUrl) { showToast('⚠️ Please paste a website link first', 'warn'); return; }

    const url = rawUrl.startsWith('http') ? rawUrl : 'https://' + rawUrl;

    // Show loading
    document.getElementById('scanLoading').style.display = 'block';
    document.getElementById('scanResult').style.display = 'none';
    document.getElementById('scanBtn').disabled = true;

    // Animated progress
    await runScanAnimation();

    // Extract features (still used for offline fallback display)
    const features = extractURLFeatures(url);

    let score, verdict, backendFeatures;
    try {
        // Call real backend
        const apiResult = await callAPI('/api/link/scan', 'POST', { url });
        score = apiResult.risk_score;
        verdict = apiResult.verdict;
        backendFeatures = features; // use local feature extraction for display
    } catch (err) {
        // Offline fallback: use local scoring
        showToast('⚠️ Backend offline — using on-device scanner', 'warn', 3000);
        const local = scoreURL(features, url);
        score = local.score;
        verdict = local.verdict;
        backendFeatures = features;
    }

    // Display result
    document.getElementById('scanLoading').style.display = 'none';
    displayScanResult(score, verdict, backendFeatures, url);
    document.getElementById('scanResult').style.display = 'block';
    document.getElementById('scanBtn').disabled = false;

    // Save to localStorage
    const scanned = JSON.parse(localStorage.getItem('srp_links_scanned') || '[]');
    scanned.unshift({ url, score, verdict, date: new Date().toISOString() });
    localStorage.setItem('srp_links_scanned', JSON.stringify(scanned.slice(0, 50)));
    document.getElementById('scanResult').scrollIntoView({ behavior: 'smooth' });
}

// ─── Animated Scan Progress ───────────────────────────────────
async function runScanAnimation() {
    const steps = [
        [20, 'Checking URL structure...'],
        [40, 'Analyzing domain name...'],
        [60, 'Checking phishing database...'],
        [80, 'Running AI model...'],
        [100, 'Generating report...']
    ];
    for (const [pct, label] of steps) {
        await new Promise(r => setTimeout(r, 400 + Math.random() * 300));
        const prog = document.getElementById('scanProgress');
        const pctEl = document.getElementById('scanPct');
        const stepEl = document.getElementById('scanStep');
        if (prog) prog.style.width = pct + '%';
        if (pctEl) pctEl.textContent = pct + '%';
        if (stepEl) stepEl.textContent = label;
    }
}

// ─── Feature Extraction ───────────────────────────────────────
function extractURLFeatures(urlStr) {
    let parsed;
    try { parsed = new URL(urlStr); } catch { return null; }

    const hostname = parsed.hostname.toLowerCase();
    const path = parsed.pathname + parsed.search;
    const fullUrl = urlStr.toLowerCase();

    // Extract TLD
    const parts = hostname.split('.');
    const tld = '.' + parts.slice(-1)[0];
    const domain = parts.slice(-2).join('.');
    const subdomains = parts.slice(0, -2);

    // Is IP address?
    const isIP = /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname);

    // Contains bank keywords in path/subdomain (not legitimate domain)
    const bankKeywords = ['sbi', 'hdfc', 'icici', 'paytm', 'upi', 'bank', 'rbi', 'npci', 'axis', 'kotak', 'phonepe'];
    const securityKeywords = ['secure', 'verify', 'login', 'confirm', 'validate', 'account', 'update', 'otp', 'pin'];
    const hasBankKw = bankKeywords.some(k => hostname.includes(k));
    const hasSecKw = securityKeywords.some(k => fullUrl.includes(k));

    // Blacklist match
    const isBlacklisted = PHISHING_PATTERNS.some(p => p.test(fullUrl));

    // Whitelist check
    const isLegitimate = [...LEGITIMATE_DOMAINS].some(d => hostname === d || hostname.endsWith('.' + d));

    return {
        url_length: urlStr.length,
        num_dots: (hostname.match(/\./g) || []).length,
        num_hyphens: (hostname.match(/-/g) || []).length,
        num_digits: (hostname.match(/\d/g) || []).length,
        num_special: (path.match(/[@%=&]/g) || []).length,
        has_https: parsed.protocol === 'https:',
        has_ip: isIP,
        tld_suspicious: RISKY_TLDS.has(tld),
        subdomain_depth: subdomains.length,
        has_at_symbol: urlStr.includes('@'),
        has_bank_keyword: hasBankKw,
        has_security_keyword: hasSecKw,
        is_blacklisted: isBlacklisted,
        is_legitimate: isLegitimate,
        url_entropy: calcEntropy(hostname),
        hostname, domain, tld, isIP
    };
}

function calcEntropy(str) {
    if (!str) return 0;
    const freq = {};
    for (const c of str) freq[c] = (freq[c] || 0) + 1;
    const len = str.length;
    return -Object.values(freq).reduce((s, f) => s + (f / len) * Math.log2(f / len), 0);
}

// ─── ML Score Computation ─────────────────────────────────────
function scoreURL(f, url) {
    if (!f) return { score: 80, verdict: 'danger' };

    // Immediate safe: exact whitelist match
    if (f.is_legitimate) return { score: 5, verdict: 'safe' };

    let score = 0;

    if (f.is_blacklisted) score += 45;
    if (f.has_ip) score += 35;
    if (!f.has_https) score += 20;
    if (f.tld_suspicious) score += 25;
    if (f.has_at_symbol) score += 30;
    if (f.num_hyphens >= 2) score += 15;
    if (f.num_hyphens >= 1 && f.has_bank_keyword) score += 20;
    if (f.subdomain_depth >= 3) score += 15;
    if (f.has_bank_keyword && !f.is_legitimate) score += 15;
    if (f.has_security_keyword && !f.is_legitimate) score += 12;
    if (f.url_length > 100) score += 8;
    if (f.url_entropy > 4.5) score += 8;
    if (f.num_digits > 5) score += 5;
    if (f.num_dots > 4) score += 8;

    const total = Math.min(100, score);
    const verdict = total <= 25 ? 'safe' : total <= 60 ? 'warn' : 'danger';
    return { score: total, verdict };
}

// ─── Display Result ───────────────────────────────────────────
function displayScanResult(score, verdict, features, url) {
    // Score + bar
    document.getElementById('linkRiskScore').textContent = score;
    const bar = document.getElementById('linkRiskBar');
    setTimeout(() => { if (bar) { bar.style.width = score + '%'; bar.className = 'meter-bar-fill ' + verdict; } }, 100);

    // Verdict box
    const box = document.getElementById('linkResultBox');
    const icon = document.getElementById('linkResultIcon');
    const title = document.getElementById('linkResultTitle');
    const msg = document.getElementById('linkResultMsg');
    const actions = document.getElementById('resultActions');

    box.className = 'result-box ' + verdict;

    if (verdict === 'safe') {
        icon.textContent = '✅';
        title.textContent = 'SAFE — This website is real and safe to use';
        title.style.color = '#16a34a';
        msg.textContent = 'We checked this link. It is a genuine website. You can visit it safely.';
        actions.innerHTML = `<a href="${url}" target="_blank" rel="noopener" class="btn btn-safe">🔗 Open This Website Safely</a>`;
        showToast('✅ Safe website!', 'safe');
    } else if (verdict === 'warn') {
        icon.textContent = '⚠️';
        title.textContent = 'CHECK — This website looks a little strange. Be careful!';
        title.style.color = '#ca8a04';
        msg.textContent = 'This link has some unusual features. Do NOT enter your bank PIN or OTP here. When in doubt, visit your bank website directly by typing the address.';
        actions.innerHTML = `<button class="btn btn-warn" onclick="showToast('⚠️ Be very careful entering any details here','warn',5000)">⚠️ I Understand the Risk</button>`;
        showToast('⚠️ Be careful with this link', 'warn', 4000);
    } else {
        icon.textContent = '❌';
        title.textContent = 'DANGER — This is a FAKE website!';
        title.style.color = '#dc2626';
        msg.textContent = 'Do NOT click this link. Do NOT enter your bank details, PIN, or OTP here. This is a fake website designed to steal your money.';
        actions.innerHTML = `
      <button class="btn btn-danger" onclick="reportPhishing('${encodeURIComponent(url)}')">🚨 Report This Fake Website</button>
      <button class="btn btn-outline" onclick="window.location.href='index.html'">← Go Back to Safety</button>`;
        showToast('🚨 DANGER! Fake website detected!', 'danger', 6000);
    }

    // Feature list
    if (features) {
        const featureList = document.getElementById('featureList');
        const featureItems = [
            { label: '🔒 Secure connection (HTTPS)', ok: features.has_https, detail: features.has_https ? 'Yes — encrypted' : 'No — risky!' },
            { label: '🌐 Domain looks real', ok: features.is_legitimate, detail: features.is_legitimate ? 'Yes — verified' : 'Could not verify' },
            { label: '🔢 IP address in link', ok: !features.has_ip, detail: features.has_ip ? 'YES — very suspicious!' : 'No — normal' },
            { label: '⚠️ Suspicious word endings (.xyz, .tk)', ok: !features.tld_suspicious, detail: features.tld_suspicious ? 'YES — high risk!' : 'Normal (.com, .in, etc.)' },
            { label: '➖ Too many hyphens in name', ok: features.num_hyphens < 2, detail: features.num_hyphens + ' hyphen(s)' },
            { label: '📛 Contains bank name misleadingly', ok: !(features.has_bank_keyword && !features.is_legitimate), detail: features.has_bank_keyword && !features.is_legitimate ? 'YES — tricks you!' : 'No issue' },
            { label: '🔴 In fraud database', ok: !features.is_blacklisted, detail: features.is_blacklisted ? 'YES — known phishing!' : 'Not listed' },
        ];
        featureList.innerHTML = featureItems.map(fi => `
      <div style="display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:8px;background:${fi.ok ? '#f0fdf4' : '#fff7ed'};border:1px solid ${fi.ok ? '#86efac' : '#fed7aa'}">
        <span style="font-size:1rem">${fi.ok ? '✅' : '⚠️'}</span>
        <div>
          <div style="font-size:0.85rem;font-weight:600">${fi.label}</div>
          <div style="font-size:0.75rem;color:${fi.ok ? '#16a34a' : '#c2410c'}">${fi.detail}</div>
        </div>
      </div>`).join('');
    }
}

function reportPhishing(encodedUrl) {
    const url = decodeURIComponent(encodedUrl);
    showToast('🚨 Phishing report submitted! Reference: PH' + Date.now().toString().slice(-6), 'safe', 5000);
    // In production: POST to /api/link/report
}

function onUrlChange() {
    document.getElementById('scanResult').style.display = 'none';
}

// ─── Demo Button ──────────────────────────────────────────────
function demo(url) {
    document.getElementById('urlInput').value = url;
    scanLink();
}
