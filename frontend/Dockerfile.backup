FROM node:18-alpine

WORKDIR /app

# Copia arquivos de dependência
COPY package.json package-lock.json* bun.lockb* ./

# Instala dependências (tenta npm, se falhar usa bun se disponível, mas force npm aqui pela compatibilidade)
RUN npm install

# Copia o resto do código
COPY . .

# Expõe a porta do Vite
EXPOSE 5173

# Inicia em modo de desenvolvimento com host liberado para o Docker
CMD ["npm", "run", "dev", "--", "--host"]