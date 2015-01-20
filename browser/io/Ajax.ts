///<lib="jquery"/>
///<lib="es6-promise"/>
module ghost.io
{
	export var RETRY_INFINITE:number = -1;
	export function ajax(settings:AjaxOptions):Promise<Object>;
	export function ajax(url:string, settings?:AjaxOptions):Promise<Object>;
	export function ajax(url:any, settings?:AjaxOptions):Promise<Object>
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
		var promise:Promise<Object> = new Promise<Object>(function(resolve, reject):void
		{
			$.ajax(settings)
			.done(function(data, textStatus, jqXHR)
			{
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
		return promise;
	}


	export interface AjaxOptions extends JQueryAjaxSettings
	{
		retry?:number;
		asObject?:boolean;
	}

}
