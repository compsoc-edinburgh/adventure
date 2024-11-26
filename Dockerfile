FROM trafex/php-nginx:3.6.0

COPY index.html /var/www/html/index.html
COPY keep_me_updated.php /var/www/html/keep_me_updated.php
COPY compiled.css /var/www/html/compiled.css

# Remove the default files
RUN rm /var/www/html/index.php
RUN rm /var/www/html/test.html

USER root

RUN mkdir -p /etc/adventure
RUN touch /etc/adventure/emails.txt
RUN chown nobody:nobody /etc/adventure/emails.txt

USER nobody

EXPOSE 8080
