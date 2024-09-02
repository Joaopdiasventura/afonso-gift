import { config } from "dotenv";
config();

import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";
import { NestExpressApplication } from "@nestjs/platform-express";
import { join } from "path";

async function bootstrap() {
	const app = await NestFactory.create<NestExpressApplication>(AppModule);
	app.useGlobalPipes(new ValidationPipe());
	app.enableCors({
		origin: process.env.FRONTEND,
		methods: ["GET", "DELETE", "POST", "PATCH"],
		allowedHeaders: ["Content-Type", "Authorization"],
	});
	await app.listen(3000);
}
bootstrap();
