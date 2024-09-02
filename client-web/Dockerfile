FROM node:20.12.2 AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build -- --configuration production

FROM node:20.12.2

WORKDIR /app

COPY --from=build /app/dist/client-web /app

RUN npm install -g serve

EXPOSE 80

CMD ["serve", "-s", "/app", "-l", "80"]
