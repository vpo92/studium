FROM php:7.3-apache

RUN a2enmod rewrite

COPY index.php /var/www/html/
COPY .htaccess /var/www/html/
COPY src/ /var/www/html/src/
COPY pages/ /var/www/html/pages
COPY resources/ /var/www/html/resources

EXPOSE 80
