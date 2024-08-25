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
	app.useStaticAssets(join(__dirname, "..", "uploads"), {
		prefix: "/upload/images/",
	});
	await app.listen(3000);
}
bootstrap();
