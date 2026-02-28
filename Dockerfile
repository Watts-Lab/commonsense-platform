# Stage 1: Build React frontend
FROM --platform=linux/amd64 public.ecr.aws/bitnami/node:24 AS client-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client ./
RUN npm run build

# Stage 2: Build Express backend
FROM --platform=linux/amd64 public.ecr.aws/bitnami/node:24 AS server-build
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install
COPY server ./

# Stage 3: Setup Nginx
FROM --platform=linux/amd64 public.ecr.aws/nginx/nginx:latest
ARG GITHUB_HASH=local
ENV GITHUB_HASH=${GITHUB_HASH}
ARG GITHUB_BRANCH=local
ENV GITHUB_BRANCH=${GITHUB_BRANCH}
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files from React frontend
COPY --from=client-build /app/client/dist /var/www/html

# Copy Express backend
COPY --from=server-build /app/server /usr/src/app

# Expose port 80
EXPOSE 80

# Start Nginx and Express server
CMD apt-get update && echo "Y" | apt-get install nodejs && service nginx start && cd /usr/src/app && node server.js
