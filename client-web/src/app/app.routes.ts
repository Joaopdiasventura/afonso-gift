import { Routes } from "@angular/router";
import { FeedComponent } from "./features/feed/feed.component";
import { EnterComponent } from "./features/enter/enter.component";
import { SearchComponent } from "./features/search/search.component";
import { UserComponent } from "./features/user/user.component";
import { NotFoundComponent } from "./features/not-found/not-found.component";
import { PostComponent } from "./features/post/post.component";

export const routes: Routes = [
	{ path: "", component: FeedComponent },
	{ path: "enter", component: EnterComponent },
	{ path: "post", component: PostComponent },
	{ path: "search", component: SearchComponent },
	{ path: "user/:user", component: UserComponent },
	{ path: "**", component: NotFoundComponent },
];
