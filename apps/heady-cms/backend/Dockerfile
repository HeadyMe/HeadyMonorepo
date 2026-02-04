FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN mkdir -p data storage/uploads

EXPOSE 3000

CMD ["npm", "run", "dev"]
