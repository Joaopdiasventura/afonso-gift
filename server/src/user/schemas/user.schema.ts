import { Schema } from "mongoose";

export const UserSchema = new Schema(
	{
		_id: { type: String, alias: "email" },
		nickName: { type: String, unique: true },
		name: { type: String },
		bio: { type: String },
		password: { type: String },
		picture: {
			type: String,
			default:
				"https://icones.pro/wp-content/uploads/2021/02/icono-de-camara-gris.png",
		},
		following: [{ type: String }],
	},
	{ _id: false },
);
