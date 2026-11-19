FROM php:8.3-apache

# Apache écoute sur 3002 pour rester accessible sur ce port
# même avec network_mode: host.
RUN sed -ri 's/^Listen 80$/Listen 3002/' /etc/apache2/ports.conf \
    && sed -ri 's/<VirtualHost \*:80>/<VirtualHost *:3002>/' /etc/apache2/sites-available/000-default.conf

# Mode production PHP (display_errors Off, log_errors On, expose_php Off, etc.)
RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"

ENV APP_ENV=production

RUN a2enmod rewrite

# L'extension curl est déjà compilée dans l'image officielle php:8.3-apache
# (pas besoin d'apt-get, qui échoue parfois sur les signatures Debian en
# build multi-arch/QEMU). On vérifie juste qu'elle est bien disponible.
RUN php -m | grep -qi '^curl$'

COPY index.php /var/www/html/
COPY .htaccess /var/www/html/
COPY package.json /var/www/html/
COPY features.json /var/www/html/
COPY src/ /var/www/html/src/
COPY pages/ /var/www/html/pages
COPY resources/ /var/www/html/resources

EXPOSE 3002
