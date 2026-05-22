FROM python:3.11-slim

# System dependencies for OCR, PDF processing
RUN apt-get update && apt-get install -y \
    tesseract-ocr tesseract-ocr-hin tesseract-ocr-eng \
    poppler-utils libmagic1 curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python deps
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt \
    --index-url https://pypi.org/simple/

# Copy source
COPY backend/ ./backend/

# Non-root user for security
RUN adduser --disabled-password --gecos '' srp && chown -R srp:srp /app
USER srp

ENV FLASK_ENV=production
ENV PORT=5000

EXPOSE 5000

CMD ["gunicorn", \
     "--bind", "0.0.0.0:5000", \
     "--worker-class", "gevent", \
     "--workers", "4", \
     "--timeout", "120", \
     "--keep-alive", "5", \
     "backend.app:app"]
