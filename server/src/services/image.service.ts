import { BadRequestException, Injectable } from "@nestjs/common";
import { v4 as uuid } from "uuid";
import { initializeApp, cert } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";

const serviceAccount = require("../../afonso-gift-firebase-adminsdk-dutof-826efe1e72.json");

initializeApp({
	credential: cert(serviceAccount),
	storageBucket: "afonso-gift.appspot.com",
});

@Injectable()
export class ImageService {
	async uploadImage(file: Express.Multer.File): Promise<string> {
		const uniqueFileName = `${uuid()}-${file.originalname}`;
		const bucket = getStorage().bucket();

		try {
			const fileUpload = bucket.file(uniqueFileName);
			const stream = fileUpload.createWriteStream({
				metadata: {
					contentType: file.mimetype,
				},
			});
			stream.end(file.buffer);
			await new Promise((resolve, reject) => {
				stream.on("finish", resolve);
				stream.on("error", reject);
			});
			bucket
				.file(uniqueFileName)
				.makePublic()
				.then(() => {
					console.log("File is now public");
				})
				.catch((err) => {
					console.error("Error making file public:", err);
				});
			return `https://storage.googleapis.com/${bucket.name}/${uniqueFileName}`;
		} catch (err) {
			console.log(err);

			throw new BadRequestException("Erro ao fazer upload da imagem");
		}
	}

	async deleteImage(imageName: string): Promise<void> {
		const bucket = getStorage().bucket();
		try {
			await bucket.file(imageName).delete();
		} catch (err) {
			console.error(`Erro ao excluir a imagem: ${err.message}`);
			throw new BadRequestException("Erro ao excluir a imagem");
		}
	}
}
