import { ImageService } from "./../services/image.service";
import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	BadRequestException,
	NotFoundException,
	UnauthorizedException,
	UseInterceptors,
	UploadedFile,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { DecodeTokenDto } from "./dto/decode-token.dto";
import { LoginUserDto } from "./dto/login-user.dto";
import { sign, verify } from "jsonwebtoken";
import { compareSync, hashSync } from "bcrypt";

@Controller("user")
export class UserController {
	SECRET_KEY: string;
	HASH: number;

	constructor(
		private readonly userService: UserService,
		private readonly imageService: ImageService,
	) {
		this.SECRET_KEY = process.env.SECRET_KEY;
		this.HASH = parseInt(process.env.HASH);
	}

	@Post()
	@UseInterceptors(FileInterceptor("file"))
	async create(
		@Body() createUserDto: CreateUserDto,
		@UploadedFile() file: Express.Multer.File,
	) {
		const existingUser = await this.userService.findUnique(
			createUserDto.email,
			createUserDto.nickName,
		);

		if (existingUser) {
			if (existingUser.email == createUserDto.email)
				throw new BadRequestException(
					"Já existe um usuário com esse email",
				);
			if (existingUser.nickName == createUserDto.nickName)
				throw new BadRequestException(
					"Já existe um usuário com esse apelido",
				);
		}

		if (file)
			createUserDto.picture = await this.imageService.uploadImage(file);

		createUserDto.password = this.hashPassword(createUserDto.password);

		return this.encode(
			(await this.userService.create(createUserDto)).email,
		);
	}

	@Post("/login")
	async login(@Body() loginUserDto: LoginUserDto) {
		const user = await this.userService.findUnique(
			loginUserDto.identifier,
			loginUserDto.identifier,
		);
		if (!user) throw new NotFoundException("Conta não encontrada");
		if (!compareSync(loginUserDto.password, user.password))
			throw new UnauthorizedException("Senha incorreta");
		return this.encode(user.email);
	}

	@Post("/decode")
	async decode(@Body() decodeTokenDto: DecodeTokenDto) {
		try {
			const email = verify(decodeTokenDto.token, this.SECRET_KEY);
			const user = await this.userService.findByEmail(email as string);
			if (!user) throw new BadRequestException("Usuário não encontrado");
			return user;
		} catch (error) {
			throw new BadRequestException("Token inválido");
		}
	}

	@Patch(":email")
	@UseInterceptors(FileInterceptor("file"))
	async update(
		@Param("email") email: string,
		@Body() updateUserDto: UpdateUserDto,
		@UploadedFile() file: Express.Multer.File,
	) {
		const existingUser = await this.userService.findByEmail(email);

		if (!existingUser) {
			throw new NotFoundException("Usuário não encontrado");
		}

		if (updateUserDto.nickName) {
			const userWithSameNickName = await this.userService.findByNickName(
				updateUserDto.nickName,
			);
			if (
				userWithSameNickName &&
				existingUser.nickName != updateUserDto.nickName
			) {
				throw new BadRequestException(
					"Já existe um usuário com esse apelido",
				);
			}
		}

		if (file) {
			if (
				existingUser.picture &&
				existingUser.picture !=
					"https://icones.pro/wp-content/uploads/2021/02/icono-de-camara-gris.png"
			) {
				const imageName = existingUser.picture.split("/").pop();
				await this.imageService.deleteImage(imageName);
			}
			updateUserDto.picture = await this.imageService.uploadImage(file);
		}

		if (updateUserDto.password) {
			updateUserDto.password = this.hashPassword(updateUserDto.password);
		}

		const updatedUser = await this.userService.update(email, updateUserDto);

		return { message: "Usuário atualizado com sucesso", user: updatedUser };
	}

	@Delete(":email")
	async remove(@Param("email") email: string) {
		const user = await this.userService.findByEmail(email);
		if (!user) throw new NotFoundException("Usuário não encontrado");

		if (user.picture) {
			const imageName = user.picture.split("/").pop();
			await this.imageService.deleteImage(imageName);
		}

		await this.userService.remove(email);
		return { message: "Usuário removido com sucesso" };
	}

	@Get("email/:email")
	async findByEmail(@Param("email") email: string) {
		const user = await this.userService.findByEmail(email);
		if (!user) throw new NotFoundException("Usuário não encontrado");
		return user;
	}

	@Get("nickName/:nickName")
	async findByNickName(@Param("nickName") nickName: string) {
		const user = await this.userService.findByNickName(nickName);
		if (!user) throw new NotFoundException("Usuário não encontrado");
		return user;
	}

	@Get("/findMany/:nickName")
	async findMany(@Param("nickName") nickName: string) {
		return this.userService.findMany(nickName);
	}

	@Get("/followers/:nickName")
	async findFollowers(@Param("nickName") nickName: string) {
		return this.userService.findFollowers(nickName);
	}

	@Get("/followings/:nickName")
	async findFollowings(@Param("nickName") nickName: string) {
		return this.userService.findFollowings(nickName);
	}

	@Patch("/follow/:userNickName/:followNickName")
	async followUser(
		@Param("userNickName") userNickName: string,
		@Param("followNickName") followNickName: string,
	) {
		return this.userService.followUser(userNickName, followNickName);
	}

	@Patch("/unfollow/:userNickName/:unfollowNickName")
	async unfollowUser(
		@Param("userNickName") userNickName: string,
		@Param("unfollowNickName") unfollowNickName: string,
	) {
		return this.userService.unfollowUser(userNickName, unfollowNickName);
	}

	@Get("/count-followers/:nickName")
	async countFollowers(@Param("nickName") nickName: string) {
		return this.userService.countFollowers(nickName);
	}

	@Get("/count-following/:nickName")
	async countFollowing(@Param("nickName") nickName: string) {
		return this.userService.countFollowing(nickName);
	}

	private encode(email: string) {
		return { token: sign(email, this.SECRET_KEY) };
	}

	private hashPassword(password: string) {
		return hashSync(password, this.HASH);
	}
}
