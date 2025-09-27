FROM node:18-alpine AS build-stage

WORKDIR /app

# Копіювання файлів залежностей
COPY package*.json ./

# Встановлення залежностей
RUN npm ci --only=production --prefer-offline

# Копіювання джерельного коду
COPY . .

# Будівництво додатку
RUN npm run build

# Production stage
FROM nginx:stable-alpine as production-stage

# Копіювання побудованих файлів
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Копіювання конфігурації nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Налаштування SSL (опціонально)
RUN mkdir -p /etc/nginx/ssl

# Відкриття портів
EXPOSE 80 443

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]