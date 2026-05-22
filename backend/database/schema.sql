-- SecureRuralPay Web AI v3.0 — Database Schema
-- PostgreSQL + SQLite compatible

-- USERS table
CREATE TABLE IF NOT EXISTS users (
    id              SERIAL PRIMARY KEY,
    phone           VARCHAR(10) UNIQUE NOT NULL,
    pin_hash        VARCHAR(64) NOT NULL,
    device_ids      TEXT DEFAULT '[]',        -- JSON array
    risk_level      VARCHAR(10) DEFAULT 'low', -- low/medium/high
    is_blocked      BOOLEAN DEFAULT FALSE,
    failed_attempts INTEGER DEFAULT 0,
    locked_until    TIMESTAMP,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login      TIMESTAMP
);

-- TRANSACTIONS table
CREATE TABLE IF NOT EXISTS transactions (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER REFERENCES users(id),
    tx_ref          VARCHAR(20) UNIQUE NOT NULL,
    amount          DECIMAL(12, 2) NOT NULL,
    recipient       VARCHAR(100) NOT NULL,
    merchant        VARCHAR(100),
    risk_score      INTEGER DEFAULT 0,
    decision        VARCHAR(10) NOT NULL,  -- ALLOW / OTP / BLOCK
    status          VARCHAR(20) DEFAULT 'pending', -- pending/completed/blocked
    is_offline      BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    synced_at       TIMESTAMP
);

-- FRAUD_LOGS table
CREATE TABLE IF NOT EXISTS fraud_logs (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER REFERENCES users(id),
    fraud_type      VARCHAR(30) NOT NULL,    -- transaction/phishing/pdf/behavior
    risk_score      INTEGER NOT NULL,
    amount          DECIMAL(12, 2),
    details         TEXT,                   -- JSON
    action_taken    VARCHAR(50) NOT NULL,
    ip_address      VARCHAR(50),
    device_id       VARCHAR(60),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- LINKS_SCANNED table
CREATE TABLE IF NOT EXISTS links_scanned (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER REFERENCES users(id),
    url             TEXT NOT NULL,
    risk_score      INTEGER NOT NULL,
    verdict         VARCHAR(10) NOT NULL,   -- safe/warn/danger
    features        TEXT,                  -- JSON (15 features)
    is_blacklisted  BOOLEAN DEFAULT FALSE,
    scanned_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PDF_REPORTS table
CREATE TABLE IF NOT EXISTS pdf_reports (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER REFERENCES users(id),
    filename        VARCHAR(200),
    total_tx        INTEGER DEFAULT 0,
    fraud_count     INTEGER DEFAULT 0,
    suspicious_count INTEGER DEFAULT 0,
    fraud_amount    DECIMAL(12, 2) DEFAULT 0,
    report_data     TEXT,                  -- JSON (full report)
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- MODEL_METRICS table (track model performance over time)
CREATE TABLE IF NOT EXISTS model_metrics (
    id              SERIAL PRIMARY KEY,
    model_version   VARCHAR(20) NOT NULL,
    accuracy        DECIMAL(6, 4),
    precision_score DECIMAL(6, 4),
    recall          DECIMAL(6, 4),
    f1_score        DECIMAL(6, 4),
    auc_roc         DECIMAL(6, 4),
    training_samples INTEGER,
    trained_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- OTP_CACHE table (use Redis in production; SQLite fallback)
CREATE TABLE IF NOT EXISTS otp_cache (
    phone       VARCHAR(10) PRIMARY KEY,
    otp_hash    VARCHAR(64) NOT NULL,
    expires_at  TIMESTAMP NOT NULL,
    used        BOOLEAN DEFAULT FALSE
);

-- ── Indexes for performance ──────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_users_phone        ON users(phone);
CREATE INDEX IF NOT EXISTS idx_tx_user_id         ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_tx_created_at      ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_fraud_logs_type    ON fraud_logs(fraud_type);
CREATE INDEX IF NOT EXISTS idx_fraud_logs_date    ON fraud_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_links_verdict      ON links_scanned(verdict);

-- ── Seed model metrics ───────────────────────────────────────────
INSERT INTO model_metrics (model_version, accuracy, precision_score, recall, f1_score, auc_roc, training_samples)
VALUES ('v3.0', 0.9420, 0.9280, 0.9150, 0.9160, 0.9710, 500000),
       ('v2.1', 0.9180, 0.9050, 0.8900, 0.8970, 0.9590, 400000),
       ('v2.0', 0.8930, 0.8810, 0.8740, 0.8770, 0.9380, 300000)
ON CONFLICT DO NOTHING;
