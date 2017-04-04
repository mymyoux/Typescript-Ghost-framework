

	export interface IRetrievable {
		retrieveFromServer(callback: Function, times?: number);
		isRetrieved(): boolean;
	}

