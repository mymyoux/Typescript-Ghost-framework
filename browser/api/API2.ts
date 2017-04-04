///<file="API"/>
///<file="IAPIOptions"/>
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
				if (data && token && this._cacheManager) {
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
								if (exception && exception.fatal && this._cacheManager)
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
