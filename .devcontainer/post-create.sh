#!/bin/bash
set -e

echo "🚀 Starting Doorprize Development Setup..."
cd /workspaces/mayasi-doorprize

# ── 1. Start services ─────────────────────────────────────────────────────────
echo "🔧 Starting MariaDB & Redis..."
service mariadb start
sleep 2
service redis-server start

# Create database
mysql -u root <<SQL
CREATE DATABASE IF NOT EXISTS doorprize;
SQL
echo "✅ Database 'doorprize' ready"

# ── 2. Setup .env ─────────────────────────────────────────────────────────────
echo "📋 Setting up .env..."
if [ ! -f .env ]; then
  cp .env.example .env
fi

sed -i 's/^DB_HOST=.*/DB_HOST=127.0.0.1/' .env
sed -i 's/^DB_PORT=.*/DB_PORT=3306/' .env
sed -i 's/^DB_USERNAME=.*/DB_USERNAME=root/' .env
sed -i 's/^DB_PASSWORD=.*/DB_PASSWORD=/' .env
sed -i 's/^DB_DATABASE=.*/DB_DATABASE=doorprize/' .env
sed -i 's/^REDIS_HOST=.*/REDIS_HOST=127.0.0.1/' .env
sed -i 's/^REDIS_PORT=.*/REDIS_PORT=6379/' .env
sed -i 's/^APP_URL=.*/APP_URL=http:\/\/localhost:8000/' .env
sed -i 's/^VITE_BASE_URL=.*/VITE_BASE_URL=http:\/\/localhost:8000/' .env
sed -i 's/^SESSION_DRIVER=.*/SESSION_DRIVER=file/' .env
sed -i 's/^CACHE_STORE=.*/CACHE_STORE=file/' .env
sed -i 's/^FILESYSTEM_DISK=.*/FILESYSTEM_DISK=public/' .env
sed -i "s/^VITE_API_KEY=.*/VITE_API_KEY=devkey123456/" .env

# ── 3. Install dependencies ───────────────────────────────────────────────────
echo "📦 Installing PHP dependencies..."
composer install --no-interaction

echo "📦 Installing Node dependencies..."
npm install

# ── 4. Generate keys ──────────────────────────────────────────────────────────
echo "🔐 Generating keys..."
php artisan key:generate --force
php artisan jwt:secret --force

# ── 5. Storage ────────────────────────────────────────────────────────────────
echo "📁 Setting up storage..."
mkdir -p storage/logs storage/app/public bootstrap/cache
chmod -R 775 storage bootstrap/cache
php artisan storage:link || true

# ── 6. Migrate & seed ─────────────────────────────────────────────────────────
echo "🗄️  Running migrations & seeding..."
php artisan migrate --seed --force

echo ""
echo "✅ ─── Setup complete! ──────────────────────────────"
echo ""
echo "  Terminal 1: php artisan serve --host=0.0.0.0 --port=8000"
echo "  Terminal 2: npm run dev"
echo ""
echo "  Login: admin@manohara-asri.com / password"
echo "────────────────────────────────────────────────────"
