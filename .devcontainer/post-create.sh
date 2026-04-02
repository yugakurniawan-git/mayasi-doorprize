#!/bin/bash
set -e

echo "🚀 Starting Doorprize Development Setup..."

# Change to app directory
cd /workspaces/doorprize

# Copy .env file if it doesn't exist
if [ ! -f .env ]; then
  echo "📋 Creating .env file..."
  cp .env.example .env
fi

# Install PHP dependencies
echo "📦 Installing PHP dependencies..."
composer install

# Install Node dependencies
echo "📦 Installing Node dependencies..."
npm install

# Generate APP_KEY if not set
if grep -q "^APP_KEY=$" .env; then
  echo "🔐 Generating APP_KEY..."
  php artisan key:generate
fi

# Generate JWT_SECRET if not set
if grep -q "^JWT_SECRET=$" .env; then
  echo "🔐 Generating JWT_SECRET..."
  php artisan jwt:secret --force
fi

# Create storage directories
echo "📁 Creating storage directories..."
mkdir -p storage/logs
mkdir -p storage/app/public
mkdir -p bootstrap/cache

# Set permissions
echo "🔒 Setting permissions..."
chmod -R 775 storage
chmod -R 775 bootstrap/cache

# Create database and run migrations
echo "🗄️  Setting up database..."
# Wait for MySQL to be ready
for i in {1..30}; do
  if php artisan tinker --execute="DB::connection()->getPdo()" 2>/dev/null; then
    echo "✅ Database connected!"
    break
  fi
  echo "⏳ Waiting for database... ($i/30)"
  sleep 1
done

# Run migrations and seed
php artisan migrate --seed --force || true

# Set up frontend environment variables
echo "🎨 Setting up frontend environment..."
if ! grep -q "^VITE_API_KEY=" .env; then
  echo "VITE_API_KEY=local-dev-key" >> .env
fi

if ! grep -q "^VITE_BASE_URL=" .env; then
  echo "VITE_BASE_URL=http://localhost:8000" >> .env
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Open Terminal (Ctrl+\`)"
echo "2. Run: php artisan octane:start --server=frankenphp --host=0.0.0.0 --port=8000"
echo "3. In another terminal, run: npm run dev"
echo ""
echo "🌐 Then access:"
echo "   - Frontend: http://localhost:8000"
echo "   - Vite dev: http://localhost:7401"
echo ""
echo "👤 Default credentials:"
echo "   - User: admin"
echo "   - Password: password"
echo ""
