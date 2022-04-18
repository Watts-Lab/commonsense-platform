FROM node:16

# Create app directory
WORKDIR /usr/src/app

# Bundle app source
COPY . .

RUN cd ./watts-forms && npm run build
RUN cd ./platform && npm i && npm run build

WORKDIR /usr/src/app/platform
EXPOSE 5000

CMD [ "npx", "next", "start", "--port", "5000" ]