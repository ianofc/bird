FROM python:3.11-slim

# Metadados
LABEL maintainer="PentaIA Engineering Hub"
LABEL service="TAS - Matrix Suite"
LABEL version="2.2.0"

# Ambiente
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONFAULTHANDLER=1 \
    PIP_NO_CACHE_DIR=off \
    PIP_DISABLE_PIP_VERSION_CHECK=on \
    PORT=8001 \
    HOST=0.0.0.0 \
    RELOAD=true

WORKDIR /app

# Dependências de sistema
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    curl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Instala Python deps
COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Código
COPY . .

# Usuário não-root
RUN useradd -m pentaia && \
    chown -R pentaia:pentaia /app
USER pentaia

EXPOSE 8001

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8001/ || exit 1

CMD ["python", "main.py"]