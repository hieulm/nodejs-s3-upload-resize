FROM node:12.14.1-alpine

WORKDIR /opt

RUN apk add python python-dev py2-pip autoconf automake g++ make --no-cache
RUN npm install bcrypt

ARG NODE_ENV
ENV NODE_ENV=$NODE_ENV \
  PORT=8000

COPY package*.json ./

RUN npm ci

COPY . .

EXPOSE $PORT

CMD [ "node", "./src/index.js" ]
