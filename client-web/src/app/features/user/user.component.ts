import { Component } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { User } from "../../../models/user";
import { UserService } from "../../core/services/user.service";
import { UserContext } from "../../shared/user.context";
import { Post } from "../../../models/post";
import { PostService } from "../../core/services/post.service";
import { CommonModule } from "@angular/common";

@Component({
	selector: "app-user",
	standalone: true,
	imports: [CommonModule],
	templateUrl: "./user.component.html",
	styleUrls: ["./user.component.scss"],
})
export class UserComponent {
	isLoading: boolean = false;
	isLoadingPosts: boolean = false;
	currentUser: User | undefined;
	user: User | undefined;
	followers: User[] = [];
	followings: User[] = [];
	posts: Post[] = [];

	constructor(
		private route: ActivatedRoute,
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
			}
			this.getUser();
		});
	}

	decode(token: string) {
		this.isLoading = true;
		this.userService.decode({ token }).subscribe({
			next: (u) => {
				this.userContext.updateUserData(u);
				this.currentUser = u;
				this.getUser();
			},
			error: (error) => {
				console.log("Erro ao decodificar o token:", error);
			},
		});
		this.isLoading = false;
	}

	getUser() {
		this.isLoading = true;
		this.userService
			.findByNickName(this.route.snapshot.paramMap.get("user") as string)
			.subscribe({
				next: (u) => {
					this.user = u;
					this.getFollowers(u.nickName);
					this.getFollowings(u.nickName);
					this.getPosts(u.nickName);
				},
				error: () => {
					this.router.navigate(["/user"]);
				},
			});
		this.isLoading = false;
	}

	getFollowers(nickName: string) {
		this.isLoading = true;
		this.userService.findFollowers(nickName).subscribe({
			next: (f) => {
				this.followers = f;
				this.isLoading = false;
			},
			error: () => {
				this.isLoading = false;
			},
		});
	}

	getFollowings(nickName: string) {
		this.isLoading = true;
		this.userService.findFollowings(nickName).subscribe({
			next: (f) => {
				this.followings = f;
				this.isLoading = false;
			},
			error: () => {
				this.isLoading = false;
			},
		});
	}

	getPosts(nickName: string) {
		this.postService.getByNickName(nickName).subscribe({
			next: (p) => (this.posts = p),
			error: () => {
				this.isLoadingPosts = false;
			},
		});
	}

	getUserName(post: Post): string {
		if (post.user && typeof post.user !== "string") {
			return post.user.name;
		}
		return "";
	}

	isFollowing(): boolean {
		return this.currentUser && this.user
			? this.followers.some(
					(f) =>
						this.currentUser &&
						f.nickName === this.currentUser.nickName,
			  )
			: false;
	}

	changeFollow() {
		if (this.currentUser && this.user) {
			if (this.isFollowing()) {
				this.userService
					.unfollow(this.currentUser.nickName, this.user.nickName)
					.subscribe({
						next: () => {
							this.followers = this.followers.filter(
								(f) =>
									this.currentUser &&
									f.nickName != this.currentUser.nickName,
							);
						},
						error: (error) => {
							console.error("Erro ao deixar de seguir:", error);
						},
					});
				return;
			}
			this.userService
				.follow(this.currentUser.nickName, this.user.nickName)
				.subscribe({
					next: () => {
						if (this.currentUser) {
							this.followers.push(this.currentUser);
						}
					},
					error: (error) => {
						console.error("Erro ao seguir:", error);
					},
				});
		}
	}

	navigateToIndex() {
		this.router.navigate(["/"]);
	}

	navigateToSearch() {
		this.router.navigate(["/search"]);
	}

	navigateToPost() {
		this.router.navigate(["/post"]);
	}

	logout() {
		localStorage.removeItem("token");
		this.router.navigate(["/enter"]);
	}

	getCurrentUserProfilePicture(): string {
		return this.currentUser && this.currentUser.picture
			? this.currentUser.picture
			: "https://icones.pro/wp-content/uploads/2021/02/icono-de-camara-gris.png";
	}
}
