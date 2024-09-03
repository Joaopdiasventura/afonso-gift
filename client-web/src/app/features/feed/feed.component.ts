import { CommonModule } from "@angular/common";
import { Post } from "../../../models/post";
import { PostService } from "./../../core/services/post.service";
import { UserService } from "./../../core/services/user.service";
import { UserContext } from "../../shared/user.context";
import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { User } from "../../../models/user";

@Component({
	selector: "app-feed",
	standalone: true,
	imports: [CommonModule],
	templateUrl: "./feed.component.html",
	styleUrls: ["./feed.component.scss"],
})
export class FeedComponent implements OnInit {
	isLoading: boolean = false;
	posts: Post[] = [];
	currentUser: User | undefined;

	constructor(
		private router: Router,
		private userContext: UserContext,
		private userService: UserService,
		private postService: PostService,
	) {}

	ngOnInit(): void {
		this.userContext.currentUserData.subscribe((userData) => {
			if (!userData) {
				const token = localStorage.getItem("token");
				if (!token) {
					this.router.navigate(["/enter"]);
					return;
				}
				this.decode(token);
			} else {
				this.currentUser = userData;
				this.loadPosts(userData.nickName);
			}
		});
	}

	decode(token: string) {
		this.isLoading = true;
		this.userService.decode({ token }).subscribe({
			next: (u) => {
				this.userContext.updateUserData(u);
				this.currentUser = u;
				this.isLoading = false;
				this.loadPosts(u.nickName);
			},
			error: (error) => {
				this.isLoading = false;
				console.log("Erro ao decodificar o token:", error);
			},
		});
	}

	loadPosts(user: string) {
		this.isLoading = true;
		this.postService.getByFollowings(user).subscribe({
			next: (posts) => {
				this.posts = posts;
				this.isLoading = false;
			},
			error: (error) => {
				this.isLoading = false;
				console.log("Erro ao buscar posts:", error);
			},
		});
	}

	navigateToSearch() {
		this.router.navigate(["/search"]);
	}

	navigateToProfile() {
		this.router.navigate(["/user/" + this.currentUser?.nickName]);
	}

	navigateToPost() {
		this.router.navigate(["/post"]);
	}

	getCurrentUserProfilePicture(): string {
		return this.currentUser && this.currentUser.picture
			? this.currentUser.picture
			: "https://icones.pro/wp-content/uploads/2021/02/icono-de-camara-gris.png";
	}

	getUserPicture(
		user: string | { name: string; nickName: string; picture: string },
	): string {
		if (typeof user == "string") {
			return "https://icones.pro/wp-content/uploads/2021/02/icono-de-camara-gris.png";
		} else {
			return (
				user.picture ||
				"https://icones.pro/wp-content/uploads/2021/02/icono-de-camara-gris.png"
			);
		}
	}

	getUserName(
		user: string | { name: string; nickName: string; picture: string },
	): string {
		return typeof user == "string" ? "Usuário" : user.name;
	}

	getUserNickName(
		user: string | { name: string; nickName: string; picture: string },
	): string {
		return typeof user == "string" ? "apelido" : user.nickName;
	}
}
