///<lib="jquery"/>
///<lib="es6-promise"/>
module ghost.io
{
	export var RETRY_INFINITE:number = -1;
	export function ajax(settings:AjaxOptions):Promise<Object>;
	export function ajax(url:string, settings?:AjaxOptions):Promise<Object>;
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
					if(settings.retry != RETRY_INFINITE)
					{
						settings.retry--;
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
		retry?:number;
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
