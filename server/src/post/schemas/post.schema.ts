import { Schema } from "mongoose";

export const PostSchema = new Schema({
	description: { type: String },
	picture: { type: String },
	created_at: { type: Date, default: new Date() },
	user: { type: String, ref: "User", required: true },
});
