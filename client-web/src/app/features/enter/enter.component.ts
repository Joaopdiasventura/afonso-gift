import { UserService } from "./../../core/services/user.service";
import { CommonModule } from "@angular/common";
import { Component, ViewChild, ElementRef } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { UserContext } from "../../shared/user.service";
import { Router } from "@angular/router";

@Component({
	selector: "app-enter",
	standalone: true,
	imports: [FormsModule, CommonModule],
	templateUrl: "./enter.component.html",
	styleUrls: ["./enter.component.scss"],
})
export class EnterComponent {
	identifier: string = "";
	name: string = "";
	email: string = "";
	nickName: string = "";
	password: string = "";
	password2: string = "";
	message: string = "";
	isActive: boolean = false;
	isLoading: boolean = false;
	selectedFile: File | null = null;
	selectedImageSrc: string | ArrayBuffer | null = null;

	@ViewChild("fileInput") fileInput!: ElementRef;

	constructor(
		private readonly userService: UserService,
		private userContext: UserContext,
		private router: Router,
	) {}

	get containerClasses() {
		return this.isActive ? "container active" : "container";
	}

	onFileSelected(event: any) {
		const file = event.target.files[0];
		this.selectedFile = file;
		const reader = new FileReader();
		reader.onload = (e) => {
			this.selectedImageSrc = e.target?.result ? e.target?.result : "";
		};
		reader.readAsDataURL(file);
	}

	triggerFileInput() {
		this.fileInput.nativeElement.click();
	}

	register() {
		if (this.password !== this.password2) {
			alert("Senhas precisam ser a mesma");
			return;
		}
		this.isLoading = true;

		const formData = new FormData();
		formData.append("name", this.name);
		formData.append("email", this.email);
		formData.append("nickName", this.nickName);
		formData.append("password", this.password);

		if (this.selectedFile)
			formData.append("file", this.selectedFile, this.selectedFile.name);

		this.userService.register(formData).subscribe({
			next: (t) => {
				this.decode(t.token);
				this.isLoading = false;
				alert("Usuário registrado com sucesso");
			},
			error: (error) => {
				this.isLoading = false;
				alert("Erro ao registrar: " + error.error.message);
			},
		});
	}

	logar() {
		this.isLoading = true;
		this.userService
			.login({
				identifier: this.identifier,
				password: this.password,
			})
			.subscribe({
				next: (t) => {
					this.decode(t.token);
					this.isLoading = false;
				},
				error: (error) => {
					this.isLoading = false;
					alert("Erro ao logar: " + error.error.message);
				},
			});
	}

	decode(token: string) {
		localStorage.setItem("token", token);
		this.isLoading = true;
		this.userService.decode({ token }).subscribe({
			next: (u) => {
				this.userContext.updateUserData(u);
				this.isLoading = false;
				this.router.navigate(["/"]);
			},
			error: (error) => {
				this.isLoading = false;
				console.log(error);
			},
		});
	}

	change() {
		this.isActive = !this.isActive;
	}
}
