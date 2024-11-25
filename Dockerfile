FROM trafex/php-nginx:3.6.0

COPY index.html /var/www/html/index.html
COPY keep_me_updated.php /var/www/html/keep_me_updated.php
COPY compiled.css /var/www/html/compiled.css

# Remove the default files
RUN rm /var/www/html/index.php
RUN rm /var/www/html/test.html

RUN sudo mkdir -p /etc/aoc
RUN sudo chown -R www-data:www-data /etc/aoc

EXPOSE 8080
