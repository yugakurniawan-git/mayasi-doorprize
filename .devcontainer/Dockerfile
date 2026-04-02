FROM mcr.microsoft.com/devcontainers/php:8.3-bullseye

# Install system dependencies + MariaDB + Redis
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get install -y --no-install-recommends \
        mariadb-server \
        redis-server \
        libzip-dev \
        libpng-dev \
        libonig-dev \
        libxml2-dev \
        zip \
        unzip \
        curl \
    && rm -rf /var/lib/apt/lists/*

# Install PHP extensions yang dibutuhkan project
RUN docker-php-ext-install \
    pdo_mysql \
    zip \
    gd \
    mbstring \
    xml \
    pcntl

# Install Node.js 22
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*
