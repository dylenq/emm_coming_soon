FROM node:24-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY . .
VOLUME /data
EXPOSE 3000
CMD ["node", "server.js"]
