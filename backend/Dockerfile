FROM php:8.2-cli

WORKDIR /var/www/api

# Install PostgreSQL extension
RUN apt-get update && apt-get install -y libpq-dev \
    && docker-php-ext-install pdo pdo_pgsql \
    && rm -rf /var/lib/apt/lists/*

# Copy files
COPY . .

# Install Composer dependencies (optional)
# COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
# RUN composer install --no-dev

# Expose port
EXPOSE 4000

# Start development server with router
CMD ["php", "-S", "0.0.0.0:4000", "-t", "public", "-r", "router.php"]
