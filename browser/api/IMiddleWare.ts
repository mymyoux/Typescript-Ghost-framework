module ghost.browser.api {
	export interface IMiddleWare {

		request?: (data: any) => any | void;
	}
}
