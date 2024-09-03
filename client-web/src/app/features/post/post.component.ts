import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { User } from "../../../models/user";
import { PostService } from "../../core/services/post.service";
import { UserService } from "../../core/services/user.service";
import { UserContext } from "../../shared/user.context";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";

@Component({
	selector: "app-post",
	standalone: true,
	imports: [FormsModule, CommonModule],
	templateUrl: "./post.component.html",
	styleUrls: ["./post.component.scss"],
})
export class PostComponent {
	isLoading: boolean = false;
	description: string = "";
	currentUser: User | undefined;
	selectedFile: File | null = null;
	selectedImageSrc: string | ArrayBuffer | null =
		"https://icones.pro/wp-content/uploads/2021/02/icono-de-camara-gris.png";

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
			},
			error: (error) => {
				this.isLoading = false;
				console.error("Erro ao decodificar o token:", error);
			},
		});
	}

	create() {
		if (!this.selectedFile) {
			alert("É necessário escolher uma imagem");
			return;
		}
		this.isLoading = true;
		const formData = new FormData();
		formData.append("file", this.selectedFile, this.selectedFile.name);
		formData.append("description", this.description);
		if (this.currentUser) {
			formData.append("user", this.currentUser.nickName);
		}
		this.postService.create(formData).subscribe({
			next: (t) => {
				alert(t.message);
				this.resetForm();
			},
			error: (error) => {
				alert("Erro ao registrar: " + error.error.message);
			},
			complete: () => {
				this.isLoading = false;
			},
		});
	}

	onFileSelected(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files && input.files[0]) {
			this.selectedFile = input.files[0];
			const reader = new FileReader();
			reader.onload = () => {
				this.selectedImageSrc = reader.result;
			};
			reader.readAsDataURL(this.selectedFile);
		}
	}

	resetForm() {
		this.description = "";
		this.selectedFile = null;
		this.selectedImageSrc =
			"https://icones.pro/wp-content/uploads/2021/02/icono-de-camara-gris.png";
	}

	navigateToIndex() {
		this.router.navigate(["/"]);
	}

	navigateToSearch() {
		this.router.navigate(["/search"]);
	}

	navigateToProfile() {
		this.router.navigate(["/user/" + this.currentUser?.nickName]);
	}

	getUserPicture(
		user:
			| string
			| { name: string; nickName: string; picture: string }
			| undefined,
	): string {
		if (typeof user == "string")
			return "https://icones.pro/wp-content/uploads/2021/02/icono-de-camara-gris.png";
		if (user)
			return (
				user.picture ||
				"https://icones.pro/wp-content/uploads/2021/02/icono-de-camara-gris.png"
			);
		return "";
	}
}
