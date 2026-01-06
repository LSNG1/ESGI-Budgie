FROM node:20-alpine AS client_build
WORKDIR /app/client

COPY client/package*.json ./
RUN npm ci
COPY client ./
RUN npm run build

FROM nginx:1.27-alpine

COPY deploy/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=client_build /app/client/build /var/www/client
COPY server/public /var/www/server/public
