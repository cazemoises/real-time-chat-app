# Base image
FROM node:18-alpine

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

RUN npm install --save-dev typescript
RUN npm run build

CMD ["node", "dist/index.js"]
