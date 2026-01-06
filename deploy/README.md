# Deployment Guide (Ubuntu 22.04 + Docker)

This guide deploys Budgie on a VPS with Nginx + PHP-FPM + Postgres. Nginx serves the React build and proxies /api to Symfony.

## 0) DNS (Hostinger)
In Hostinger hPanel:
1. Go to Domains -> codenawak.fr -> DNS Zone.
2. Add or update A records:
   - Name: @ -> 89.116.38.92
   - Name: www -> 89.116.38.92 (optional)
3. Save changes.

If your DNS is managed elsewhere, do the same in that provider.
Wait for DNS propagation before requesting SSL.

Optional checks:
- `nslookup codenawak.fr 1.1.1.1`
- `nslookup www.codenawak.fr 1.1.1.1`

## 1) Connect to the VPS
ssh root@89.116.38.92

## 2) System prep
apt update && apt upgrade -y
apt install -y git curl ufw ca-certificates gnupg

## 3) Install Docker + Compose
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu jammy stable" \
  > /etc/apt/sources.list.d/docker.list

apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
systemctl enable --now docker

## 4) Firewall (VPS + Hostinger panel)
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

If you enabled Hostinger VPS firewall in hPanel:
- VPS -> Manage -> Firewall
- Allow inbound TCP 80 and 443

## 5) Get the code on the VPS
Place the repo in /opt/ESGI-Budgie (git clone or scp).
Example:
cd /opt
# git clone <your-repo-url> ESGI-Budgie
cd /opt/ESGI-Budgie

## 6) Environment
The file deploy/.env was generated locally. Keep it private.
If you need to change anything, edit it on the VPS:
  nano deploy/.env

## 7) Build and run
cd /opt/ESGI-Budgie

# Build and start
sudo docker compose -f deploy/compose.yaml up -d --build

# Run migrations
sudo docker compose -f deploy/compose.yaml exec php php bin/console doctrine:migrations:migrate --no-interaction

## 8) Verify HTTP
Open http://codenawak.fr

## 9) SSL (Lets Encrypt)
This uses certbot with webroot. Nginx must be running for this step.

Install certbot:
  sudo apt install -y certbot

Request the certificate:
  sudo certbot certonly --webroot \
    -w /opt/ESGI-Budgie/deploy/certbot/www \
    -d codenawak.fr \
    -m lsng@protonmail.com \
    --agree-tos --no-eff-email

Copy certs into the repo so the Nginx container can read them:
  sudo mkdir -p /opt/ESGI-Budgie/deploy/certs
  sudo cp /etc/letsencrypt/live/codenawak.fr/fullchain.pem /opt/ESGI-Budgie/deploy/certs/
  sudo cp /etc/letsencrypt/live/codenawak.fr/privkey.pem /opt/ESGI-Budgie/deploy/certs/

Enable HTTPS by replacing deploy/nginx/default.conf with this content, then restart Nginx:

server {
    listen 80;
    server_name codenawak.fr www.codenawak.fr;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name codenawak.fr www.codenawak.fr;

    ssl_certificate /etc/nginx/certs/fullchain.pem;
    ssl_certificate_key /etc/nginx/certs/privkey.pem;

    root /var/www/client;
    index index.html;

    location / {
        try_files $uri /index.html;
    }

    location ^~ /api {
        root /var/www/server/public;
        try_files $uri /index.php$is_args$args;
    }

    location ~ ^/index\.php(/|$) {
        root /var/www/server/public;
        include fastcgi_params;
        fastcgi_pass php:9000;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        fastcgi_param DOCUMENT_ROOT $realpath_root;
        internal;
    }

    location ~ \.php$ {
        return 404;
    }
}

Restart Nginx:
  sudo docker compose -f deploy/compose.yaml restart nginx

## 10) Renewal
Lets Encrypt certificates renew automatically. After renewal, recopy the files and restart Nginx.
Example:
  sudo certbot renew --quiet
  sudo cp /etc/letsencrypt/live/codenawak.fr/fullchain.pem /opt/ESGI-Budgie/deploy/certs/
  sudo cp /etc/letsencrypt/live/codenawak.fr/privkey.pem /opt/ESGI-Budgie/deploy/certs/
  sudo docker compose -f /opt/ESGI-Budgie/deploy/compose.yaml restart nginx
