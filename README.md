# 🔐 SecureRuralPay Web AI

### Lightweight Cybersecurity Framework for Rural Digital Banking

![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-3.0.3-000000?style=for-the-badge&logo=flask&logoColor=white)
![XGBoost](https://img.shields.io/badge/ML-XGBoost%20%7C%20RandomForest-FF6F00?style=for-the-badge&logo=scikit-learn&logoColor=white)
![TFLite](https://img.shields.io/badge/Edge%20AI-TFLite%20INT8%20~2MB-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)

---

## 📌 Overview

SecureRuralPay Web AI is a lightweight cybersecurity framework designed to secure digital banking transactions for rural users using:

- AI-powered fraud detection
- Offline-capable Edge AI inference
- Phishing protection
- PDF scam analysis
- Multi-layer authentication
- Low-bandwidth optimization

The platform is optimized for:
- Low-end smartphones
- Rural connectivity conditions
- Limited bandwidth environments
- Lightweight browser execution

---

# 📋 Features

## 🔐 Authentication
- Phone + PIN authentication
- OTP verification
- JWT-based sessions
- Device trust validation
- Account lockout protection

## 🧠 AI Fraud Detection
- XGBoost + RandomForest ensemble
- 18-feature fraud analysis
- TFLite offline model (~2MB)
- Real-time transaction scoring
- Behavioral anomaly detection

## 🔗 Phishing Detection
- URL heuristic analysis
- Suspicious TLD detection
- Domain age verification
- Redirect chain analysis

## 📄 PDF Scam Analyzer
- OCR extraction
- Suspicious keyword detection
- Fraud pattern analysis
- Fake banking document detection

## 🌐 Offline Support
- Service workers
- Cached ML models
- Offline fraud scoring
- Lightweight frontend

---

# 🛠️ Tech Stack

## Backend
- Flask
- Celery
- Redis
- PostgreSQL
- MongoDB
- Gunicorn
- Nginx

## Machine Learning
- scikit-learn
- XGBoost
- TensorFlow Lite
- SMOTE
- pandas
- numpy

## Security
- bcrypt
- JWT
- pyotp
- Flask-Limiter

## Frontend
- HTML5
- CSS3
- Vanilla JavaScript
- Service Workers

---

# 📁 Project Structure

```text
secureapp-main/
│
├── backend/
│   ├── auth/
│   ├── fraud/
│   ├── link_scanner/
│   ├── pdf_analyzer/
│   ├── database/
│   └── app.py
│
├── frontend/
│   ├── css/
│   ├── js/
│   ├── admin/
│   ├── index.html
│   ├── login.html
│   ├── send-money.html
│   ├── check-link.html
│   ├── check-pdf.html
│   ├── history.html
│   └── sw.js
│
├── ml_training/
│   ├── train_fraud_model.py
│   └── train_link_model.py
│
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
└── README.md
```

---

# 🔬 System Architecture

```text
[Rural User Device]
        ↓
[Authentication Layer]
        ↓
[Flask Backend API]
        ↓
 ┌───────────────┬────────────────┐
 │               │                │
Fraud       Link Scanner      PDF Analyzer
Detection
 │
 ├── Online → Server ML Model
 └── Offline → TFLite Model
```

---

# 🧠 Fraud Detection Model

## Features Used

- Transaction amount
- Frequency analysis
- Device trust
- Location mismatch
- Recipient history
- Time-of-day anomalies
- Behavioral score
- Link risk score
- Merchant category
- Transaction velocity

## Performance

| Metric | Score |
|--------|-------|
| Accuracy | 94.2% |
| Precision | 92.8% |
| Recall | 91.5% |
| F1 Score | 91.6% |
| ROC-AUC | 97.1% |

---

# 🚀 Installation

## Clone Repository

```bash
git clone https://github.com/Gandhiraj754/SeecureRurallPay-Web-AI.git
cd secureapp-main
```

---

## Docker Setup

```bash
docker-compose up --build -d
```

Access:
```text
http://localhost
```

---

## Manual Setup

### Create Virtual Environment

```bash
python -m venv venv
```

### Activate

Windows:
```bash
venv\Scripts\activate
```

Linux/Mac:
```bash
source venv/bin/activate
```

### Install Requirements

```bash
pip install -r requirements.txt
```

---

# ⚙️ Environment Variables

```env
FLASK_ENV=development
SECRET_KEY=change_this
JWT_SECRET=jwt_secret_key

POSTGRES_URI=postgresql://user:pass@localhost:5432/secureruraldb
MONGO_URI=mongodb://localhost:27017/fraudlogs
REDIS_URL=redis://localhost:6379/0

TWILIO_SID=your_sid
TWILIO_TOKEN=your_token
TWILIO_FROM=+91XXXXXXXXXX
```

---

# ▶️ Run Application

## Redis
```bash
redis-server
```

## Celery Worker
```bash
celery -A celery_app worker --loglevel=info
```

## Flask App
```bash
python app.py
```

---

# 🌍 Application Routes

| Page | URL |
|------|------|
| Home | `/` |
| Login | `/login.html` |
| Send Money | `/send-money.html` |
| Link Scanner | `/check-link.html` |
| PDF Scanner | `/check-pdf.html` |
| History | `/history.html` |
| Admin Dashboard | `/admin/` |

---

# 📦 Dependencies

```txt
Flask==3.0.3
Flask-CORS==4.0.1
Flask-Limiter==3.7.0
scikit-learn==1.4.2
xgboost==2.0.3
tensorflow==2.16.1
PyJWT==2.8.0
bcrypt==4.1.3
pyotp==2.9.0
PyPDF2==3.0.1
pytesseract==0.3.10
tldextract==5.1.2
python-whois==0.9.4
psycopg2-binary==2.9.9
pymongo==4.7.2
redis==5.0.4
celery==5.4.0
gunicorn==22.0.0
```

---

# 🔮 Future Enhancements

- Voice authentication
- Regional language support
- QR verification
- Federated learning
- Graph neural network fraud detection
- Feature phone support

---

# 👨‍💻 Author

## Dhanush Sai Gandhiraj Chinta

- AI Engineer
- Full Stack Developer
- Data Science & Cybersecurity Enthusiast
- IIIT Dharwad

### Contact

- GitHub: https://github.com/Gandhiraj754
- LinkedIn: https://linkedin.com/in/gandhi-raj-chinta
- Email: gandhiraj9609@gmail.com
- Portfolio: https://gandhiraj754.github.io/portfolio/

---

# 📄 License

Apache License 2.0

---

# 🌟 Support

If you found this project useful, consider giving it a star on GitHub.

## Tags

#CyberSecurity #FraudDetection #EdgeAI #DigitalSecurity #RuralBanking
