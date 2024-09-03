import { TestBed } from "@angular/core/testing";

import { UserContext } from "./user.context";

describe("UserService", () => {
	let service: UserContext;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(UserContext);
	});

	it("should be created", () => {
		expect(service).toBeTruthy();
	});
});
