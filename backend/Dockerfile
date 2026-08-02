FROM node:22-bookworm-slim AS builder
WORKDIR /app/backend

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY prisma.config.ts ./
COPY prisma ./prisma

RUN npm ci 
RUN npx prisma generate

COPY . .
RUN npm run build

FROM node:22-bookworm-slim
WORKDIR /app/backend

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY prisma ./prisma

RUN npm install --omit=dev
RUN npx prisma generate


COPY --from=builder /app/backend/dist ./dist

EXPOSE 4000
CMD ["node", "dist/index.js"]




