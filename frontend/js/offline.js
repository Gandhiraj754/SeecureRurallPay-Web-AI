/* ============================================================
   SecureRuralPay — Offline & Service Worker Module
   Handles: offline detection, toast notifications, language
   ============================================================ */

// ─── Toast Notification System ───────────────────────────────
function showToast(message, type='info', duration=3500) {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  const icon = {info:'ℹ️', safe:'✅', danger:'❌', warn:'⚠️'}[type] || 'ℹ️';
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    toast.style.transition = 'all .3s';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ─── Online/Offline Detection ─────────────────────────────────
function updateOnlineStatus() {
  const banner = document.getElementById('offlineBanner');
  if (!banner) return;
  if (!navigator.onLine) {
    banner.classList.add('show');
    showToast('📵 No internet — Offline mode active', 'warn', 5000);
    document.documentElement.setAttribute('data-offline', 'true');
  } else {
    banner.classList.remove('show');
    if (document.documentElement.getAttribute('data-offline') === 'true') {
      showToast('✅ Internet restored — Syncing data', 'safe', 3000);
      document.documentElement.removeAttribute('data-offline');
      syncOfflineQueue();
    }
  }
}

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);
document.addEventListener('DOMContentLoaded', updateOnlineStatus);

// ─── Offline Queue ────────────────────────────────────────────
function queueOfflineTransaction(tx) {
  const queue = JSON.parse(localStorage.getItem('srp_offline_queue') || '[]');
  queue.push({ ...tx, queued_at: new Date().toISOString(), synced: false });
  if (queue.length > 100) queue.shift(); // max 100 transactions
  localStorage.setItem('srp_offline_queue', JSON.stringify(queue));
  showToast('💾 Saved offline — Will send when internet returns', 'warn', 4000);
}

function syncOfflineQueue() {
  const queue = JSON.parse(localStorage.getItem('srp_offline_queue') || '[]');
  const unsync = queue.filter(t => !t.synced);
  if (!unsync.length) return;
  console.log(`[SecureRuralPay] Syncing ${unsync.length} offline transactions...`);
  // Simulate sync
  setTimeout(() => {
    const synced = queue.map(t => ({ ...t, synced: true }));
    localStorage.setItem('srp_offline_queue', JSON.stringify(synced));
    showToast(`✅ ${unsync.length} offline transaction(s) synced`, 'safe', 4000);
  }, 2000);
}

// ─── Device Fingerprinting ────────────────────────────────────
function getDeviceId() {
  let id = localStorage.getItem('srp_device_id');
  if (!id) {
    const canvas = document.createElement('canvas');
    const ctx2d = canvas.getContext('2d');
    ctx2d.textBaseline = 'top';
    ctx2d.font = '14px Arial';
    ctx2d.fillText('SecureRuralPay Device', 2, 2);
    const hash = btoa(canvas.toDataURL()).slice(0, 32);
    const nav = btoa([
      navigator.userAgent.slice(0, 20),
      navigator.language,
      screen.width, screen.height,
      navigator.hardwareConcurrency || 2
    ].join('|')).slice(0, 16);
    id = `DEV_${nav}_${hash}`.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 40);
    localStorage.setItem('srp_device_id', id);
  }
  return id;
}

// ─── Language Toggle (shared) ─────────────────────────────────
function toggleLang() {
  const cur = localStorage.getItem('srp_lang') || 'en';
  const next = cur === 'en' ? 'hi' : 'en';
  localStorage.setItem('srp_lang', next);
  showToast('🌐 Language changed', 'info');
  // Pages handle their own translations
}

// ─── Session Management ───────────────────────────────────────
let inactivityTimer = null;
const INACTIVITY_LIMIT = 5 * 60 * 1000; // 5 min

function resetInactivityTimer() {
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(autoLogout, INACTIVITY_LIMIT);
}

function autoLogout() {
  if (sessionStorage.getItem('srp_token')) {
    sessionStorage.clear();
    showToast('⏱️ Session expired for safety — Please login again', 'warn', 5000);
    setTimeout(() => { window.location.href = 'login.html'; }, 2000);
  }
}

['click', 'touchstart', 'keypress', 'scroll'].forEach(evt =>
  document.addEventListener(evt, resetInactivityTimer, { passive: true })
);

// ─── Register Service Worker ──────────────────────────────────
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {
    // SW not critical — app still works
  });
}

// ─── AES-256 Mock Encryption (client-side for simulation) ─────
function encryptData(data, key) {
  // In production: use Web Crypto API with AES-256-GCM
  // This is a simulation for demo purposes
  return btoa(JSON.stringify({ d: data, t: Date.now(), k: key.slice(0, 8) }));
}

function decryptData(encrypted) {
  try {
    return JSON.parse(atob(encrypted)).d;
  } catch {
    return null;
  }
}

// ─── API Helper ───────────────────────────────────────────────
const API_BASE = window.location.hostname === 'localhost'
  ? 'http://localhost:5000/api'
  : '/api';

async function apiCall(endpoint, method='GET', body=null, requireAuth=true) {
  const token = sessionStorage.getItem('srp_token');
  const headers = { 'Content-Type': 'application/json' };
  if (requireAuth && token) headers['Authorization'] = `Bearer ${token}`;

  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, opts);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    if (!navigator.onLine) throw new Error('OFFLINE');
    throw err;
  }
}

// ─── Behavior Monitor (Silent) ────────────────────────────────
const BehaviorMonitor = {
  keyTimings: [],
  sessionStart: Date.now(),
  lastAction: Date.now(),

  recordKeystroke() {
    const now = Date.now();
    this.keyTimings.push(now - this.lastAction);
    this.lastAction = now;
    if (this.keyTimings.length > 50) this.keyTimings.shift();
  },

  getScore() {
    if (this.keyTimings.length < 5) return 0;
    const avg = this.keyTimings.reduce((a, b) => a + b, 0) / this.keyTimings.length;
    const variance = this.keyTimings.reduce((s, t) => s + Math.pow(t - avg, 2), 0) / this.keyTimings.length;
    const stdDev = Math.sqrt(variance);

    // Time of day risk
    const hour = new Date().getHours();
    const nightRisk = (hour < 6 || hour > 22) ? 20 : 0;

    // Speed risk (too fast = bot, too slow = unusual)
    const speedRisk = avg < 50 ? 30 : avg > 5000 ? 15 : 0;

    return Math.min(100, Math.round(speedRisk + nightRisk + (stdDev / avg) * 10));
  }
};

document.addEventListener('keydown', () => BehaviorMonitor.recordKeystroke());
