import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { User } from "./entities/user.entity";

@Injectable()
export class UserService {
	constructor(@InjectModel("User") private readonly userModel: Model<User>) {}

	async create(createUserDto: CreateUserDto): Promise<User> {
		const user = new this.userModel(createUserDto);
		return await user.save();
	}

	async findAll(): Promise<User[]> {
		return this.userModel.find().exec();
	}

	async findByEmail(email: string): Promise<User | null> {
		return this.userModel.findOne({ email }).exec(); // Corrigido findById para findOne
	}

	async findByNickName(nickName: string): Promise<User | null> {
		return this.userModel.findOne({ nickName }).exec();
	}

	async findUnique(email: string, nickName: string): Promise<User | null> {
		return this.userModel
			.findOne({
				$or: [{ _id: email }, { nickName }],
			})
			.exec();
	}

	async findMany(identifier: string): Promise<User[]> {
		return this.userModel
			.find({
				$or: [
					{ name: { $regex: identifier, $options: "i" } },
					{ nickName: { $regex: identifier, $options: "i" } },
				],
			})
			.sort({ name: 1 })
			.exec();
	}

	async findFollowers(
		nickName: string,
	): Promise<{ nickName: string; name: string; picture: string }[]> {
		return this.userModel
			.find({ following: nickName })
			.select("nickName name picture")
			.exec();
	}

	async findFollowings(
		nickName: string,
	): Promise<{ nickName: string; name: string; picture: string }[]> {
		return this.userModel
			.find({
				nickName: {
					$in: (await this.findByNickName(nickName)).following,
				},
			})
			.select("nickName name picture")
			.exec();
	}

	async update(
		id: string,
		updateUserDto: UpdateUserDto,
	): Promise<User | null> {
		return this.userModel
			.findByIdAndUpdate(id, updateUserDto, { new: true })
			.exec();
	}

	async remove(id: string): Promise<User | null> {
		return this.userModel.findByIdAndDelete(id).exec();
	}

	async followUser(
		userNickName: string,
		followNickName: string,
	): Promise<User> {
		const user = await this.findByNickName(userNickName);
		if (!user) {
			throw new Error("Usuário não encontrado");
		}
		user.following.push(followNickName);
		await user.save();
		return user;
	}

	async unfollowUser(
		userNickName: string,
		unfollowNickName: string,
	): Promise<User> {
		const user = await this.findByNickName(userNickName);
		if (!user) {
			throw new Error("Usuário não encontrado");
		}
		user.following = user.following.filter(
			(nick) => nick !== unfollowNickName,
		);
		await user.save();
		return user;
	}

	async countFollowers(nickName: string): Promise<number> {
		return this.userModel.countDocuments({ following: nickName }).exec();
	}

	async countFollowing(nickName: string): Promise<number> {
		const user = await this.findByNickName(nickName);
		if (!user) {
			return 0;
		}
		return user.following.length;
	}
}
