FROM node:22-alpine AS builder
WORKDIR /app/backend

COPY package*.json ./
RUN npm ci 

COPY . .
RUN npm run build

FROM node:22-alpine 
WORKDIR /app/backend

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/backend/dist ./dist

EXPOSE 4000
CMD ["node", "dist/index.js"]




