FROM node:18-alpine

WORKDIR /app

# Copiar arquivos de dependências primeiro (cache)
COPY package.json package-lock.json* ./

# Instalar TODAS as dependências incluindo devDependencies
# --include=dev é crucial para @vitejs/plugin-react
RUN npm ci --include=dev || npm install

# Copiar código fonte
COPY . .

EXPOSE 8080

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
