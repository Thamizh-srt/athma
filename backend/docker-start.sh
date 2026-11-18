#!/bin/sh
PORT=${PORT:-10000}
sed -i "s/Listen 80/Listen ${PORT}/" /etc/apache2/ports.conf
sed -i "s/:80>/:${PORT}>/" /etc/apache2/sites-available/000-default.conf

php artisan config:cache
php artisan route:cache
php artisan migrate --force

if [ "$RUN_SEED" = "true" ]; then
  php artisan db:seed --force
fi

apache2-foreground