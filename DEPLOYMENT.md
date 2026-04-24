# DEPLOYMENT.md

Полная инструкция по деплою `ТатарСайт` в production.

## 1. Целевая схема

- Frontend (Vite build) отдаётся через Nginx
- Backend (Express) запускается как systemd-сервис
- PostgreSQL как отдельный сервис/managed DB
- HTTPS через Let's Encrypt

## 2. Требования к серверу

Минимум:
- Ubuntu 22.04+
- 2 vCPU / 4 GB RAM / 30+ GB SSD
- Домен, указывающий на сервер (A-запись)

ПО:
- Node.js 20+
- npm 10+
- PostgreSQL 16+
- Nginx
- Certbot

## 3. Подготовка сервера

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y nginx postgresql postgresql-contrib git curl
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
```

## 4. Клонирование проекта

```bash
cd /var/www
sudo git clone <YOUR_REPO_URL> tatarsite
sudo chown -R $USER:$USER /var/www/tatarsite
cd /var/www/tatarsite
```

## 5. Установка зависимостей

```bash
npm install
cd server && npm install && cd ..
```

## 6. Настройка PostgreSQL

```bash
sudo -u postgres psql
```

Внутри `psql`:
```sql
CREATE DATABASE tatarsite;
CREATE USER tatarsite_user WITH ENCRYPTED PASSWORD 'STRONG_PASSWORD_HERE';
GRANT ALL PRIVILEGES ON DATABASE tatarsite TO tatarsite_user;
\q
```

## 7. Переменные окружения

### 7.1 Backend

```bash
cp server/.env.example server/.env
nano server/.env
```

Пример production-значений:
```env
PORT=4000
NODE_ENV=production
DATABASE_URL="postgresql://tatarsite_user:STRONG_PASSWORD_HERE@localhost:5432/tatarsite?schema=public"
JWT_ACCESS_SECRET="LONG_RANDOM_SECRET_1"
JWT_REFRESH_SECRET="LONG_RANDOM_SECRET_2"
ACCESS_TOKEN_TTL="15m"
REFRESH_TOKEN_TTL_DAYS=30
CORS_ORIGIN="https://your-domain.ru"
UPLOAD_DIR="uploads"
```

### 7.2 Frontend

```bash
cp .env.example .env
nano .env
```

```env
VITE_API_URL="https://your-domain.ru/api/v1"
```

## 8. Миграции и seed

```bash
cd /var/www/tatarsite/server
npm run prisma:generate
npm run prisma:migrate
# seed — опционально для production
# npm run prisma:seed
```

## 9. Сборка

```bash
cd /var/www/tatarsite
npm run build
cd server && npm run build && cd ..
```

## 10. Запуск backend как systemd-сервис

Создайте файл:
```bash
sudo nano /etc/systemd/system/tatarsite-api.service
```

Содержимое:
```ini
[Unit]
Description=TatarSite API
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/tatarsite/server
Environment=NODE_ENV=production
ExecStart=/usr/bin/node /var/www/tatarsite/server/dist/src/index.js
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Запуск:
```bash
sudo systemctl daemon-reload
sudo systemctl enable tatarsite-api
sudo systemctl start tatarsite-api
sudo systemctl status tatarsite-api
```

## 11. Конфиг Nginx

```bash
sudo nano /etc/nginx/sites-available/tatarsite
```

```nginx
server {
    listen 80;
    server_name your-domain.ru www.your-domain.ru;

    root /var/www/tatarsite/build;
    index index.html;

    location / {
        try_files $uri /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:4000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /uploads/ {
        proxy_pass http://127.0.0.1:4000/uploads/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
```

Включение сайта:
```bash
sudo ln -s /etc/nginx/sites-available/tatarsite /etc/nginx/sites-enabled/tatarsite
sudo nginx -t
sudo systemctl reload nginx
```

## 12. HTTPS (Let's Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.ru -d www.your-domain.ru
```

Проверка автообновления сертификата:
```bash
sudo systemctl status certbot.timer
```

## 13. Обновление приложения

```bash
cd /var/www/tatarsite
git pull
npm install
cd server && npm install && cd ..
npm run build
cd server && npm run build && npm run prisma:migrate && cd ..
sudo systemctl restart tatarsite-api
sudo systemctl reload nginx
```

## 14. Резервные копии PostgreSQL

Ручной бэкап:
```bash
pg_dump -U tatarsite_user -h localhost tatarsite > /var/backups/tatarsite_$(date +%F).sql
```

Рекомендуется добавить cron-задачу с ротацией бэкапов.

## 15. Проверка после деплоя

- `https://your-domain.ru` открывается
- `https://your-domain.ru/api/v1/health` возвращает `status: ok`
- регистрация, вход, онбординг, добавление места, лента, комментарии работают

## 16. Что важно для русскоязычного релиза

- Контент интерфейса должен оставаться на русском
- Базовые seed-данные и категории проверяйте на русские подписи
- Для production рекомендуется подключить модерацию пользовательского контента
