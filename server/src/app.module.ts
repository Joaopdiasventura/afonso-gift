import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { UserModule } from "./user/user.module";
import { PostModule } from "./post/post.module";

@Module({
	imports: [
		MongooseModule.forRoot(process.env.DATABASE_URL),
		UserModule,
		PostModule,
	],
	controllers: [],
	providers: [],
})
export class AppModule {}
