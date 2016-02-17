///<lib="jquery"/>
///<lib="es6-promise"/>
namespace ghost.io
{
	var middlewares:any[] = [];
	function middleware(data:any, type:string):any
	{
		if(!data)
		{
			return data;
		}
		var useKeyword:boolean = type == "success" || type == "success_always";
		var result:any;
		try{

			for(var p in middlewares)
			{
				if(middlewares[p][type] && (!middlewares[p].keyword || !useKeyword || data[middlewares[p].keyword]))
				{
					if(middlewares[p].onlyJSON !== false && typeof data != "object")
					{
						continue;
					}
					if(middlewares[p].keyword && useKeyword)
					{
						result = middlewares[p][type](data[middlewares[p].keyword]);
						if(result !== undefined)
						{
							if(result === null)
							{
								//if null remove the property
								delete data[middlewares[p].keyword];
							}else
							{
								data[middlewares[p].keyword] = result;
							}
						}
					}else
					{
						result = middlewares[p][type](data);
						if(result !== undefined)
						{
							data = result;
						}
					}
				}
			}
		}catch(error)
		{
			console.error("Error during middleware", error);
			debugger;
		}
		return data;
	}
	export function addMiddleware(middleware:IMiddleWare|Function):void
	{
		if(typeof middleware == "function")
		{
			middleware = {success:<any>middleware};
		}
		middlewares.push(middleware);
	}
	export function removeMiddleware(middleware:IMiddleWare):void
	{

		for(var p in middlewares)
		{
			if((<IMiddleWare>middleware).id)
			{
				if(middlewares[p].id == (<IMiddleWare>middleware).id)
				{
					middlewares.splice(p, 1);
				}
			}
		}
	}
	export var RETRY_INFINITE:number = -1;
	export function ajax(settings:AjaxOptions):CancelablePromise<Object>;
	export function ajax(settings:any):CancelablePromise<Object>;
	export function ajax(url:string, settings?:AjaxOptions):CancelablePromise<Object>;
	export function ajax(url:string, settings?:any):CancelablePromise<Object>;
	export function ajax(url:any, settings?:AjaxOptions):CancelablePromise<Object>
	{
		if(typeof url == "string")
		{
			if(!settings)
			{
				settings = {};
			}
			settings.url = url;
		}else
		{
			settings = url;
		}
		var $ajax:any;
		var promise:CancelablePromise<Object> = new CancelablePromise<Object>(function(resolve, reject):void
		{
			settings = middleware(settings, "settings");
			$ajax = $.ajax(settings)
			.done(function(data, textStatus, jqXHR)
			{
				if(promise && promise.canceled)
				{
					return;
				}
				if(promise)
					promise.setAjax(null);

				data = middleware(data, "success_always");
				if(data && (data.success === false || data.error))
				{
					if(settings.retry === true)
					{
						setTimeout(function()
						{
							ajax(settings).then(resolve, reject);
						}, 500);
						return;
					}
					data = middleware(data, "error");
					reject(data.error?data.error:data);
					return;
				}

				data = middleware(data, "success");
				if(settings.asObject)
				{
					resolve({data:data, textStatus:textStatus, jqXHR: jqXHR});
				}else
				{
					resolve(data);
				}
			})
			.fail(( jqXHR, textStatus, errorThrown )=>
			{
				if(promise && promise.canceled)
				{
					return;
				}
				if(settings.retry)
				{
					if(settings.retry !== RETRY_INFINITE && settings.retry!==true)
					{
						settings.retry = <any> settings.retry - 1;
					}
					setTimeout(function()
					{
						ajax(settings).then(resolve, reject);
					}, 500);
				}else
				{
					if(promise)
						promise.setAjax(null);
					middleware(errorThrown, "error");
					if(settings.asObject)
					{
						reject({errorThrown:errorThrown, textStatus:textStatus, jqXHR: jqXHR});
					}else
					{
						reject(errorThrown);
					}
				}
			});
		});
		promise.setAjax($ajax);
		return promise;
	}


	export interface AjaxOptions extends JQueryAjaxSettings
	{
		/**
		 * Specifies how error will be handled
		 * retry:number if the value is numeric, it will be the number of times
		 * a retry will be done on network error. If the data is set with .success == false
		 * the reject method will be called.
		 * retry: ghost.io.RETRY_INFINITE It will always retry on network errors
		 * retry: true It will always retry even if there is no network error but data set with success == false
		 */
		retry?:number|boolean;
		/**
		 * If set to true, result data will be encapsulated on an formatted object:
		 * {data:data, textStatus:textStatus, jqXHR: jqXHR}
		 * If set to false, result data will be return without modification
		 */
		asObject?:boolean;
	}
	export class CancelablePromise<T>// extends Promise<T>
	{
		protected promise: Promise<T>;
		public constructor(method:any)
		{
			var promise:any = new Promise(method);
			CancelablePromise.extends(promise);

			return promise; 
		} 
		public static extends(promise:any):void
		{
			promise.canceled = false;
			promise.cancel = CancelablePromise.prototype.cancel.bind(promise);
			promise.then = CancelablePromise.prototype.then.bind(promise);
			promise.setAjax = CancelablePromise.prototype.setAjax.bind(promise);
		}
		public canceled:boolean = false;
		private $ajax:any;
		public cancel():void
		{
			if(this.$ajax)
			{
				this.$ajax.abort();
				this.setAjax(null);
			}

			this.canceled = true;
		}
		public setAjax($ajax:any):void
		{
			this.$ajax = $ajax;
		}
		public then(resolve?: Function, reject?: Function):CancelablePromise<T>
		{
			var promise:any = Promise.prototype.then.call(this, resolve, reject);
			CancelablePromise.extends(promise);
			return promise;
		}
		public catch: (callback: Function) => CancelablePromise<T>;
		public done: () => CancelablePromise<T>;
		public fail: (callback: Function) => CancelablePromise<T>;
		public always: (callback: Function) => CancelablePromise<T>;
	}
	
	export interface IMiddleWare
	{
		/**
		 * If set it will only be called if the variable exists in data
		 */
		keyword?:string;
		/**
		 * Callback called before the ajax call is done. settings will be given. keyword is ignored for this callback
		 * @param data
		 */
		settings?:(data:any)=>any|void;
		/**
		 * Calback called with result data. If keyword is set, only this part of the data will be given.
		 * @param data
		 */
		success?:(data:any)=>any|void;
		/**
		 * If set it will be used to remove the middleware from the list
		 */
		id?:string;
		/**
		 * Default to true
		 */
		onlyJSON?:boolean;
		success_always?:Function;
	}
}
