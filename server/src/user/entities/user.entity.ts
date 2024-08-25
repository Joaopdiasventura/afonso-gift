import { Document, Schema } from "mongoose";

export class User extends Document {
	email: string;
	nickName: string;
	name: string;
	bio: string;
	password: string;
	picture: string;
	following: string[];
}
