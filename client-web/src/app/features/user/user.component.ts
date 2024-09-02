import { Component } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { User } from "../../../models/user";
import { UserService } from "../../core/services/user.service";
import { UserContext } from "../../shared/user.service";
import { Post } from "../../../models/post";
import { PostService } from "../../core/services/post.service";

@Component({
	selector: "app-user",
	standalone: true,
	imports: [],
	templateUrl: "./user.component.html",
	styleUrl: "./user.component.scss",
})
export class UserComponent {
	isLoading: boolean = false;
	isLoadingPosts: boolean = false;
	currentUser: User | undefined;
	user: User | undefined;
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
				this.isLoading = false;
				this.getUser();
			},
			error: (error) => {
				this.isLoading = false;
				console.log("Erro ao decodificar o token:", error);
			},
		});
	}

	getUser() {
		this.isLoading = true;
		this.userService
			.findByNickName(this.route.snapshot.paramMap.get("user") as string)
			.subscribe({
				next: (u) => {
					this.user = u;
				},
				error: () => {
					this.router.navigate(["/user"]);
				},
			});
		this.isLoading = false;
	}

	getPosts() {
		this.isLoadingPosts = true;
		this.postService
			.getByNickName(this.currentUser?.nickName as string)
			.subscribe({ next: (p) => (this.posts = p) });
		this.isLoadingPosts = false;
	}
}
