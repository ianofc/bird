# Usa uma imagem oficial do Python leve
FROM python:3.11-slim

# Evita que o Python escreva ficheiros .pyc e define buffer de stdout
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Instala dependências do sistema necessárias para compilar pacotes
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*

# Copia o ficheiro de requisitos e instala as dependências Python
COPY requirements.txt /app/
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copia todo o código do projeto para dentro do container
COPY . /app/

# Expõe a porta que o Django vai usar
EXPOSE 8002

# Comando padrão (será substituído pelo docker-compose, mas é boa prática)
CMD ["python", "manage.py", "runserver", "0.0.0.0:8002"]