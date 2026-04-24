# DEPLOYMENT_APACHE2.md

Инструкция по развёртыванию `ТатарСайт` на сервере с `Apache2` (frontend + backend API + PostgreSQL).

## 1. Архитектура

- Frontend: статическая сборка Vite (`build/`)
- Backend: Node.js/Express как systemd-сервис (`127.0.0.1:4000`)
- База данных: PostgreSQL
- Apache2:
  - отдаёт frontend
  - проксирует `/api/*` и `/uploads/*` в backend
- HTTPS: Let's Encrypt (certbot + mod_ssl)

## 2. Требования

- Ubuntu 22.04+
- Домен `your-domain.ru`, направленный на сервер
- Права sudo

Установить пакеты:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y apache2 postgresql postgresql-contrib git curl
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

## 3. Клонирование и установка

```bash
cd /var/www
sudo git clone <YOUR_REPO_URL> tatarsite
sudo chown -R $USER:$USER /var/www/tatarsite
cd /var/www/tatarsite

npm install
cd server && npm install && cd ..
```

## 4. PostgreSQL

```bash
sudo -u postgres psql
```

Внутри psql:

```sql
CREATE DATABASE tatarsite;
CREATE USER tatarsite_user WITH ENCRYPTED PASSWORD 'STRONG_PASSWORD_HERE';
GRANT ALL PRIVILEGES ON DATABASE tatarsite TO tatarsite_user;
\q
```

## 5. Переменные окружения

### Backend

```bash
cp server/.env.example server/.env
nano server/.env
```

Пример:

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

### Frontend

```bash
cp .env.example .env
nano .env
```

```env
VITE_API_URL="https://your-domain.ru/api/v1"
```

## 6. Миграции и сборка

```bash
cd /var/www/tatarsite/server
npm run prisma:generate
npm run prisma:migrate
# при необходимости демо-данных:
# npm run prisma:seed

cd /var/www/tatarsite
npm run build
cd server && npm run build && cd ..
```

## 7. systemd сервис backend

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

## 8. Apache2 модули

```bash
sudo a2enmod rewrite proxy proxy_http headers ssl
sudo systemctl restart apache2
```

## 9. VirtualHost Apache2

```bash
sudo nano /etc/apache2/sites-available/tatarsite.conf
```

```apache
<VirtualHost *:80>
    ServerName your-domain.ru
    ServerAlias www.your-domain.ru

    DocumentRoot /var/www/tatarsite/build

    <Directory /var/www/tatarsite/build>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted

        RewriteEngine On
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule ^ /index.html [L]
    </Directory>

    ProxyPreserveHost On

    # API
    ProxyPass /api/ http://127.0.0.1:4000/api/
    ProxyPassReverse /api/ http://127.0.0.1:4000/api/

    # Uploads
    ProxyPass /uploads/ http://127.0.0.1:4000/uploads/
    ProxyPassReverse /uploads/ http://127.0.0.1:4000/uploads/

    ErrorLog ${APACHE_LOG_DIR}/tatarsite_error.log
    CustomLog ${APACHE_LOG_DIR}/tatarsite_access.log combined
</VirtualHost>
```

Активировать сайт:

```bash
sudo a2dissite 000-default.conf
sudo a2ensite tatarsite.conf
sudo apache2ctl configtest
sudo systemctl reload apache2
```

## 10. HTTPS через Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-apache
sudo certbot --apache -d your-domain.ru -d www.your-domain.ru
```

Проверка автообновления:

```bash
sudo systemctl status certbot.timer
```

## 11. Обновление продакшена

```bash
cd /var/www/tatarsite
git pull
npm install
cd server && npm install && cd ..

npm run build
cd server && npm run build && npm run prisma:migrate && cd ..

sudo systemctl restart tatarsite-api
sudo systemctl reload apache2
```

## 12. Проверка после деплоя

- `https://your-domain.ru` открывает приложение
- `https://your-domain.ru/api/v1/health` отвечает `status: ok`
- работают регистрация, онбординг, добавление места, рекомендации, комментарии, маршруты

## 13. Полезная диагностика

```bash
journalctl -u tatarsite-api -n 200 --no-pager
sudo tail -n 200 /var/log/apache2/tatarsite_error.log
sudo tail -n 200 /var/log/apache2/tatarsite_access.log
```
