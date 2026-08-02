# SENIOR (2026-08-01, "docker, script, tudo facil pra dar deploy em prod"):
# mesmo padrao multi-stage do Dockerfile do Viver Bem (build compila TS,
# runtime so leva o dist/ + deps de producao - imagem final bem mais leve
# que carregar node_modules de dev + codigo fonte).

# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache python3 make g++
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

# Stage 2: Production Runtime
FROM node:20-alpine AS runner
RUN apk add --no-cache curl
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
RUN npm install --omit=dev --legacy-peer-deps

EXPOSE 3101
CMD ["node", "dist/main"]
