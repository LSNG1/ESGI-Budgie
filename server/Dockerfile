FROM php:8.4-fpm-alpine

ENV COMPOSER_ALLOW_SUPERUSER=1

RUN apk add --no-cache \
        $PHPIZE_DEPS \
        git \
        icu-dev \
        libzip-dev \
        mariadb-connector-c-dev \
        postgresql-dev \
        unzip \
    && docker-php-ext-install intl pdo_mysql pdo_pgsql zip opcache \
    && apk del $PHPIZE_DEPS

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/server

COPY composer.json composer.lock ./
RUN composer install --no-dev --prefer-dist --no-interaction --no-progress --no-scripts

COPY . .

RUN composer dump-autoload --classmap-authoritative \
    && mkdir -p var \
    && chown -R www-data:www-data var
