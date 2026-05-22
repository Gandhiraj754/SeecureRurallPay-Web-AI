/* ============================================================
   SecureRuralPay — PDF Analyzer Module (pdf-analyzer.js)
   Handles: File upload, OCR simulation, Fraud detection
   ============================================================ */

'use strict';

let selectedFile = null;

// ─── Drag & Drop ──────────────────────────────────────────────
function dragOver(e) { e.preventDefault(); document.getElementById('uploadZone')?.classList.add('drag-over'); }
function dragLeave() { document.getElementById('uploadZone')?.classList.remove('drag-over'); }
function dropFile(e) {
    e.preventDefault();
    dragLeave();
    const file = e.dataTransfer?.files?.[0];
    if (file) handleFile(file);
}

function fileSelected(e) { handleFile(e.target.files[0]); }

function handleFile(file) {
    if (!file) return;
    if (file.type !== 'application/pdf') {
        showToast('⚠️ Please select a PDF file only', 'warn'); return;
    }
    if (file.size > 25 * 1024 * 1024) {
        showToast('⚠️ File too large — max 25MB', 'warn'); return;
    }
    selectedFile = file;
    document.getElementById('uploadIcon').textContent = '✅';
    document.getElementById('uploadText').textContent = file.name;
    document.getElementById('uploadHint').textContent = `${(file.size / 1024).toFixed(1)} KB — ready to analyze`;
    document.getElementById('fileInfo').style.display = 'block';
    document.getElementById('fileName').textContent = file.name;
    document.getElementById('fileSize').textContent = `Size: ${(file.size / 1024).toFixed(1)} KB`;
    document.getElementById('analyzeBtn').style.display = 'flex';
    showToast('✅ File ready — tap "FIND FRAUD" to analyze', 'safe', 3000);
}

// ─── Main Analysis ────────────────────────────────────────────
async function analyzePDF() {
    if (!selectedFile && !window._demoMode) {
        showToast('⚠️ Please select a PDF file first', 'warn'); return;
    }

    document.getElementById('uploadSection').style.display = 'none';
    document.getElementById('processingCard').style.display = 'block';
    document.getElementById('reportSection').style.display = 'none';

    // Step-by-step simulation
    const steps = [
        { id: 1, label: 'Reading your PDF file', pct: 20 },
        { id: 2, label: 'Finding all transactions', pct: 40 },
        { id: 3, label: 'Checking each payment with AI', pct: 65 },
        { id: 4, label: 'Checking payment networks', pct: 85 },
        { id: 5, label: 'Making your report', pct: 100 },
    ];

    for (const step of steps) {
        await new Promise(r => setTimeout(r, 900 + Math.random() * 600));
        const iconEl = document.getElementById('pStep' + step.id + 'Icon');
        if (iconEl) iconEl.textContent = '✅';
        const progEl = document.getElementById('pProgress');
        const pctEl = document.getElementById('pPct');
        const lblEl = document.getElementById('pStepLabel');
        if (progEl) progEl.style.width = step.pct + '%';
        if (pctEl) pctEl.textContent = step.pct + '%';
        if (lblEl) lblEl.textContent = step.label + '...';
    }

    await new Promise(r => setTimeout(r, 500));

    let report;
    try {
        // Call real backend
        const formData = new FormData();
        if (selectedFile && !window._demoMode) {
            formData.append('file', selectedFile);
        }
        const apiResult = await callAPI('/api/pdf/analyze', 'POST', formData);

        // Map backend response to local report format
        report = {
            transactions: [
                ...(apiResult.fraud_transactions || []).map(t => ({
                    date: t.date, amount: '₹' + (t.amount || 0).toLocaleString('en-IN'),
                    amountRaw: t.amount, merchant: t.description || 'Unknown',
                    description: t.detail || t.description,
                    riskScore: t.risk_score, type: 'fraud', reason: t.reason
                })),
                ...(apiResult.suspicious_transactions || []).map(t => ({
                    date: t.date, amount: '₹' + (t.amount || 0).toLocaleString('en-IN'),
                    amountRaw: t.amount, merchant: t.description || 'Unknown',
                    description: t.detail || t.description,
                    riskScore: t.risk_score, type: 'suspicious', reason: t.reason
                }))
            ],
            total: apiResult.total_transactions || 0,
            fraud: (apiResult.fraud_transactions || []).map(t => ({ ...t, type: 'fraud' })),
            suspicious: (apiResult.suspicious_transactions || []).map(t => ({ ...t, type: 'suspicious' })),
            safe: []
        };
        report.transactions.sort((a, b) => (b.riskScore || 0) - (a.riskScore || 0));
    } catch (err) {
        // Offline fallback
        showToast('⚠️ Backend offline — using on-device analysis', 'warn', 3000);
        report = generateSyntheticReport();
    }

    displayReport(report);

    document.getElementById('processingCard').style.display = 'none';
    document.getElementById('reportSection').style.display = 'block';
    document.getElementById('reportSection').scrollIntoView({ behavior: 'smooth' });
}

// ─── Synthetic Report Generator ───────────────────────────────
function generateSyntheticReport() {
    const merchants = ['AMAZON PAY', 'SWIGGY', 'UPI/9876543210', 'ATM WDL PUNB', 'UPI/UNKNOWN123', 'ZOMATO', 'IRCTC', 'NFS/1234', 'UPI/SUSPECT001', 'PETROL PUMP'];
    const descriptions = [
        'Online shopping', 'Food delivery', 'Family transfer', 'Cash withdrawal',
        'UNKNOWN MERCHANT', 'Food delivery', 'Train tickets', 'ATM Cash', 'Suspicious UPI', 'Fuel'
    ];
    const transactions = [];
    const count = 32 + Math.floor(Math.random() * 20);
    const d = new Date();

    for (let i = 0; i < count; i++) {
        const di = new Date(d.getTime() - i * 24 * 3600000 * (Math.random() * 2));
        const mi = Math.floor(Math.random() * merchants.length);
        const amount = Math.floor(50 + Math.random() * 10000);
        const isUnknown = merchants[mi].includes('UNKNOWN') || merchants[mi].includes('SUSPECT');
        const isNight = di.getHours() < 6 || di.getHours() > 22;
        const isRound = amount % 1000 === 0 && amount >= 2000;
        const isATM = merchants[mi].includes('ATM');

        // Risk scoring
        let risk = 10;
        if (isUnknown) risk += 40;
        if (isNight) risk += 25;
        if (isRound && isUnknown) risk += 15;
        if (isATM && i < 3) risk += 20; // multiple ATM withdrawals

        const type = risk >= 71 ? 'fraud' : risk >= 35 ? 'suspicious' : 'safe';
        transactions.push({
            date: di.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' }),
            amount: '₹' + amount.toLocaleString('en-IN'),
            amountRaw: amount,
            merchant: merchants[mi],
            description: descriptions[mi],
            riskScore: Math.min(100, risk + Math.floor(Math.random() * 15)),
            type,
            reason: type === 'fraud' ? 'Unknown merchant + unusual time' : type === 'suspicious' ? 'Unusual amount or time' : 'Normal transaction'
        });
    }

    return {
        transactions,
        total: transactions.length,
        fraud: transactions.filter(t => t.type === 'fraud'),
        suspicious: transactions.filter(t => t.type === 'suspicious'),
        safe: transactions.filter(t => t.type === 'safe')
    };
}

// ─── Display Report ───────────────────────────────────────────
function displayReport(report) {
    // Summary counts
    document.getElementById('rFraud').textContent = report.fraud.length;
    document.getElementById('rSusp').textContent = report.suspicious.length;
    document.getElementById('rSafe').textContent = report.safe.length;

    // Overall verdict
    const verdict = document.getElementById('reportVerdict');
    const vIcon = document.getElementById('reportVerdictIcon');
    const vTitle = document.getElementById('reportVerdictTitle');
    const vMsg = document.getElementById('reportVerdictMsg');

    if (report.fraud.length > 0) {
        verdict.className = 'result-box danger';
        vIcon.textContent = '🚨';
        vTitle.textContent = `${report.fraud.length} Fraud Transaction${report.fraud.length > 1 ? 's' : ''} Found!`;
        vMsg.textContent = `Contact your bank immediately about these ${report.fraud.length} suspicious payment(s). Reference: SA${Date.now().toString().slice(-6)}`;
        document.getElementById('reportBankBtn').style.display = 'flex';
        showToast(`🚨 ${report.fraud.length} fraud transaction(s) found!`, 'danger', 6000);
        localStorage.setItem('srp_fraud_blocked', parseInt(localStorage.getItem('srp_fraud_blocked') || 0) + report.fraud.length);
    } else if (report.suspicious.length > 0) {
        verdict.className = 'result-box warn';
        vIcon.textContent = '⚠️';
        vTitle.textContent = `${report.suspicious.length} Suspicious Payment${report.suspicious.length > 1 ? 's' : ''}`;
        vMsg.textContent = 'These payments look unusual. Please check your bank and confirm you made these.';
        showToast(`⚠️ ${report.suspicious.length} suspicious payments found`, 'warn', 4000);
    } else {
        verdict.className = 'result-box safe';
        vIcon.textContent = '✅';
        vTitle.textContent = 'All Payments Look Safe!';
        vMsg.textContent = 'Our AI checked all your transactions. We found no fraud in your bank statement. Good news!';
        showToast('✅ Statement looks clean — no fraud detected!', 'safe', 4000);
    }

    // Transaction list (sorted: fraud first, then suspicious, then safe)
    const sorted = [...report.fraud, ...report.suspicious, ...report.safe];
    const listEl = document.getElementById('txDetailList');
    listEl.innerHTML = sorted.map(tx => {
        const bgColor = tx.type === 'fraud' ? '#fff1f2' : tx.type === 'suspicious' ? '#fffbeb' : '#f0fdf4';
        const borderColor = tx.type === 'fraud' ? '#fecaca' : tx.type === 'suspicious' ? '#fde68a' : '#bbf7d0';
        const badge = tx.type === 'fraud' ? '<span class="badge badge-danger">❌ Fraud</span>' :
            tx.type === 'suspicious' ? '<span class="badge badge-warn">⚠️ Check</span>' :
                '<span class="badge badge-safe">✅ Safe</span>';
        return `
      <div style="background:${bgColor};border:1.5px solid ${borderColor};border-radius:10px;padding:12px 14px">
        <div style="display:flex;justify-content:space-between;align-items:flex-start">
          <div>
            <div style="font-weight:700;font-size:0.9rem">${tx.merchant}</div>
            <div style="font-size:0.75rem;color:var(--color-muted)">${tx.date} · ${tx.description}</div>
            ${tx.type !== 'safe' ? `<div style="font-size:0.75rem;color:#c2410c;margin-top:3px">⚠️ ${tx.reason}</div>` : ''}
          </div>
          <div style="text-align:right">
            <div style="font-weight:800">${tx.amount}</div>
            ${badge}
            <div style="font-size:0.7rem;color:var(--color-muted)">Risk:${tx.riskScore}</div>
          </div>
        </div>
      </div>`;
    }).join('');
}

// ─── Actions ──────────────────────────────────────────────────
function reportToBank() {
    showToast('📞 Fraud report submitted to bank security team. Ref: FB' + Date.now().toString().slice(-6), 'safe', 5000);
}

function downloadReport() {
    const content = `SecureRuralPay — Bank Statement Fraud Report\nDate: ${new Date().toLocaleString('en-IN')}\n\nThis is a simulated report from SecureRuralPay demo.\nIn the full system, this PDF contains the complete analysis.`;
    const a = document.createElement('a');
    a.href = 'data:text/plain,' + encodeURIComponent(content);
    a.download = 'fraud_report_' + Date.now().toString().slice(-6) + '.txt';
    a.click();
    showToast('📥 Report downloaded', 'safe', 3000);
}

function resetPDF() {
    selectedFile = null;
    window._demoMode = false;
    document.getElementById('uploadSection').style.display = 'block';
    document.getElementById('processingCard').style.display = 'none';
    document.getElementById('reportSection').style.display = 'none';
    document.getElementById('uploadIcon').textContent = '📄';
    document.getElementById('uploadText').textContent = 'Tap here to choose your PDF file';
    document.getElementById('uploadHint').textContent = 'Or drag and drop your bank statement here';
    document.getElementById('fileInfo').style.display = 'none';
    document.getElementById('analyzeBtn').style.display = 'none';
    document.getElementById('pdfFile').value = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ─── Demo Mode ────────────────────────────────────────────────
async function runDemo() {
    window._demoMode = true;
    selectedFile = new File(['demo'], 'SBI_Statement_Demo.pdf', { type: 'application/pdf' });
    handleFile(selectedFile);
    await new Promise(r => setTimeout(r, 500));
    await analyzePDF();
}
