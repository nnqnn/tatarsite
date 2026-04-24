# ТатарСайт

Полнофункциональное веб-приложение для русскоязычной аудитории:
- регистрация и вход пользователей
- одноразовый онбординг с выбором интересов
- персональная лента рекомендаций
- добавление собственных мест с геоданными и изображениями
- лайки/дизлайки и древовидные комментарии
- генерация маршрутов
- адаптивный интерфейс для мобильных и десктопа

## Стек
- Frontend: React + Vite + shadcn/ui
- Backend: Node.js + Express + TypeScript
- База данных: PostgreSQL + Prisma

## Локальный запуск

### 1. Установите зависимости
```bash
npm install
cd server && npm install && cd ..
```

### 2. Поднимите PostgreSQL (без Docker)
Если PostgreSQL не установлен:
```bash
sudo apt update
sudo apt install -y postgresql postgresql-contrib
```

Запустите сервис:
```bash
sudo systemctl enable --now postgresql
```

Создайте БД и пользователя:
```bash
sudo -u postgres psql -c "CREATE USER tatarsite_user WITH ENCRYPTED PASSWORD 'tatarsite_pass';"
sudo -u postgres psql -c "CREATE DATABASE tatarsite OWNER tatarsite_user;"
```

### 3. Настройте переменные окружения backend
```bash
cp server/.env.example server/.env
```

Измените `server/.env`:
```env
DATABASE_URL="postgresql://tatarsite_user:tatarsite_pass@localhost:5432/tatarsite?schema=public"
```

### 4. Примените миграции и заполните тестовыми данными
```bash
cd server
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
cd ..
```

### 5. Настройте переменные окружения frontend
```bash
cp .env.example .env
```

### 6. Запустите frontend + backend
```bash
npm run dev:full
```

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:4000/api/v1`

## Тестовые пользователи после seed
- `admin@tatarsite.ru`
- `gulnara@tatarsite.ru`
- `farid@tatarsite.ru`

Пароль для всех: `Qwerty123!`

## Сборка
```bash
npm run build
npm run build:server
```

## Деплой
Полная инструкция: [DEPLOYMENT.md](DEPLOYMENT.md)
Инструкция для Apache2: [DEPLOYMENT_APACHE2.md](DEPLOYMENT_APACHE2.md)
