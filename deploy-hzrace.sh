#!/usr/bin/env bash
set -euo pipefail

install -d -m 0755 /var/www/hzrace
tar -xzf /tmp/hzrace-output.tgz -C /var/www/hzrace
chown -R root:root /var/www/hzrace

cat >/etc/systemd/system/hzrace.service <<'UNIT'
[Unit]
Description=Hangzhou Event Calendar (hzrace)
After=network.target

[Service]
Type=simple
WorkingDirectory=/var/www/hzrace
Environment=NODE_ENV=production
Environment=NITRO_HOST=127.0.0.1
Environment=NITRO_PORT=3105
ExecStart=/usr/bin/node /var/www/hzrace/server/index.mjs
Restart=always
RestartSec=3
User=root

[Install]
WantedBy=multi-user.target
UNIT

cp -a /etc/nginx/sites-available/csgeekr "/etc/nginx/sites-available/csgeekr.bak.$(date +%Y%m%d%H%M%S)"
python3 - <<'PY'
from pathlib import Path
p = Path('/etc/nginx/sites-available/csgeekr')
s = p.read_text()
block = '''
    location = /hzrace {
        return 301 /hzrace/;
    }

    location ^~ /hzrace/assets/ {
        alias /var/www/hzrace/public/assets/;
        add_header Cache-Control "public, max-age=31536000, immutable";
        try_files $uri =404;
    }

    location ^~ /hzrace/ {
        proxy_pass http://127.0.0.1:3105;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
    }
'''
marker = '    location / {\n'
if 'location = /hzrace' not in s:
    s = s.replace(marker, block + '\n' + marker, 1)
p.write_text(s)
PY

systemctl daemon-reload
systemctl enable --now hzrace.service
nginx -t
systemctl reload nginx
systemctl --no-pager --full status hzrace.service
curl -fsS -o /dev/null -w 'local_hzrace=%{http_code}\n' http://127.0.0.1:3105/hzrace/
