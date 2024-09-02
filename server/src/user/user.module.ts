import { MongooseModule } from "@nestjs/mongoose";
import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { UserSchema } from "./schemas/user.schema";
import { ImageService } from "../services/image.service";

@Module({
	imports: [
		MongooseModule.forFeature([{ name: "User", schema: UserSchema }]),
	],
	exports: [UserService, MongooseModule],
	controllers: [UserController],
	providers: [UserService, ImageService],
})
export class UserModule {}
