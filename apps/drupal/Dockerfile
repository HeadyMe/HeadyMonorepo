# HEADY_BRAND:BEGIN
# HEADY SYSTEMS :: SACRED GEOMETRY
# FILE: apps/drupal/Dockerfile
# LAYER: root
# 
#         _   _  _____    _    ____   __   __
#        | | | || ____|  / \  |  _ \ \ \ / /
#        | |_| ||  _|   / _ \ | | | | \ V / 
#        |  _  || |___ / ___ \| |_| |  | |  
#        |_| |_||_____/_/   \_\____/   |_|  
# 
#    Sacred Geometry :: Organic Systems :: Breathing Interfaces
# HEADY_BRAND:END

# Stage 1: composer build
FROM composer:2 AS build
WORKDIR /app
COPY composer.json ./
RUN composer install --ignore-platform-reqs

# Stage 2: drupal image
FROM drupal:11-php8.2-apache
COPY --from=build /app/vendor /var/www/html/vendor
COPY . /var/www/html

# Set the working directory to the web root
WORKDIR /var/www/html

# We need to set the correct permissions for Drupal
RUN chown -R www-data:www-data /var/www/html
