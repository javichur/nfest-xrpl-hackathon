FROM php:8.0-apache

RUN apt-get update && apt-get install -y \
        libpng-dev \
        zlib1g-dev \
        libxml2-dev \
        libzip-dev \
        libonig-dev \
        zip \
        curl \
        unzip \
        openssl \
        git \
        nano \
        wget \
    && docker-php-ext-configure gd \
    && docker-php-ext-install -j$(nproc) gd \
    && docker-php-ext-install pdo pdo_mysql mysqli zip soap bcmath \
    && docker-php-source delete

RUN pecl install xdebug \
    && docker-php-ext-enable xdebug

COPY xdebug.ini "$PHP_INI_DIR/conf.d/20-xdebug.ini"

#Instalar composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

RUN a2enmod rewrite