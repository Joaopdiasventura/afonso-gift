import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreatePostDto } from "./dto/create-post.dto";
import { UpdatePostDto } from "./dto/update-post.dto";
import { Post } from "./entities/post.entity";

@Injectable()
export class PostService {
	constructor(@InjectModel("Post") private readonly postModel: Model<Post>) {}

	async create(createPostDto: CreatePostDto): Promise<Post> {
		const post = new this.postModel(createPostDto);
		return await post.save();
	}

	async findByUser(user: string): Promise<Post[]> {
		return await this.postModel
			.aggregate([{ $match: { user } }, ...this.selectUser()])
			.exec();
	}

	async findByFollowings(followings: string[]): Promise<any[]> {
		return await this.postModel
			.aggregate([
				{ $match: { user: { $in: followings } } },
				...this.selectUser(),
				{ $limit: 20 },
			])
			.exec();
	}

	async findById(_id: string): Promise<Post | null> {
		return await this.postModel.findById(_id).exec();
	}

	async update(
		_id: string,
		updatePostDto: UpdatePostDto,
	): Promise<Post | null> {
		return await this.postModel
			.findByIdAndUpdate(_id, updatePostDto, { new: true })
			.exec();
	}

	async remove(_id: string): Promise<Post | null> {
		return await this.postModel.findByIdAndDelete(_id).exec();
	}

	selectUser(): any[] {
		return [
			{
				$lookup: {
					from: "users",
					localField: "user",
					foreignField: "nickName",
					as: "user",
				},
			},
			{ $unwind: "$user" },
			{
				$project: {
					description: 1,
					picture: 1,
					created_at: 1,
					"user.nickName": 1,
					"user.name": 1,
					"user.picture": 1,
				},
			},
			{ $sort: { created_at: -1 } },
		];
	}
}
