FROM node:22-alpine as builder
WORKDIR /app/frontend

COPY package*.json .
RUN npm ci

COPY . .
RUN npm run build


FROM nginx:alpine
COPY --from=builder /app/frontend/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]


##Old code that I tried
# FROM node:22-alpine 
# WORKDIR /app/frontend

# COPY --from=builder /app/frontend/build ./build

# RUN npm install -g serve

# CMD ["serve", "-s", "/app/frontend/build", "-l", "4173"]