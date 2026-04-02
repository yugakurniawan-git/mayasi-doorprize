#!/bin/bash
set -e

echo "🚀 Starting Doorprize Development Setup..."

cd /workspaces/mayasi-doorprize

# ── 1. Install Node.js ────────────────────────────────────────────────────────
echo "📦 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y nodejs

# ── 2. Install & start MariaDB ────────────────────────────────────────────────
echo "📦 Installing MariaDB..."
apt-get install -y mariadb-server
service mariadb start
sleep 2

# Create database
mysql <<SQL
CREATE DATABASE IF NOT EXISTS doorprize;
SQL
echo "✅ Database created"

# ── 3. Install Redis ──────────────────────────────────────────────────────────
echo "📦 Installing Redis..."
apt-get install -y redis-server
service redis-server start
echo "✅ Redis started"

# ── 4. Setup .env ─────────────────────────────────────────────────────────────
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

# ── 5. Install PHP & Node dependencies ───────────────────────────────────────
echo "📦 Installing PHP dependencies..."
composer install --no-interaction

echo "📦 Installing Node dependencies..."
npm install

# ── 6. Generate keys ──────────────────────────────────────────────────────────
echo "🔐 Generating keys..."
php artisan key:generate --force
php artisan jwt:secret --force

# ── 7. Storage setup ──────────────────────────────────────────────────────────
mkdir -p storage/logs storage/app/public bootstrap/cache
chmod -R 775 storage bootstrap/cache
php artisan storage:link || true

# ── 8. Migrate & seed ─────────────────────────────────────────────────────────
echo "🗄️  Running migrations & seeding..."
php artisan migrate --seed --force

echo ""
echo "✅ ─── Setup complete! ────────────────────────────────"
echo ""
echo "  Terminal 1: php artisan serve --host=0.0.0.0 --port=8000"
echo "  Terminal 2: npm run dev"
echo ""
echo "  Login:"
echo "  Email   : admin@manohara-asri.com"
echo "  Password: password"
echo "──────────────────────────────────────────────────────"
