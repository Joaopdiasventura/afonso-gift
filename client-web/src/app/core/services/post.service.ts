import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../enviroments/enviroment";
import { Post } from "../../../models/post";

@Injectable({
	providedIn: "root",
})
export class PostService {
	private readonly apiUrl: string = environment.api.url + "/post";
	constructor(private http: HttpClient) {}

	create(dto: FormData) {
		return this.http.post<{ message: string }>(this.apiUrl, dto);
	}
	getByFollowings(user: string) {
		return this.http.get<Post[]>(this.apiUrl + "/followings/" + user);
	}

	getByNickName(user: string) {
		return this.http.get<Post[]>(this.apiUrl + "/nickName/" + user);
	}
}
