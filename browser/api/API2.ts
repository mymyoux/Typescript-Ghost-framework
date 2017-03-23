///<file="API"/>
///<file="APIExtended"/>
///<file="IMiddleWare"/>
namespace ghost.browser.api
{
	export class API2 extends APIExtended
	{
		protected static API_TOKEN: string = "token";
		public static instance(name?: string, cls?: API2): API2
		public static instance(cls?: API2): API2
		public static instance(name?: any, cls?: API2): API2 {
			if(!name)
			{
				for (var p in API._instances)
				{
					if (API._instances[p] instanceof API2)
					{
						return API._instances[p];
					}
				}
			}
			return <API2>API.instance(name, cls);
		}
		public static request(name: string = null): API2 {
			return <API2>API.instance(name).request();
		}

		protected _path: string;
		public constructor()
		{
			super();
			this._always = true;
		}
		public path(path:string):API2
		{
			this._path = path;
			return this;
		}
		public config(options: IAPIOptions): API2
		{
			return <API2>super.config(options);
		}
		protected getRequest(): any {
			var request: any = super.getRequest();
			if(this._path)
				request.url = this._config.url + this._path;
			if (this._config[API2.API_TOKEN])
			{
				if(!request.data)
				{
					request.data = {};
				}
				request.data.api_token = this._config[API2.API_TOKEN];
			}
			if (!this._method && request.data && request.data.method)
			{
				delete request.data.method;
			}
			return request;
		}
		protected _then(request: any, resolve: any, reject: any, token: string): APIExtended {
			for (var p in APIExtended.middlewares) {
				if (APIExtended.middlewares[p].request) {
					APIExtended.middlewares[p].request(request);
				}
			}
			this.lastRequest = request;
			var promise = ghost.browser.io.ajax(request, { asObject: true });//this.getPromise();
			this._previousPromise = promise;
			promise.then((rawData: any) => {
				if (promise === this._previousPromise) {
					this._previousPromise = null;
				}
				this._next();
				var data: any;
				if (rawData && rawData.data) {
					data = rawData.data;
				}
				if (data && token) {
					this._cacheManager.remove(token);
				}

				// this._promise = null;
				if (data && data.exception) {
					if (reject)
						reject(data);
					return;
				}

				var parsed: any = this.parseResult(data);
				this.trigger(API.EVENT_DATA, data);
				if (resolve)
					resolve.call(this, parsed, data);
			}, (error: any) => {
				if (promise === this._previousPromise) {
					this._previousPromise = null;
				}
				var reason: string = "unknown";
				if (error && token) {

					if (error.jqXHR && error.jqXHR.status != undefined) {
						var status: number = error.jqXHR.status;
						if (status >= 200 && status < 400) {
							var good_user: boolean = true;
							//server good real error
							if (error.data) {
								var data: any = error.data;
								//TODO:handle user change
								var exception: any = data.exception;
								if (exception && exception.fatal)
								{
									this._cacheManager.remove(token);
								}
								/*
								if (data.state_user && data.state_user.id_user != APIExtended._id_user) {
									//error but bad user id
									good_user = false;
								}
								if (data.api_error_code != undefined) {
									if (good_user) {
										APIExtended._cacheManager.remove(token);
									}
								}*/
							}
						}

					}

				}
				if (error && error.errorThrown) {
					reason = error.errorThrown;
				}
				this._next();

				if (reject)
					reject(reason);
			});
			return <any>this;
		}
		protected parseResult(data: any): any {
			if(data.api_data)
			{
				this.parseAPIData(data.api_data);
			}
			if(data.data)
			{
				if (data.data) {
					this.trigger(API.EVENT_DATA_FORMATTED, data.data);
				}
				return data.data;
			}
			return data;
		}
		public request(): API2 {
			var c: any = super.request();
			return c; 
		}
		public clone(): API2 
		{
			var clone:API2 = <API2>super.clone();
			clone.path(this._path);
			clone.always(this._always);
			return clone;
		}
		protected service(serviceName: string, property: string, data): API2 {
			super.service(serviceName, property, data);
			return this;
		}
		//TODO:check if needed
		/*
		protected parseAPIData(data: any): void {
			if (!data) {
				return;
			}
			if (!this._apiData) {
				this._apiData = {};
			}
			var keys = ["allowed", "directions", "keys", "limit", "previous", "next"];
			if (data.paginate) {
				if (!this._apiData.paginate) {
					this._apiData.paginate = {};
				}


				if (data.paginate.next) {
					this._apiData.paginate.next = data.paginate.next;
					var isNextAll: boolean = !this._apiData.paginate.nextAll;
					if (!isNextAll) {
						isNextAll = true;
						for (var i: number = 0; i < data.paginate.next.length; i++) {
							if (!((this._apiData.paginate.nextAll[i] < data.paginate.next[i] && this._direction[i] > 0) || (this._apiData.paginate.nextAll[i] > data.paginate.next[i] && this._direction[i] < 0))) {
								if (this._apiData.paginate.nextAll[i] == data.paginate.next[i]) {
									continue;
								}
								isNextAll = false;
								break;
							} else {
								break;
							}
						}
					}

					if (isNextAll) {
						this._apiData.paginate.nextAll = data.paginate.next;
					}

				}
				if (data.paginate.previous) {
					this._apiData.paginate.previous = data.paginate.previous;

					var isPreviousAll: boolean = !this._apiData.paginate.previousAll;
					if (!isPreviousAll) {
						isPreviousAll = true;
						for (var i: number = 0; i < data.paginate.previous.length; i++) {
							if (!((this._apiData.paginate.previousAll[i] > data.paginate.previous[i] && this._direction[i] > 0) || (this._apiData.paginate.previousAll[i] < data.paginate.previous[i] && this._direction[i] < 0))) {
								if (this._apiData.paginate.previousAll[i] == data.paginate.previous[i]) {
									continue;
								}
								isPreviousAll = false;
								break;
							} else {
								break;
							}
						}
					}

					if (isPreviousAll) {
						this._apiData.paginate.previousAll = data.paginate.previous;
					}

				}
				if (data.paginate.limit)
					this._apiData.paginate.limit = data.paginate.limit;

				for (var p in data.paginate) {
					if (keys.indexOf(p) == -1) {
						this._apiData[p] = data.paginate[p];
					}
				}
			}
			keys.push("paginate");
			for (var p in data) {
				if (keys.indexOf(p) == -1) {
					this._apiData[p] = data[p];
				}
			}
		}*/
		public order(id: string | string[], direction: number | number[] = 1): API2 {
			if (typeof direction == "number") {
				direction = [direction];
			}
			if (typeof id == "string") {
				id = [id];
			}
			if (direction.length != id.length) {
				debugger;
				throw new Error("direction != keys");
			}
			this._direction = direction;
			return this.service("paginate", "keys", id).service("paginate", "directions", direction);
		}
		public paginate(key: string): API2 {
			return this.service("paginate", "keys", key);
		}
	}
}
