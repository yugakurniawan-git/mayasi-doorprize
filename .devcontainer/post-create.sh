#!/bin/bash
set -e

echo "🚀 Starting Doorprize Development Setup..."

# ── 1. Install MySQL & Redis via apt ─────────────────────────────────────────
echo "📦 Installing MySQL & Redis..."
sudo apt-get update -qq
sudo DEBIAN_FRONTEND=noninteractive apt-get install -y -qq \
  mysql-server \
  redis-server \
  libzip-dev \
  zip

# Start services
sudo service mysql start
sudo service redis-server start

# Set MySQL root password & create database
sudo mysql -u root <<SQL
  ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'root';
  CREATE DATABASE IF NOT EXISTS doorprize;
  FLUSH PRIVILEGES;
SQL

echo "✅ MySQL & Redis running"

# ── 2. Setup project ──────────────────────────────────────────────────────────
cd /workspaces/mayasi-doorprize

# Copy .env file
if [ ! -f .env ]; then
  echo "📋 Creating .env file..."
  cp .env.example .env
fi

# Update .env untuk local Codespaces development
sed -i 's/^DB_HOST=.*/DB_HOST=127.0.0.1/' .env
sed -i 's/^DB_PORT=.*/DB_PORT=3306/' .env
sed -i 's/^DB_USERNAME=.*/DB_USERNAME=root/' .env
sed -i 's/^DB_PASSWORD=.*/DB_PASSWORD=root/' .env
sed -i 's/^DB_DATABASE=.*/DB_DATABASE=doorprize/' .env
sed -i 's/^REDIS_HOST=.*/REDIS_HOST=127.0.0.1/' .env
sed -i 's/^REDIS_PORT=.*/REDIS_PORT=6379/' .env
sed -i 's/^APP_URL=.*/APP_URL="http:\/\/localhost:8000"/' .env
sed -i 's/^VITE_BASE_URL=.*/VITE_BASE_URL="http:\/\/localhost:8000"/' .env
sed -i 's/^SESSION_DRIVER=.*/SESSION_DRIVER=file/' .env
sed -i 's/^CACHE_STORE=.*/CACHE_STORE=file/' .env
sed -i 's/^FILESYSTEM_DISK=.*/FILESYSTEM_DISK=public/' .env

# ── 3. Install dependencies ───────────────────────────────────────────────────
echo "📦 Installing PHP dependencies..."
composer install --no-interaction

echo "📦 Installing Node dependencies..."
npm install

# ── 4. Generate keys ──────────────────────────────────────────────────────────
echo "🔐 Generating keys..."
php artisan key:generate --force
php artisan jwt:secret --force

# ── 5. Storage & cache ────────────────────────────────────────────────────────
echo "📁 Setting up storage..."
mkdir -p storage/logs storage/app/public bootstrap/cache
chmod -R 775 storage bootstrap/cache
php artisan storage:link || true

# ── 6. Database migration ─────────────────────────────────────────────────────
echo "🗄️  Running migrations & seeding..."
php artisan migrate --seed --force

echo ""
echo "✅ ─── Setup complete! ────────────────────────────────"
echo ""
echo "  Jalankan di terminal:"
echo ""
echo "  Terminal 1 (Backend):"
echo "  php artisan serve --host=0.0.0.0 --port=8000"
echo ""
echo "  Terminal 2 (Frontend):"
echo "  npm run dev"
echo ""
echo "  Akses: http://localhost:8000"
echo ""
echo "  Login:"
echo "  Email   : admin@manohara-asri.com"
echo "  Password: password"
echo "──────────────────────────────────────────────────────"
