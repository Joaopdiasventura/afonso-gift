import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import { User } from "../../../models/user";
import { UserService } from "../../core/services/user.service";
import { UserContext } from "../../shared/user.service";

@Component({
	selector: "app-search",
	standalone: true,
	imports: [CommonModule, FormsModule, RouterModule],
	templateUrl: "./search.component.html",
	styleUrl: "./search.component.scss",
})
export class SearchComponent implements OnInit {
	isLoading: boolean = false;
	currentUser: User | undefined;
	identifier: string = "";
	users: User[] = [];

	constructor(
		private router: Router,
		private userContext: UserContext,
		private userService: UserService,
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
				console.log("Erro ao decodificar o token:", error);
			},
		});
	}

	getUsers() {
		this.isLoading = true;
		this.userService.findMany(this.identifier).subscribe({
			next: (u) => {
				this.users = u;
			},
		});
		this.isLoading = false;
	}

	navigateToIndex() {
		this.router.navigate(["/"]);
	}

	navigateToProfile() {
		this.router.navigate(["/profile"]);
	}

	getCurrentUserProfilePicture(): string {
		return this.currentUser && this.currentUser.picture
			? this.currentUser.picture
			: "https://icones.pro/wp-content/uploads/2021/02/icono-de-camara-gris.png";
	}
}
