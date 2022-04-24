FROM node:16

# Create app directory
WORKDIR /usr/src/app

# Bundle app source
COPY . .

RUN npm run build

EXPOSE 5000

CMD [ "npx", "next", "start", "--port", "5000" ]