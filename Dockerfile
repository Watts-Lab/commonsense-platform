# Stage 1: Build React frontend
FROM public.ecr.aws/docker/library/node:20 AS client-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client ./
RUN npm run build

# Stage 2: Build Express backend
FROM public.ecr.aws/docker/library/node:20 AS server-build
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install
COPY server ./

# Stage 3: Setup Nginx
FROM nginx:latest
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files from React frontend
COPY --from=client-build /app/client/dist /var/www/html

# Copy Express backend
COPY --from=server-build /app/server /usr/src/app

# Expose port 80
EXPOSE 80

# Start Nginx and Express server
CMD apt-get update && echo "Y" | apt-get install nodejs && service nginx start && cd /usr/src/app && node server.js
