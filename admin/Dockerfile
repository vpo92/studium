FROM php:8.3-apache

RUN a2enmod rewrite

RUN apt-get update && apt-get install -y \
    libcurl4-openssl-dev \
    libzip-dev \
    zip \
    unzip \
    && docker-php-ext-install curl \
    && rm -rf /var/lib/apt/lists/*

COPY index.php /var/www/html/
COPY .htaccess /var/www/html/
COPY package.json /var/www/html/
COPY src/ /var/www/html/src/
COPY pages/ /var/www/html/pages
COPY resources/ /var/www/html/resources

EXPOSE 80
