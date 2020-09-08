FROM node:latest

WORKDIR /usr/src/app
COPY src ./
COPY package*.json ./
COPY tsconfig.json ./

RUN npm install
RUN npm run compile

EXPOSE 8000
CMD [ "node", "app.js" ]
