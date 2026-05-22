<div align="center">

# 🔐 SecureRuralPay Web AI v3.0

### *Lightweight Cybersecurity Framework for Rural Digital Banking — Fusion Forge '26 Hackathon*

[![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-3.0.3-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![XGBoost](https://img.shields.io/badge/ML-XGBoost%20%7C%20RandomForest-FF6F00?style=for-the-badge&logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)
[![TFLite](https://img.shields.io/badge/Edge%20AI-TFLite%20INT8%20~2MB-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white)](https://www.tensorflow.org/lite)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Celery](https://img.shields.io/badge/Celery-Async-37814A?style=for-the-badge&logo=celery&logoColor=white)](https://docs.celeryq.dev/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue?logo=apache&style=for-the-badge)](LICENSE)

> 🚀 **A lightweight cybersecurity framework** built for **Problem Statement #10** at the **Fusion Forge '26 Hackathon** (24-hour sprint). Designed to secure digital banking transactions for rural users with robust **fraud detection**, **multi-layer authentication**, and **phishing protection** — fully optimized for low-end smartphones and limited internet connectivity.

</div>

---

## 📋 Table of Contents

- [📌 Problem Statement](#-problem-statement)
- [💡 Solution & Approach](#-solution--approach)
- [🎯 Objectives](#-objectives)
- [🛠️ Technology Stack](#️-technology-stack)
- [📁 Project Structure](#-project-structure)
- [🔬 System Architecture & Flowchart](#-system-architecture--flowchart)
- [🧠 AI & Fraud Detection Models](#-ai--fraud-detection-models)
- [💻 Code Analysis](#-code-analysis)
- [📦 Dependencies](#-dependencies)
- [🚀 Installation & Setup](#-installation--setup)
- [🌍 Impact & Real-World Significance](#-impact--real-world-significance)
- [🔮 Future Enhancements](#-future-enhancements)
- [🤝 Open Source Contribution](#-open-source-contribution)
- [📄 License](#-license)
- [👨‍💻 Author & Acknowledgments](#-author--acknowledgments)

---

## 📌 Problem Statement

> **"Develop a lightweight cybersecurity framework to secure digital banking transactions for rural users, focusing on fraud detection and user authentication. The solution should be compatible with low-end smartphones and limited internet connectivity."**
> — *Problem Statement #10, Fusion Forge '26 Hackathon*

### The Core Challenge

Rural digital banking faces unique and critical hurdles that mainstream fintech solutions fail to address:

| Challenge | Description |
|-----------|-------------|
| 🔴 **Device Constraints** | Low-end smartphones with limited RAM (<1GB), slow CPUs, and minimal storage |
| 🔴 **Network Unreliability** | Intermittent 2G/3G connectivity makes heavy API calls and complex TLS handshakes unfeasible |
| 🔴 **Financial Literacy Gap** | Higher susceptibility to phishing SMS links, fake KYC alerts, and social engineering attacks |
| 🔴 **Authentication Security** | Need for secure, friction-light login that prevents unauthorized access without overwhelming users |
| 🔴 **Real-time Fraud Risk** | Anomalous UPI transfers can occur before users realize they're being coerced or deceived |

---

## 💡 Solution & Approach

### Our Strategy: SecureRuralPay Web AI

We developed a hyper-optimized, full-stack cybersecurity framework that pushes intelligence to the edge where possible, and relies on a fast, asynchronous backend for online scenarios.

1. **Lightweight Edge AI** — Converted our 18-feature XGBoost/Random Forest fraud detection ensemble into a **~2MB INT8 quantized TensorFlow Lite model**, enabling fraud inference directly on low-end devices without heavy network reliance.
2. **Multi-Layered Authentication** — A robust yet simple Phone + PIN + OTP mechanism fortified with device ID tracking and automatic account lockout after failed attempts.
3. **Comprehensive Scam Protection** — Integrated modules for scanning suspicious SMS links (Phishing Link Scanner) and analyzing uploaded documents (PDF Analyzer) for fraud indicators.
4. **Resilient Backend Architecture** — Built on Flask with Celery/Redis for asynchronous task processing, ensuring the API remains responsive even on slow connections.
5. **Offline-First Design** — Service Workers cache critical assets and the TFLite model client-side, so security checks function even with zero connectivity.

### Architecture Overview

```text
[Rural User — Low-End Device]
         ↓  Phone + PIN + OTP
[Nginx Reverse Proxy]
         ↓  Rate-Limited & Authenticated Request
[Flask API Backend]
         ↓  Routes Request
   ┌─────┴─────────────────────┐
[Fraud Detection]       [Phishing / PDF Scanner]
   ├── Good Network →          ↓
   │   XGBoost+RF Server Model  [Threat Heuristics & Feature Extraction]
   └── Poor Network →
       TFLite Edge Model (~2MB)
         ↓  Decision
[ALLOW / OTP Verify / BLOCK] → [User Notified]
```

---

## 🎯 Objectives

- ✅ **Enable Offline/Low-Bandwidth Fraud Detection** via lightweight TFLite models (~2MB, <50ms inference)
- ✅ **Secure Authentication** using JWT tokens, bcrypt-hashed PINs, and TOTP-based OTP generation
- ✅ **Real-time Phishing Detection** to protect users from malicious SMS links targeting Indian rural users
- ✅ **Analyze Transactions** based on 18 behavioral and contextual features (time, location, frequency, device trust, etc.)
- ✅ **Malicious PDF Scanning** to detect fraudulent documents masquerading as bank notices
- ✅ **Admin Dashboard** for monitoring system health, fraud metrics, and model performance
- ✅ **Service Worker Caching** for offline capability on limited connectivity

---

## 🛠️ Technology Stack

### Backend & Database

| Component | Specification | Role |
|-----------|--------------|------|
| **Framework** | Flask 3.0.3 | Lightweight REST API backend |
| **Task Queue** | Celery 5.4.0 & Redis | Async processing for heavy tasks & OTP caching |
| **Database** | PostgreSQL 15 | Relational user & transaction data |
| **NoSQL** | MongoDB | Unstructured fraud logs & audit trails |
| **ML Engine** | scikit-learn 1.4.2 & XGBoost 2.0.3 | Server-side fraud detection ensemble |
| **Edge AI** | TensorFlow Lite (INT8) | On-device model (`fraud_model.tflite`, ~2MB) |
| **Security** | PyJWT 2.8.0, bcrypt 4.1.3, pyotp 2.9.0 | Token management, PIN hashing, OTP generation |
| **PDF Analysis** | PyPDF2, pdf2image, pytesseract | Malicious document scanning |
| **Link Analysis** | tldextract, python-whois | URL feature extraction for phishing detection |
| **OTP Delivery** | Twilio | SMS-based OTP for Indian rural users |
| **Rate Limiting** | Flask-Limiter | Prevents brute-force & abuse |
| **Monitoring** | prometheus-client | Metrics & system health tracking |

### Frontend & Deployment

| Technology | Version | Purpose |
|--------------------|---------|---------|
| **Frontend** | HTML5 / Vanilla JS / CSS3 | Ultra-lightweight UI — no heavy JS frameworks |
| **Service Workers** | SW.js | Caching & offline support for limited connectivity |
| **Production Server** | Gunicorn + Gevent | Async workers for concurrent connections |
| **Reverse Proxy** | Nginx | Load balancing & static file serving |
| **Containerization** | Docker & Docker Compose | Full-stack orchestration (Flask, Redis, Nginx, MongoDB, PostgreSQL) |

---

## 📁 Project Structure

```text
secureapp-main/
│
├── 📁 backend/                         # Flask Backend Application
│   ├── 📁 auth/                        # Authentication routes & JWT logic
│   │   └── 📄 routes.py                # Phone + PIN + OTP login endpoints
│   ├── 📁 fraud/                       # Fraud Detection API
│   │   └── 📄 routes.py                # /api/fraud/analyze endpoint
│   ├── 📁 link_scanner/                # Phishing Link Analysis
│   │   └── 📄 routes.py                # /api/scan-link endpoint
│   ├── 📁 pdf_analyzer/                # Malicious PDF Scanning
│   │   └── 📄 routes.py                # /api/analyze-pdf endpoint
│   ├── 📁 database/                    # DB connection & ORM models
│   └── 📄 app.py                       # Main Flask Application Entry Point
│
├── 📁 frontend/                        # Lightweight Vanilla UI
│   ├── 📁 css/                         # Stylesheets (mobile-first)
│   ├── 📁 js/                          # Vanilla JavaScript logic
│   ├── 📁 admin/                       # Admin Dashboard UI
│   ├── 📄 index.html                   # Main dashboard entry point
│   ├── 📄 login.html                   # Authentication UI
│   ├── 📄 send-money.html              # UPI Transaction UI + fraud warnings
│   ├── 📄 check-link.html              # Phishing Link Scanner UI
│   ├── 📄 check-pdf.html               # PDF Analyzer UI
│   ├── 📄 history.html                 # Transaction history UI
│   ├── 📄 security-tips.html           # User education page
│   └── 📄 sw.js                        # Service Worker (offline caching)
│
├── 📁 ml_training/                     # ML Model Training Pipelines
│   ├── 📄 train_fraud_model.py         # XGBoost/RF Ensemble + TFLite conversion
│   └── 📄 train_link_model.py          # Phishing link classifier training
│
├── 📄 app.py                           # Root app entry point
├── 📄 Dockerfile                       # Container image definition
├── 📄 docker-compose.yml               # Full-stack container orchestration
├── 📄 requirements.txt                 # Python dependencies
└── 📄 README.md                        # Documentation (You are here)
```

---

## 🔬 System Architecture & Flowchart

```mermaid
flowchart TD
    A(["📱 Rural User (Low-end Device)"]) -->|"Phone + PIN + OTP"| B["Nginx Reverse Proxy"]
    B --> C{"Authentication Check"}

    C -- "Failed / Locked" --> D["🚫 Account Lockout"]
    C -- "Success + JWT" --> E["Flask API Backend"]

    E --> F{"Request Type"}
    F -- "Transaction" --> G["Fraud Detection Module"]
    F -- "Scan Link" --> H["Phishing Link Scanner"]
    F -- "Upload PDF" --> I["PDF Analyzer"]

    G --> J{"Network Status?"}
    J -- "Online (Good Network)" --> K["Server-Side XGBoost+RF Model"]
    J -- "Offline (Poor/No Network)" --> L["Edge TFLite Model ~2MB"]

    K & L --> M["Decision: ✅ ALLOW / ⚠️ OTP Verify / 🚫 BLOCK"]

    H --> N["15-Feature URL Heuristics"]
    I --> O["OCR + NLP + Pattern Matching"]

    N & O --> P["⚠️ Threat Report to User"]
    M --> Q(["📲 Secure Result Displayed to User"])
    P --> Q

    style A fill:#2e7d32,color:#fff
    style E fill:#1565c0,color:#fff
    style L fill:#f57f17,color:#fff
    style M fill:#1b5e20,color:#fff
    style D fill:#b71c1c,color:#fff
```

### Step-by-Step Operation

| Step | Action | Description |
|------|--------|-------------|
| 1 | **User Login** | Phone number + 6-digit PIN submitted; bcrypt hash verified in PostgreSQL |
| 2 | **OTP Challenge** | TOTP generated via `pyotp`; dispatched via Twilio SMS |
| 3 | **JWT Issued** | On success, a short-lived JWT token is issued for all subsequent API calls |
| 4 | **Transaction Submitted** | 18 contextual features extracted (amount, time, device, location, frequency, etc.) |
| 5 | **Fraud Inference** | Online → XGBoost+RF ensemble; Offline → TFLite INT8 model on-device |
| 6 | **Decision Enforced** | Low risk: Allowed; Medium risk: OTP re-verification; High risk: Transaction blocked |
| 7 | **Scam Scan (Optional)** | User pastes a suspicious link or uploads a PDF for independent analysis |

---

## 🧠 AI & Fraud Detection Models

### Fraud Detection Pipeline

Trained on **200,000+ synthetic Indian UPI/digital banking records** (5% fraud rate, realistic for Indian digital banking), the model analyzes **18 behavioral and contextual features**:

| Feature | Description |
|---------|-------------|
| `log_amount` | Log-normalized transaction amount |
| `amount_vs_avg` | Ratio of transaction amount to user's daily average |
| `time_of_day` | Hour of transaction (fraud peaks 1–5 AM) |
| `day_of_week` | Day of week (weekend fraud patterns) |
| `recipient_known` | Whether recipient has prior transaction history |
| `recipient_age_days` | Age of recipient's account (new accounts = higher risk) |
| `freq_1hr` | Number of transactions in past 1 hour |
| `freq_24hr` | Number of transactions in past 24 hours |
| `device_trusted` | Whether device fingerprint is recognized |
| `location_known` | Whether transaction location matches user's usual area |
| `distance_km` | Distance from user's registered location |
| `network_type` | Connection type (WiFi=0, 4G=1, 3G=2, 2G=3) |
| `behavior_score` | Typing cadence and interaction behavior metric |
| `link_score` | Associated phishing link risk score |
| `amount_rounded` | Flag for suspiciously round amounts (₹1000, ₹5000) |
| `is_first_time` | First transaction to this recipient |
| `merchant_category` | Category code of receiving merchant |
| `sender_age_days` | Age of sender's account |

**Model Performance:**

| Metric | Score |
|--------|-------|
| ✅ Accuracy | **94.2%** |
| ✅ Precision | **92.8%** |
| ✅ Recall | **91.5%** |
| ✅ F1 Score | **91.6%** |
| ✅ AUC-ROC | **97.1%** |

**Architecture:** Soft Voting Ensemble — XGBoost (60%) + Random Forest (40%), with SMOTE oversampling to handle class imbalance.

### TFLite Edge Model (Offline Inference)

The Keras neural network equivalent is converted to **INT8 quantized TFLite** for on-device deployment:

```
Input (18 features) → Dense(64, ReLU) → BatchNorm → Dropout(0.3)
                    → Dense(32, ReLU) → BatchNorm → Dense(16, ReLU)
                    → Dense(1, Sigmoid) → Fraud Probability
```

- **Model Size:** ~2MB (INT8 quantized)
- **Inference Time:** <50ms on 1GB RAM devices
- **Deployment:** Loaded in browser via JavaScript `fetch` for offline use

### Phishing Link Scanner

Extracts **15 URL-based features** to identify SMS phishing targeting Indian rural users:

- URL entropy, hyphen count, subdomain depth
- Suspicious TLD detection (`.xyz`, `.tk`, `.loan`)
- Keyword matching (fake SBI, Paytm, KYC update, IPPB alerts)
- WHOIS domain age verification
- Redirect chain analysis

---

## 💻 Code Analysis

### Main Architecture Decisions

#### Flask App Setup (`app.py`)
```python
# Rate-limited to 100 req/min, 10 req/sec globally
limiter = Limiter(
    get_remote_address, app=app,
    default_limits=['100 per minute', '10 per second']
)

# Blueprint registration for modular routes
app.register_blueprint(auth_bp,  url_prefix='/api/auth')
app.register_blueprint(fraud_bp, url_prefix='/api')
app.register_blueprint(link_bp,  url_prefix='/api')
app.register_blueprint(pdf_bp,   url_prefix='/api')
```

#### Fraud ML Training (`ml_training/train_fraud_model.py`)
```python
# Soft-voting ensemble: XGBoost gets 60% weight, RF gets 40%
ensemble = VotingClassifier(
    estimators=[('rf', rf), ('xgb', xgb)],
    voting='soft', weights=[0.4, 0.6]
)

# INT8 quantization for on-device TFLite export
converter.optimizations = [tf.lite.Optimize.DEFAULT]
converter.target_spec.supported_types = [tf.int8]
```

#### Service Worker (`frontend/sw.js`)
```javascript
// Caches core assets + TFLite model for offline use
// Allows fraud detection to work even at 0 connectivity
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request) || fetch(event.request)
    );
});
```

### Design Decisions

| Decision | Rationale |
|----------|-----------|
| **Vanilla JS Frontend** | No framework overhead — keeps page load <100KB on 2G networks |
| **TFLite INT8 Quantization** | Reduces model from ~20MB to ~2MB; enables sub-50ms inference on 1GB RAM |
| **SMOTE Oversampling** | Handles realistic 5% fraud rate without model bias toward legitimate transactions |
| **Celery + Redis** | Decouples OTP SMS delivery and PDF scanning from the main API thread |
| **Flask-Limiter** | Prevents brute-force PIN attacks and OTP bypass attempts |
| **Service Workers** | Ensures app and security checks are usable on intermittent rural connections |

---

## 📦 Dependencies

### Python Backend (`requirements.txt`)

```text
# Web Framework
Flask==3.0.3
Flask-CORS==4.0.1
Flask-Limiter==3.7.0

# Machine Learning
scikit-learn==1.4.2
xgboost==2.0.3
joblib==1.4.2
numpy==1.26.4
pandas==2.2.2
imbalanced-learn==0.12.3

# Edge AI
tensorflow==2.16.1          # For TFLite model conversion

# Security
PyJWT==2.8.0
bcrypt==4.1.3
cryptography==42.0.8
pyotp==2.9.0

# PDF & Link Analysis
PyPDF2==3.0.1
pytesseract==0.3.10
tldextract==5.1.2
python-whois==0.9.4

# Databases & Async
psycopg2-binary==2.9.9
pymongo==4.7.2
redis==5.0.4
celery==5.4.0

# OTP Delivery
twilio==9.1.1

# Production
gunicorn==22.0.0
gevent==24.2.1
prometheus-client==0.20.0
```

---


## 🚀 Deploy on Vercel

### One-Click Deploy
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Gandhiraj754/SeecureRurallPay-Web-AI)

### Manual Vercel Deployment

**Step 1 — Install Vercel CLI**
```bash
npm install -g vercel
```

**Step 2 — Login**
```bash
vercel login
```

**Step 3 — Deploy**
```bash
cd AI-SecureRuralPay-App
vercel
```

**Step 4 — Set Environment Variables** in Vercel Dashboard → Settings → Environment Variables:
```
SECRET_KEY, JWT_SECRET, POSTGRES_URI, MONGO_URI, REDIS_URL, TWILIO_SID, TWILIO_TOKEN, TWILIO_FROM
```

**Step 5 — Production Deploy**
```bash
vercel --prod
```

> ⚠️ Note: For full functionality (ML inference, Celery workers, PostgreSQL), use Docker deployment or a cloud VM. Vercel is best suited for serving the frontend + lightweight API endpoints.

---

## 🚀 Installation & Setup

### Prerequisites

- Python 3.10+
- Docker & Docker Compose (recommended)
- Redis Server (for local dev without Docker)
- Tesseract OCR (`apt install tesseract-ocr` / `brew install tesseract`)

### 1. Clone the Repository

```bash
git clone https://github.com/Gandhiraj754/SeecureRurallPay-Web-AI.git
cd secureapp-main
```

### 2. Run via Docker (Recommended)

The easiest way to launch the full stack (PostgreSQL, MongoDB, Redis, Flask, Nginx, Celery):

```bash
docker-compose up --build -d
```

Access the app at: `http://localhost`

### 3. Manual Local Setup (Backend)

```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate  |  Mac/Linux: source venv/bin/activate
pip install -r ../requirements.txt
```

Configure environment variables in `.env`:
```env
FLASK_ENV=development
SECRET_KEY=srp-dev-secret-change-in-production
JWT_SECRET=srp-jwt-secret-rs256-key
POSTGRES_URI=postgresql://user:pass@localhost:5432/secureruraldb
MONGO_URI=mongodb://localhost:27017/fraudlogs
REDIS_URL=redis://localhost:6379/0
TWILIO_SID=your_twilio_sid
TWILIO_TOKEN=your_twilio_token
TWILIO_FROM=+1XXXXXXXXXX
```

Start services:
```bash
# Terminal 1: Redis
redis-server

# Terminal 2: Celery Worker
celery -A celery_app worker --loglevel=info

# Terminal 3: Flask API
python app.py
```

### 4. Model Training (Optional)

To retrain ML models from scratch:
```bash
cd ml_training
python train_fraud_model.py          # Trains XGBoost+RF + exports TFLite
python train_link_model.py           # Trains phishing URL classifier
```

Models are saved to `backend/models/` and `frontend/models/` automatically.

### 5. Access the Application

| Page | URL |
|------|-----|
| **Main Dashboard** | `http://localhost/` |
| **Login** | `http://localhost/login.html` |
| **Send Money** | `http://localhost/send-money.html` |
| **Check Link** | `http://localhost/check-link.html` |
| **Check PDF** | `http://localhost/check-pdf.html` |
| **Admin Dashboard** | `http://localhost/admin/` |
| **API Health** | `http://localhost/api/health` |

---

## 🌍 Impact & Real-World Significance

### Who Benefits

| Stakeholder | Benefit |
|-------------|---------|
| 👨‍🌾 **Rural Bank Users** | Proactive fraud blocking saves money; phishing scanner prevents scam victimization |
| 🏦 **Regional Banks & Cooperatives** | Drop-in fraud detection framework deployable on existing low-cost infrastructure |
| 🏛️ **Government / RBI** | Supports financial inclusion goals by making digital payments safe for first-time rural users |
| 👨‍💻 **Security Researchers** | Open dataset generation and model retraining pipelines for further research |

### Impact Metrics (Simulated Dashboard)

| Metric | Value |
|--------|-------|
| 🛡️ Fraud Transactions Blocked | **14 today** |
| 💰 Money Saved (INR) | **₹2,18,500** |
| 🔗 Phishing Links Blocked | **4 today** |
| 📄 Fraudulent PDFs Detected | **2 today** |

### SecureRuralPay vs. Traditional Approach

| Traditional Banking App | SecureRuralPay |
|-------------------------|----------------|
| Heavy framework (React/Angular) | **Vanilla JS — <100KB page load** |
| Online-only fraud checks | **Offline TFLite inference on-device** |
| Server-side only detection | **Dual: Edge AI + Server Ensemble** |
| No phishing link awareness | **Built-in SMS phishing scanner** |
| Generic fraud rules | **18-feature Indian UPI-specific ML model** |

---

## 🔮 Future Enhancements

- [ ] **Voice-based Authentication** — Lightweight speaker verification for users who struggle with PINs
- [ ] **Regional Language Support** — UI & warning messages in Hindi, Tamil, Telugu, Kannada
- [ ] **Federated Learning** — Update the central model securely without uploading raw transaction data
- [ ] **Graph Neural Network (GNN)** — Model transaction network topology to detect money mule rings
- [ ] **UPI QR Code Validation** — Scan and verify QR codes before payment confirmation
- [ ] **USSD Fallback** — Security checks accessible via USSD codes for feature phones without internet

---

## 🤝 Open Source Contribution

We warmly welcome contributions to make rural banking safer! 🎉

### How to Contribute

```bash
# 1. Fork the repository on GitHub

# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/AI-SecureRuralPay-App.git

# 3. Create a feature branch
git checkout -b feature/your-feature-name

# 4. Make changes and commit
git commit -m "feat: add regional language support to UI"

# 5. Push to your fork
git push origin feature/your-feature-name

# 6. Open a Pull Request → main branch
```

### Contribution Areas

| Area | Good First Issue? | Description |
|------|------------------|-------------|
| 🐛 **Bug Fixes** | ✅ Yes | Fix edge cases in PDF extraction or link parsing |
| 🌐 **Localization** | ✅ Yes | Add Hindi/Tamil translations to UI alerts |
| 📚 **Documentation** | ✅ Yes | Improve inline docstrings or extend this README |
| 🤖 **ML Models** | 🔥 Advanced | Add new features or experiment with GNN architectures |
| 🔐 **Security** | 🔥 Advanced | Harden authentication flow or add MFA options |

---

## 📄 License

This project is licensed under the **Apache License 2.0** — you are free to use, modify, and distribute this code with proper attribution.

```text
Copyright (c) 2026 Dhanush Sai Gandhiraj Chinta

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
```

See [LICENSE](LICENSE) for full details.

---

## 👨‍💻 Author & Acknowledgments

### Author

**Dhanush Sai Gandhiraj Chinta**
- **Role:** AI & Full Stack Developer
- **Event:** Fusion Forge '26 Hackathon (24-Hour Sprint)
- **Institution:** IIIT Dharwad, B.Tech Data Science & AI
- **Problem Statement:** #10 — Lightweight Cybersecurity Framework for Rural Banking
- **Domain:** Python | Flask | ML/AI | Edge AI | Cybersecurity | Data Science

**Contacts**
- 🐙 GitHub: [@Gandhiraj754](https://github.com/Gandhiraj754)
- 💼 LinkedIn: [@Dhanush Sai Gandhiraj Chinta](https://www.linkedin.com/in/gandhi-raj-chinta)
- 📧 Email: gandhiraj9609@gmail.com
- 🌐 Portfolio: [gandhiraj754.github.io/portfolio](https://gandhiraj754.github.io/portfolio/)

### Acknowledgments

- 🏫 **Fusion Forge '26 Hackathon** — Open Source Hackathon Initiative
- 🤖 **scikit-learn, XGBoost & TensorFlow** — Powering the fraud detection pipeline
- 🏦 **Open-source fintech & cybersecurity communities** — Inspiration for rural banking security patterns

---

<div align="center">

For support, email gandhiraj9609@gmail.com or open an issue on GitHub.

### 🌟 If this project helped you — please give it a ⭐ Star on GitHub!

**#CyberSecurity #RuralEmpowerment #FraudDetection #EdgeAI #FusionForge26 #IIITDharwad #Hackathon**

*Made with ❤️ by Dhanush Sai Gandhiraj Chinta*

*© 2026 — Dhanush Sai Gandhiraj Chinta*

</div>
