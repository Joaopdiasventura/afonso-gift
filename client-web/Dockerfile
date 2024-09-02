FROM node:20.12.2 AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build -- --configuration production

FROM node:20.12.2

WORKDIR /app

RUN npm install -g http-server

COPY --from=build /app/dist/client-web /app

EXPOSE 80

CMD ["http-server", "/app", "-p", "80", "-c-1", "-a", "0.0.0.0"]
