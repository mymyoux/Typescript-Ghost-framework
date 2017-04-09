//convert
 /* ghost.browser.io.ajax(*/
import {ajax} from "browser/io/Ajax";
//convert
 /* ghost.browser.data.LocalForage;*/
import {LocalForage} from "browser/data/Forage";
//convert
 /* ghost.utils.Strings.*/
import {Strings} from "ghost/utils/Strings";
//convert
 /* ghost.utils.URI.*/
import {URI} from "ghost/utils/URI";
//convert
 /* ghost.utils.Maths.*/
import {Maths} from "ghost/utils/Maths";
//convert-files
import {API} from "./API";
//convert-files
import {IMiddleWare} from "./IMiddleWare";

	//convert-import
import {CancelablePromise} from "ghost/io/CancelablePromise";
	//convert-import
import {Objects} from "ghost/utils/Objects";
	export class CacheManager {
		protected _api: APIExtended;
		protected _local: LocalForage;
		protected _instance: string;
		protected _initialized: boolean;
		public constructor() {
		}
		public instance(): string {
			if (!this._instance) {
				this._instance = this.generateUniqueID();
			}
			return this._instance;
		}
		public war(name?: string): LocalForage {
			if (!this._local) {
				name = "apicache_" + (name ? name : "");
				this._local = LocalForage.instance().warehouse(name);
			}
			return this._local;
		}
		public add(request: any): string {
			if (!this._initialized) { 
			}
			request._instance = this.instance();
			var token: string = this.generateUniqueID();
			this.war().setItem(token, request);
			return token;
		}
		public clear(): Promise<any> {
			return this.war().clear();
		}
		public remove(token: string): void {
			this.war().removeItem(token);
		}
		protected generateUniqueID(): string {
			return Strings.getUniqueToken();
		}
		public init(name: string = null, api: APIExtended = null): void {
			if (this._initialized) {
				return;
			}
			if (name) {
				this._local = null;
				this.war(name);
			}
			this._initialized = true;

			this.war().keys().then((keys: string[]) => {
				if (!keys || !keys.length) {
					return;
				}
				this._api = api.request().stack(true);
				keys.forEach((key: string): void => {
					this.war().getItem(key).then((request: any): void => {
						if (!request) {
							this.war().removeItem(key);
							return;
						}
						if (request._instance != this.instance()) {
							console.warn("api -reexecute: ", request);
							if (request.data) {
								if (request.data._reloaded_count == undefined) {
									request.data._reloaded_count = 0;
								}
								request.data._reloaded_count++;
								this.war().setItem(key, request);
							}

							this._api.then(key, request);
						} else {
							console.warn("api -ignore: ", request);
						}
					}, (error: any): void => {
							debugger;
						});
				});
			}, () => {
				debugger;
			});
		}
	} 

	export class APIExtended extends API<APIExtended>
	{
		private static _always: any[] = [];
		protected _cacheManager: CacheManager;
		protected _initialized: boolean;
		protected static middlewares: any[] = [];

		public initCache(): void {
			if (this._initialized) {
				return;
			}
			this._initialized = true;
			this._cacheManager = new CacheManager();
			this._cacheManager.init(this._config.cache ? this._config.cache : "cache_" + this._config.id_user, this);

		}
		// public static init(id:string , name?:string):void
		// {
		//     if (APIExtended._initialized === true)
		//     {
		//         return;
		//     }
		//     APIExtended._initialized  = true;
		//     APIExtended._id_user = id;
		//     APIExtended._cacheManager.init(name?name:"cache_"+id);
		//     /*
		//     APIExtended._cacheManager.keys().then(()=>
		//     {
		//         debugger;
		//     }, ()=>
		//     {
		//         debugger;
		//     });    */


		// }
		protected getRequest(): any {
			var request: any = super.getRequest();
			if (request.data) {
				request.data._id = Strings.getUniqueToken();
				if (this._cacheManager)
					request.data._instance = this._cacheManager.instance();
				request.data._timestamp = Date.now();
			}
			return request;
		}
		public clearCache(): Promise<any> {
			return this._cacheManager.clear();
		}

		protected lastRequest: any;
		protected _services: any[];
		protected _apiData: any;
		protected _direction: number[] = [1];
		private _cacheLength: number;
		protected _name: string;
		protected _always: boolean;
		private _stack: boolean = false;
		public _instance: number = Maths.getUniqueID();
		protected _previousPromise: CancelablePromise<any>;
		protected _stacklist: any[];

		public static instance(name?: string, cls?: API<any>): APIExtended
		public static instance(cls?: API<any>): APIExtended
		public static instance(name?: any, cls?: API<any>): APIExtended {
			return <APIExtended>API.instance(name, cls);
		}
		public getLastRequest(): any {
			return this.lastRequest;
		}
		public constructor() {
			super();
			console.log('"CONSTRUCTOR"');
			this._services = [];
			this._stacklist = [];

		}
		public cache(quantity: number): APIExtended {
			this._cacheLength = quantity;
			return this;
		}
		public always(value: boolean): APIExtended {
			this._always = value;
			return this;
		}
		public name(name: string): APIExtended {
			this._name = name;
			return this;
		}
		public method(method: string): APIExtended {
			if (method != "GET" && this._always == undefined) {
				this._always = true;
			}
			return <APIExtended>super.method(method);
		}
		public getAPIData(): any {
			return this._apiData;
		}
		public static request(name: string = null): APIExtended {
			return <APIExtended>API.instance(name).request();
		}
		protected hasData(): boolean {
			return this._data != null || this._services.length != 0;
		}
		protected getData(): any {
			var data: any = this._data ? Objects.clone(this._data) : {};
			data = this._services.reduce(function(previous: any, item: any): any {
				if (!previous[item.name])
					previous[item.name] = {}
				previous[item.name][item.property] = item.data;
				return previous;
			}, data);
			return data;
		}
		public echo(): APIExtended {
			return this.request().controller("echo").action("echo");
		}
		protected service(serviceName: string, property: string, data): APIExtended {
			this.removeService(serviceName, property);
			this._services.push({ name: serviceName, property: property, data: data });
			return this;
		}
		protected removeService(serviceName: string, property?: string): APIExtended {

			var i: number = 0;
			while (i < this._services.length) {
				if (this._services[i].name == serviceName && (!property || this._services[i].property == property)) {
					this._services.splice(i, 1);
				} else {
					i++;
				}
			}
			return this;
		}
		public order(id: string | string[], direction: number | number[] = 1): APIExtended {
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
			return this.service("paginate", "key", id).service("paginate", "direction", direction);
		}
		public params(params: any): APIExtended {
			for (var p in params) {
				if (params[p] != null)
					this.param(p, params[p]);
			}
			return this;
		}
		public param(param: string, data: any): APIExtended {
			if (!this._data) {
				this._data = {};
			}
			if (data && data.writeExternal) {
				data = data.writeExternal();
			}
			this._data[param] = data;
			return this;
		}
		public paginate(key: string): APIExtended {
			return this.service("paginate", "key", key);
		}
		public limit(size: number): APIExtended {
			return this.service("paginate", "limit", size);
		}
		protected parseResult(data: any): any {
			if (data.api_data) {
				this.parseAPIData(data.api_data);
				if (data.api_data.key && data.data) {
					this.trigger(API.EVENT_DATA_FORMATTED, data.data[data.api_data.key]);
				}
				return data.data[data.api_data.key];
			}
			return data;
		}
		protected parseAPIData(data: any): void {
			if (!data) {
				return;
			}
			if (!this._apiData) {
				this._apiData = {};
			}
			var keys = ["allowed", "direction", "key", "limit", "previous", "next"];
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

					/*  if(!this._apiData.paginate.previousAll || (this._apiData.paginate.previousAll> data.paginate.previous && this._direction>0) || (this._apiData.paginate.previousAll< data.paginate.previous && this._direction<0) )
					  {
						  this._apiData.paginate.previousAll = data.paginate.previous;
					  }*/

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
		}

		public next(quantity?: number): APIExtended {
			if (this._apiData && this._apiData.paginate) {
				this.removeService("paginate", "previous");
				this.service("paginate", "next", this._apiData.paginate.next);
				if (quantity != undefined) {
					this.service("paginate", "limit", quantity);
				}
			} else {
				throw new Error("No previous data");
			}
			return <any>this;
		}
		public nextAll(quantity?: number): APIExtended {
			if (this._apiData && this._apiData.paginate) {
				this.removeService("paginate", "previous");
				this.service("paginate", "next", this._apiData.paginate.nextAll);
				if (quantity != undefined) {
					this.service("paginate", "limit", quantity);
				}
			} else {
				//throw new Error("No previous data");
			}
			return <any>this;
		}
		public previous(quantity?: number): APIExtended {
			if (this._apiData && this._apiData.paginate) {
				this.service("paginate", "previous", this._apiData.paginate.previous);
				this.removeService("paginate", "next");
				if (quantity != undefined) {
					this.service("paginate", "limit", quantity);
				}
			} else {
				throw new Error("No previous data");
			}
			return <any>this;
		}
		public previousAll(quantity?: number): APIExtended {
			if (this._apiData && this._apiData.paginate) {
				this.service("paginate", "previous", this._apiData.paginate.previousAll);
				this.removeService("paginate", "next");
				if (quantity != undefined) {
					this.service("paginate", "limit", quantity);
				}
			} else {
				//   throw new Error("No previous data");
			}
			return <any>this;
		}
		public cancel(): APIExtended {
			//TODO:remove saved ones
			if (this._stack && this._stacklist.length) {
				var popped: any = this._stacklist.pop();
				if (popped.reject) {
					popped.reject("abort");
				}
				return this;
			}
			if (this._previousPromise) {
				this._previousPromise.cancel();
				this._previousPromise = null;
			}
			return this;
		}
		public export(): APIExtended {
			return this.service("excel", "use", true);
		}
		public cancelAll(): APIExtended {
			while (this._stacklist.length) {
				console.error("CANCEL");
				var popped: any = this._stacklist.pop();
				if (popped.reject) {
					popped.reject("abort");
				}
			}
			if (this._previousPromise) {
				console.error("CANCEL");
				this._previousPromise.cancel();
				this._previousPromise = null;
			}
			console.error(this._instance);
			return this;
		}
		public stack(value: boolean): APIExtended {
			this._stack = value;
			if (value && !this._stacklist) {
				this._stacklist = [];
			}
			return this;
		}

		public then(token?: string, request?: any): APIExtended
		public then(resolve?: any, reject?: any): APIExtended
		public then(resolve?: any, reject?: any): APIExtended {
			var request: any;
			var token: string;
			if (typeof resolve == "string") {
				token = resolve;
				resolve = null;
				request = reject;
				reject = null;
			}
			if (!request) {
				request = this.getRequest();
			}
			if (this._always && !token) {
				if(this._cacheManager)
					token = this._cacheManager.add(request);
			} 
            /* if(!this._promise)
             {
                 this._promise = this.getPromise();
             }*/

			if (this._stack && this._previousPromise) {
				//stack et already existing promise;
				this._stacklist.push({ resolve: resolve, reject: reject, request: request, token: token });
				return this;
			}
			return this._then(request, resolve, function()
			{
				if(reject)
				{
					console.log("api_error", arguments, request);
					reject.apply(null, Array.prototype.slice.call(arguments))
				}
			}, token);
		}
		public toURL(): string {
			var request: any = this.getRequest();
			return URI.buildURI(request.url, request.data);
		}
		protected _then(request: any, resolve: any, reject: any, token: string): APIExtended {
			for (var p in APIExtended.middlewares) {
				if (APIExtended.middlewares[p].request) {
					APIExtended.middlewares[p].request(request);
				} 
			}
			this.lastRequest = request;
			var promise = ajax(request, { asObject: true });//this.getPromise();
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
				if (data && data.error) {
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
				debugger;
				if (error && token) {

					if (error.jqXHR && error.jqXHR.status != undefined) {
						var status: number = error.jqXHR.status;
						if (status >= 200 && status < 400) {
							debugger;
							var good_user: boolean = true;
							//server good real error
							if (error.data) {
								var data: any = error.data;
								if (data.state_user && data.state_user.id_user != this._config.id_user) {
									//error but bad user id
									good_user = false;
								}
								if (data.api_error_code != undefined) {
									if (good_user && this._cacheManager) {
										this._cacheManager.remove(token);
									}
								}
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
		protected _next(): void {
			if (!this._previousPromise && this._stacklist && this._stacklist.length) {
				var next: any = this._stacklist.shift();
				this._then(next.request, next.resolve, next.reject, next.token);
			}
		}
		public reset(): APIExtended {
			this._data = {};
			this.removeService("paginate", "next");
			this.removeService("paginate", "previous");
			this._apiData = null;
			return this;
		}
		public addMiddleware(middleware: IMiddleWare | Function): void {
			if (typeof middleware == "function") {
				middleware = { request: <any>middleware };
			}
			APIExtended.middlewares.push(middleware);
		}
		public request(): APIExtended {
			var c: any = super.request();
			c._cacheManager = this._cacheManager;
			return c;
		}
		public clone(): APIExtended {
			var c: any = super.clone();
			c._cacheManager = this._cacheManager;
			return c;
		}

	}
