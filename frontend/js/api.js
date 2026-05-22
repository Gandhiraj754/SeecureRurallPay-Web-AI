/* ============================================================
   SecureRuralPay — Central API Helper (api.js)
   Base URL: http://localhost:5000
   All backend calls go through callAPI()
   ============================================================ */

'use strict';

const API_BASE = 'http://localhost:5000';

/**
 * Call the Flask backend.
 * @param {string} endpoint  e.g. '/api/auth/login'
 * @param {string} method    'GET' | 'POST'
 * @param {object|FormData|null} body
 * @returns {Promise<object>} parsed JSON response
 */
async function callAPI(endpoint, method = 'GET', body = null) {
    const token = sessionStorage.getItem('srp_token');

    const headers = {};
    if (token) headers['Authorization'] = 'Bearer ' + token;

    const options = { method, headers };

    if (body instanceof FormData) {
        // Let browser set Content-Type boundary automatically
        options.body = body;
    } else if (body) {
        headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(body);
    }

    const response = await fetch(API_BASE + endpoint, options);
    const data = await response.json();

    if (!response.ok) {
        // Throw error message from backend so callers can show it
        throw new Error(data.error || `Server error (${response.status})`);
    }
    return data;
}

/** Quick connectivity check - resolves true/false */
async function isBackendOnline() {
    try {
        const r = await fetch(API_BASE + '/api/health', { method: 'GET' });
        return r.ok;
    } catch {
        return false;
    }
}

// Expose globally
window.callAPI = callAPI;
window.isBackendOnline = isBackendOnline;
window.API_BASE = API_BASE;
