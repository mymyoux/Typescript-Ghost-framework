///<lib="jquery"/>

///<module="framework/ghost/events"/>
///<module="framework/ghost/io"/>
namespace ghost.browser.io
{
	import CancelablePromise = ghost.io.CancelablePromise;
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
					middlewares.splice(<any>p, 1);
				}
			}
		}
	}
	export var RETRY_INFINITE:number = -1;
	export function ajax(settings:AjaxOptions):CancelablePromise<Object>;
	export function ajax(settings:any):CancelablePromise<Object>;
	export function ajax(url:string, settings?:AjaxOptions):CancelablePromise<Object>;
	export function ajax(url:string, settings?:any):CancelablePromise<Object>;
	export function ajax(request: any, settings?: AjaxOptions): CancelablePromise<Object>;
	export function ajax(request: any, settings?: any): CancelablePromise<Object>;
	export function ajax(url: any, settings?: AjaxOptions & { count_failed?:number}): CancelablePromise<Object>
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
			if(settings == undefined)
			{
				settings = url;
			} else if (url)
			{
				settings = ghost.utils.Objects.merge(url, settings);
			}
		}
		var $ajax:any;
		var promise:CancelablePromise<Object> = new CancelablePromise<Object>(function(resolve, reject):void
		{
			settings = middleware(settings, "settings");
			$ajax = $.ajax(settings);

			$ajax.done(function(data, textStatus, jqXHR)
			{
				if(promise && promise.canceled)
				{
					return;
				}
				if(promise)
					promise.setAjax(null);

				data = middleware(data, "success_always");
				if(data && (data.success === false || data.error || data.exception))
				{
					if(settings.retry === true && data.fatal === false && (!data.exception || data.exception.fatal === false))
					{
						setTimeout(function()
						{
							ajax(settings).then(resolve, reject);
						}, 500);
						return;
					}
					data = middleware(data, "error");
					if (settings.asObject)
					{
						reject({ errorThrown: data.exception?data.exception:(data.api_error?data.api_error:(data.error?data.error:data)), textStatus: textStatus, jqXHR: jqXHR, data:data });
					}else
					{
						reject(data.exception?data.exception:(data.api_error?data.api_error:(data.error?data.error:data)));
					}
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
				if(settings.retry && textStatus != "abort")
				{
					if(settings.retry !== RETRY_INFINITE && settings.retry!==true)
					{
						settings.retry = <any> settings.retry - 1;
					}
					if (settings.count_failed == undefined)
					{
						settings.count_failed = 1;
					}else
					{
						settings.count_failed++;
					}
					if (navigator.onLine === false)
					{
						//wait
						ghost.events.Eventer.once(ghost.events.Eventer.NETWORK_ONLINE, ()=>
						{
							debugger;
							ajax(settings).then(resolve, reject);
						});
					}else
					{
						var time = 500 * Math.min(10, settings.count_failed);
						if(time<0)
						{
							time = 500;
						}
						setTimeout(function()
						{
							ajax(settings).then(resolve, reject);
						}, time);
					}
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
		 * retry: ghost.browser.io.RETRY_INFINITE It will always retry on network errors
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
