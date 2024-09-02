export interface Post {
	_id: string;
	description: string;
	picture: string;
	created_at: Date;
	user: string | { name: string; nickName: string; picture: string };
}
