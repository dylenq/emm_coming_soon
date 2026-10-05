# Single image: the Express booking API (booking-api/) also serves the static website.
FROM node:24-alpine
WORKDIR /app
COPY booking-api/package.json booking-api/package-lock.json ./
RUN npm ci --omit=dev
COPY booking-api/ ./

COPY . /app/public
# Keep the API source and deploy-time files out of the served site
RUN rm -rf /app/public/booking-api \
    /app/public/_partials \
    /app/public/_backup_pre_optimization \
    /app/public/AUDIT.md \
    /app/public/Dockerfile \
    /app/public/docker-compose*.yml \
    /app/public/.dockerignore \
    /app/public/.gitignore \
    /app/public/vercel.json \
    /app/public/.vercelignore \
    && find /app/public -type d -exec chmod 755 {} \; \
    && find /app/public -type f -exec chmod 644 {} \;

ENV STATIC_DIR=/app/public PORT=3000
VOLUME /data
EXPOSE 3000
CMD ["node", "server.js"]
