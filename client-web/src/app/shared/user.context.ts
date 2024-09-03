import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { User } from "../../models/user";

@Injectable({
	providedIn: "root",
})
export class UserContext {
	private userDataSource = new BehaviorSubject<User | undefined>(undefined);
	currentUserData = this.userDataSource.asObservable();

	constructor() {}

	updateUserData(data: any) {
		this.userDataSource.next(data);
	}
}
