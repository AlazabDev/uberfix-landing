#!/usr/bin/env bash
set -Eeuo pipefail

# ============================================
# UberFix Landing Hub - Production Deploy
# ============================================

APP_NAME="uberfix-landing-hub"
DOMAIN="uberfix-landing.alazab.com"
DEPLOY_DIR="/var/www/core/uberfix-landing-hub"
REPO_URL="https://github.com/AlazabDev/uberfix-landing-hub.git"
BRANCH="main"

SSL_DIR="/etc/letsencrypt/live/${DOMAIN}"
NGINX_CONF="/etc/nginx/sites-available/${DOMAIN}"
NGINX_ENABLED="/etc/nginx/sites-enabled/${DOMAIN}"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log()  { echo -e "${GREEN}[✓]${NC} $1"; }
info() { echo -e "${BLUE}[i]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
fail() { echo -e "${RED}[✗]${NC} $1"; exit 1; }

echo ""
echo "=========================================="
echo "  UberFix Landing Hub - Deploy Script"
echo "=========================================="
echo ""

# 1) Preconditions
info "Checking prerequisites..."

command -v git >/dev/null 2>&1 || fail "git is not installed"
command -v node >/dev/null 2>&1 || fail "Node.js is not installed"
command -v pnpm >/dev/null 2>&1 || fail "pnpm is not installed"
command -v nginx >/dev/null 2>&1 || fail "nginx is not installed"

NODE_MAJOR="$(node -v | sed 's/^v//' | cut -d. -f1)"
[ "${NODE_MAJOR}" -ge 18 ] || fail "Node.js 18+ required. Current: $(node -v)"

[ -d "${DEPLOY_DIR}" ] || fail "Deploy dir not found: ${DEPLOY_DIR}"
[ -f "${DEPLOY_DIR}/package.json" ] || fail "package.json not found in ${DEPLOY_DIR}"
[ -f "${SSL_DIR}/fullchain.pem" ] || fail "SSL fullchain.pem not found at ${SSL_DIR}"
[ -f "${SSL_DIR}/privkey.pem" ] || fail "SSL privkey.pem not found at ${SSL_DIR}"

log "Prerequisites OK"

# 2) Update source
info "Updating source code..."

cd "${DEPLOY_DIR}"

if [ ! -d ".git" ]; then
  fail "This directory is not a git repo: ${DEPLOY_DIR}"
fi

CURRENT_REMOTE="$(git remote get-url origin 2>/dev/null || true)"
if [ "${CURRENT_REMOTE}" != "${REPO_URL}" ]; then
  warn "Origin remote differs from expected repo"
  warn "Current: ${CURRENT_REMOTE}"
  warn "Expected: ${REPO_URL}"
fi

git fetch origin "${BRANCH}"
git checkout "${BRANCH}"
git reset --hard "origin/${BRANCH}"

log "Source updated"

# 3) Install dependencies
info "Installing dependencies with pnpm..."
pnpm install --frozen-lockfile
log "Dependencies installed"

# 4) Build
info "Building project..."
pnpm build
[ -d "${DEPLOY_DIR}/dist" ] || fail "Build failed: dist directory not found"
log "Build completed"

# 5) Permissions
info "Setting permissions..."
chown -R www-data:www-data "${DEPLOY_DIR}/dist"
find "${DEPLOY_DIR}/dist" -type d -exec chmod 755 {} \;
find "${DEPLOY_DIR}/dist" -type f -exec chmod 644 {} \;
log "Permissions updated"

# 6) Nginx config
info "Writing Nginx config..."

cat > "${NGINX_CONF}" <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN};
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name ${DOMAIN};

    root ${DEPLOY_DIR}/dist;
    index index.html;

    ssl_certificate ${SSL_DIR}/fullchain.pem;
    ssl_certificate_key ${SSL_DIR}/privkey.pem;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_comp_level 5;
    gzip_types
        text/plain
        text/css
        application/json
        application/javascript
        text/xml
        application/xml
        application/xml+rss
        text/javascript
        image/svg+xml;

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|webp)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files \$uri =404;
    }

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }

    error_page 404 /index.html;
}
EOF

ln -sf "${NGINX_CONF}" "${NGINX_ENABLED}"

# لو فيه ملف قديم باسم مختلف لنفس المشروع، احذفه يدويًا لو لزم
# rm -f /etc/nginx/sites-enabled/uberfix-landing-hub

nginx -t
systemctl reload nginx

log "Nginx configured"

echo ""
echo "=========================================="
echo -e "  ${GREEN}✓ Deploy completed successfully${NC}"
echo "=========================================="
echo ""
echo "App Name : ${APP_NAME}"
echo "Domain   : https://${DOMAIN}"
echo "Path     : ${DEPLOY_DIR}"
echo "Build    : ${DEPLOY_DIR}/dist"
echo ""