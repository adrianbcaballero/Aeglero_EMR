# Stage 1: Build the React app with Vite
FROM node:20-alpine AS builder

WORKDIR /app

ENV VITE_API_BASE=https://cpp-hackathon-2025-production.up.railway.app

COPY . .
RUN npm install --legacy-peer-deps && npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf  
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
