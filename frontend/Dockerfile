# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Установка зависимостей
COPY package*.json ./
RUN npm ci

# Копирование исходного кода
COPY . .

# Создание production build
RUN npm run build

# Production stage
FROM nginx:alpine

# Копирование собранных файлов
COPY --from=build /app/build /usr/share/nginx/html

# Копирование конфига nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Установка прав
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"] 