import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../enviroments/enviroment";
import { User } from "../../../models/user";

@Injectable({
	providedIn: "root",
})
export class UserService {
	private readonly apiUrl: string = environment.api.url + "/user";
	constructor(private http: HttpClient) {}

	register(dto: FormData) {
		return this.http.post<{ token: string }>(this.apiUrl, dto);
	}
	login(dto: { identifier: string; password: string }) {
		return this.http.post<{ token: string }>(this.apiUrl + "/login", dto);
	}
	decode(dto: { token: string }) {
		return this.http.post<User>(this.apiUrl + "/decode", dto);
	}
	findMany(identifier: string) {
		return this.http.get<User[]>(this.apiUrl + "/findMany/" + identifier);
	}
	findByNickName(nickName: string) {
		return this.http.get<User>(this.apiUrl + "/nickName/" + nickName);
	}
}
