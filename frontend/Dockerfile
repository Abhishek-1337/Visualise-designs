FROM node:22-alpine as builder
WORKDIR /app/frontend

COPY package*.json .
RUN npm ci

COPY . .
RUN npm run build


FROM node:22-alpine

RUN npm install -g serve

COPY --from=builder /app/frontend/build ./build

EXPOSE 4173

CMD ["serve", "-s", "build", "-l", "4173"]


##Old code that I tried
# FROM node:22-alpine 
# WORKDIR /app/frontend

# COPY --from=builder /app/frontend/build ./build

# RUN npm install -g serve

# CMD ["serve", "-s", "/app/frontend/build", "-l", "4173"]