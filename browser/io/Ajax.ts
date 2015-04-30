///<lib="jquery"/>
///<lib="es6-promise"/>
module ghost.io
{
	export var RETRY_INFINITE:number = -1;
	export function ajax(settings:AjaxOptions):CancelablePromise<Object>;
	export function ajax(url:string, settings?:AjaxOptions):CancelablePromise<Object>;
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
			$ajax = $.ajax(settings)
			.done(function(data, textStatus, jqXHR)
			{
				if(promise.canceled)
				{
					return;
				}
				promise.setAjax(null);

				if(data && data.success === false)
				{
					if(settings.retry === true)
					{
						setTimeout(function()
						{
							ajax(settings).then(resolve, reject);
						}, 500);
						return;
					}
					reject(data.error?data.error:data);
					return;
				}

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
				if(promise.canceled)
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
					promise.setAjax(null);
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
	export class CancelablePromise<T> extends Promise<T>
	{
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
	}

}
