FROM node:20.12.2

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN ls -la /app/tsconfig.json

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]