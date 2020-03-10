FROM node:12.14.1-alpine

WORKDIR /opt

RUN apk add python python-dev py2-pip autoconf automake g++ make --no-cache
RUN npm install bcrypt

ARG NODE_ENV
ENV NODE_ENV=$NODE_ENV \
  PORT=8000 \
  AWS_ACCESS_KEY_ID="123" \
  AWS_SECRET_ACCESS_KEY="123" \
  AWS_REGION="ap-southeast-1" \
  AWS_S3_BUCKET="photo-comspaces-me" \
  ALLOWED_DIMENSIONS="200x200,300x300,400x400,500x500,600x600,800x800"

COPY package*.json ./

RUN npm ci

COPY . .

EXPOSE $PORT

CMD [ "node", "./src/index.js" ]
