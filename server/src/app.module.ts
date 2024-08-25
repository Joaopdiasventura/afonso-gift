import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { UserModule } from './user/user.module';

@Module({
  imports: [MongooseModule.forRoot(process.env.DATABASE_URL), UserModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
