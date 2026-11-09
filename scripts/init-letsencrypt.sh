#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# NutriCore Let's Encrypt HTTPS Bootstrap Script
# Provisions initial TLS certificates before starting Nginx in SSL mode
# ==============================================================================

DOMAIN="${DOMAIN:-nutricore.example.com}"
EMAIL="${CERTBOT_EMAIL:-admin@example.com}"
STAGING="${CERTBOT_STAGING:-0}" # Set to 1 for staging/testing to avoid rate limits
DATA_PATH="./deploy/certbot"
RSA_KEY_SIZE=4096

if [ -d "$DATA_PATH/conf/live/$DOMAIN" ]; then
  read -r -p "Existing certificate found for $DOMAIN. Replace? (y/N) " decision
  if [ "$decision" != "Y" ] && [ "$decision" != "y" ]; then
    exit 0
  fi
fi

echo "### Creating required certbot directories..."
mkdir -p "$DATA_PATH/conf/live/$DOMAIN"
mkdir -p "$DATA_PATH/www"

echo "### Creating temporary self-signed dummy certificate for $DOMAIN..."
openssl req -x509 -nodes -newkey rsa:$RSA_KEY_SIZE -days 1 \
  -keyout "$DATA_PATH/conf/live/$DOMAIN/privkey.pem" \
  -out "$DATA_PATH/conf/live/$DOMAIN/fullchain.pem" \
  -subj "/CN=localhost"
cp "$DATA_PATH/conf/live/$DOMAIN/fullchain.pem" "$DATA_PATH/conf/live/$DOMAIN/chain.pem"

echo "### Starting Nginx..."
docker compose -f docker-compose.prod.yml up --force-recreate -d nginx

echo "### Removing dummy certificate for $DOMAIN..."
rm -rf "$DATA_PATH/conf/live/$DOMAIN"

echo "### Requesting Let's Encrypt certificate for $DOMAIN (www & api subdomains)..."
STAGING_ARG=""
if [ "$STAGING" != "0" ]; then
  STAGING_ARG="--staging"
fi

docker compose -f docker-compose.prod.yml run --rm --entrypoint "\
  certbot certonly --webroot -w /var/www/certbot \
    $STAGING_ARG \
    --email $EMAIL \
    -d $DOMAIN \
    -d www.$DOMAIN \
    -d api.$DOMAIN \
    --rsa-key-size $RSA_KEY_SIZE \
    --agree-tos \
    --no-eff-email \
    --force-renewal" certbot

echo "### Reloading Nginx with production TLS certificate..."
docker compose -f docker-compose.prod.yml exec nginx nginx -s reload

echo "### HTTPS setup completed successfully for https://$DOMAIN!"

