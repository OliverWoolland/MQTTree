FROM node:25-bullseye

WORKDIR /app

COPY package*.json .
RUN npm install

COPY server.js . 
COPY public .

ENTRYPOINT ["node", "server.js"]
