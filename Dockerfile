FROM node AS frontend
WORKDIR /usr/src/app
COPY client/ ./client/
RUN cd client && npm install && npm run build

FROM node AS backend
WORKDIR /root/
COPY --from=frontend /usr/src/app/client/build ./client/build
COPY server/package*.json ./server/
RUN cd api && npm install
COPY server/server.js ./server/

EXPOSE 4000

CMD ["node", "./server/server.js"]