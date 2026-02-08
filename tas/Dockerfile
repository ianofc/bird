FROM python:3.10-slim

# Instala netcat, dependências de compilação e gcc
RUN apt-get update && apt-get install -y netcat-openbsd libpq-dev gcc && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# CORREÇÃO CRÍTICA: Converte CRLF para LF (Windows -> Linux) e dá permissão de execução
RUN sed -i 's/\r$//' scripts/start.sh && \
    chmod +x scripts/start.sh

EXPOSE 8004

CMD ["./scripts/start.sh"]