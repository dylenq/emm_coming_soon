FROM nginx:alpine

COPY . /usr/share/nginx/html

# Keep deploy-time exclusions out of the served image too
RUN rm -rf /usr/share/nginx/html/_partials \
    /usr/share/nginx/html/_backup_pre_optimization \
    /usr/share/nginx/html/.git \
    /usr/share/nginx/html/.vscode \
    /usr/share/nginx/html/AUDIT.md \
    /usr/share/nginx/html/Dockerfile \
    /usr/share/nginx/html/docker-compose.yml \
    /usr/share/nginx/html/.dockerignore

# Some source files have shown up with owner-only (600) permissions, which the
# nginx worker process can't read, causing intermittent 403s. Normalize
# regardless of what the source checkout looks like.
RUN find /usr/share/nginx/html -type d -exec chmod 755 {} \; \
    && find /usr/share/nginx/html -type f -exec chmod 644 {} \;

EXPOSE 80
