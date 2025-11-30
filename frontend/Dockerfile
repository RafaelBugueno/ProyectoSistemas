# Frontend Dockerfile: build Vite app and serve with Nginx
# 1) Build stage
FROM node:20-alpine AS build
WORKDIR /app

# Dependencies first for better caching
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN if [ -f package-lock.json ]; then npm ci; \
    elif [ -f pnpm-lock.yaml ]; then npm install -g pnpm && pnpm i --frozen-lockfile; \
    elif [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
    else npm i; fi

# Pass backend URL at build time for Vite
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

# Copy source and build
COPY . .
RUN npm run build

# 2) Runtime stage
FROM nginx:1.25-alpine
WORKDIR /usr/share/nginx/html

# Copy build output
COPY --from=build /app/build .

# Nginx config for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
