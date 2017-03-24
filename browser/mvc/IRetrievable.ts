namespace ghost.browser.mvc
{
	export interface IRetrievable {
		retrieveFromServer(callback: Function, times?: number);
		isRetrieved(): boolean;
	}

}
