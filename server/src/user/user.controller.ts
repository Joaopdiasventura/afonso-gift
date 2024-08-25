import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	BadRequestException,
	HttpCode,
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
import { v4 as uuid } from "uuid";
import { join } from "path";
import { existsSync, unlinkSync, writeFileSync } from "fs";

@Controller("user")
export class UserController {
	SECRET_KEY: string;
	HASH: number;

	constructor(private readonly userService: UserService) {
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

		if (file) {
			createUserDto.picture = this.saveImage(file);
		}

		createUserDto.password = this.hashPassword(createUserDto.password);

		return this.encode(
			(await this.userService.create(createUserDto)).email,
		);
	}

	@Post("login")
	async login(@Body() loginUserDto: LoginUserDto) {
		const user = await this.userService.findUnique(
			loginUserDto.identifier,
			loginUserDto.identifier,
		);
		if (!user)
			throw new NotFoundException(
				"Não existe nenhum usuário com esse email ou apelido",
			);
		if (!compareSync(loginUserDto.password, user.password))
			throw new UnauthorizedException("Senha incorreta");
		return this.encode(user.email);
	}

	@Post("decode")
	@HttpCode(200)
	async decode(@Body() decodeTokenDto: DecodeTokenDto) {
		const { token } = decodeTokenDto;
		try {
			const email = verify(token, this.SECRET_KEY) as string;
			const user = await this.userService.findByEmail(email);
			if (!user) throw new NotFoundException("Usuário não encontrado");

			const followersCount = await this.userService.countFollowers(
				user.nickName,
			);
			const followingCount = await this.userService.countFollowing(
				user.nickName,
			);
			return { ...user, followersCount, followingCount };
		} catch (error) {
			throw new BadRequestException("Token inválido");
		}
	}

	@Get("/email/:email")
	async findByEmail(@Param("email") email: string) {
		const user = await this.userService.findByEmail(email);
		if (!user) throw new NotFoundException("Usuário não encontrado");

		const followersCount = await this.userService.countFollowers(
			user.nickName,
		);
		const followingCount = await this.userService.countFollowing(
			user.nickName,
		);
		return { ...user, followersCount, followingCount };
	}

	@Get("/nickName/:nickName")
	async findByNickName(@Param("nickName") nickName: string) {
		const user = await this.userService.findByEmail(nickName);
		if (!user) throw new NotFoundException("Usuário não encontrado");

		const followersCount = await this.userService.countFollowers(
			user.nickName,
		);
		const followingCount = await this.userService.countFollowing(
			user.nickName,
		);
		return { ...user, followersCount, followingCount };
	}

	@Get("/followers/:nickName")
	async findFollows(@Param("nickName") nickName: string) {
		return this.userService.findFollowers(nickName);
	}

	@Get("/followings/:nickName")
	async findFollowings(@Param("nickName") nickName: string) {
		return this.userService.findFollowings(nickName);
	}

	@Get("/findMany/:identifier")
	async findMany(@Param("identifier") identifier: string) {
		return this.userService.findMany(identifier);
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
				const oldImagePath = join(
					__dirname,
					"..",
					"..",
					"uploads",
					existingUser.picture,
				);
				this.deleteImage(oldImagePath);
			}

			updateUserDto.picture = this.saveImage(file);
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
			const imagePath = join(
				__dirname,
				"..",
				"..",
				"uploads",
				user.picture,
			);
			this.deleteImage(imagePath);
		}

		await this.userService.remove(email);
		return { message: "Usuário removido com sucesso" };
	}

	@Patch(":nickName/follow/:followNickName")
	async followUser(
		@Param("nickName") nickName: string,
		@Param("followNickName") followNickName: string,
	) {
		await this.userService.followUser(nickName, followNickName);
		return { message: "Seguindo o usuário " + followNickName };
	}

	@Patch(":nickName/unfollow/:unfollowNickName")
	async unfollowUser(
		@Param("nickName") nickName: string,
		@Param("unfollowNickName") unfollowNickName: string,
	) {
		await this.userService.unfollowUser(nickName, unfollowNickName);
		return { message: "Deixando de seguir o usuário " + unfollowNickName };
	}

	private encode(email: string) {
		return { token: sign(email, this.SECRET_KEY) };
	}

	private hashPassword(password: string) {
		return hashSync(password, this.HASH);
	}

	private saveImage(file: Express.Multer.File): string {
		const uniqueFileName = `${uuid()}${file.originalname}`;
		const uploadPath = join(
			__dirname,
			"..",
			"..",
			"uploads",
			uniqueFileName,
		);

		try {
			writeFileSync(uploadPath, file.buffer);
		} catch (err) {
			throw new BadRequestException("Erro ao salvar a imagem");
		}

		return uniqueFileName;
	}

	private deleteImage(imagePath: string) {
		if (existsSync(imagePath)) {
			try {
				unlinkSync(imagePath);
			} catch (err) {
				console.error(`Erro ao excluir a imagem: ${err.message}`);
			}
		}
	}
}
