import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	BadRequestException,
	UseInterceptors,
	UploadedFile,
	NotFoundException,
} from "@nestjs/common";
import { PostService } from "./post.service";
import { UserService } from "./../user/user.service";
import { CreatePostDto } from "./dto/create-post.dto";
import { UpdatePostDto } from "./dto/update-post.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { ImageService } from "../services/image.service";

@Controller("post")
export class PostController {
	constructor(
		private readonly postService: PostService,
		private readonly userService: UserService,
		private readonly imageService: ImageService,
	) {}

	@Post()
	@UseInterceptors(FileInterceptor("file"))
	async create(
		@Body() createPostDto: CreatePostDto,
		@UploadedFile() file: Express.Multer.File,
	) {
		if (!file)
			throw new BadRequestException("É necessário enviar uma imagem");

		if (!(await this.userService.findByNickName(createPostDto.user)))
			throw new NotFoundException("Usuário não encontrado");

		createPostDto.picture = await this.imageService.uploadImage(file);
		return {
			message: "Post criado com sucesso",
			post: await this.postService.create(createPostDto),
		};
	}

	@Get("nickName/:user")
	async getByNickName(@Param("user") user: string) {
		return await this.postService.findByUser(user)
	}

	@Get("followings/:user")
	async getByFollowings(@Param("user") user: string) {
		const existUser = await this.userService.findByNickName(user);
		if (!existUser) throw new NotFoundException("Usuário não encontrado");
		return this.postService.findByFollowings(existUser.following);
	}

	@Patch(":id")
	@UseInterceptors(FileInterceptor("file"))
	async update(
		@Param("id") id: string,
		@Body() updatePostDto: UpdatePostDto,
		@UploadedFile() file: Express.Multer.File,
	) {
		const post = await this.postService.findById(id);
		if (!post) throw new NotFoundException("Post não encontrado");
		if (file) {
			const imageName = post.picture.split("/").pop();
			await this.imageService.deleteImage(imageName);
			updatePostDto.picture = await this.imageService.uploadImage(file);
		}
		return {
			message: "Post atualizado com sucesso",
			post: await this.postService.update(id, updatePostDto),
		};
	}

	@Delete(":id")
	async remove(@Param("id") id: string) {
		const post = await this.postService.findById(id);
		if (!post) throw new NotFoundException("Post não encontrado");

		const imageName = post.picture.split("/").pop();
		await this.imageService.deleteImage(imageName);

		await this.postService.remove(id);
		return { message: "Post deletado com sucesso" };
	}
}
