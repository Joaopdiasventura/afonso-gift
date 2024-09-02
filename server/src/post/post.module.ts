import { MongooseModule } from "@nestjs/mongoose";
import { Module } from "@nestjs/common";
import { PostService } from "./post.service";
import { PostController } from "./post.controller";
import { PostSchema } from "./schemas/post.schema";
import { UserService } from "../user/user.service";
import { UserModule } from "../user/user.module";
import { ImageService } from "../services/image.service";

@Module({
	imports: [
		MongooseModule.forFeature([{ name: "Post", schema: PostSchema }]),
		UserModule,
	],
	controllers: [PostController],
	providers: [PostService, UserService, ImageService],
})
export class PostModule {}
