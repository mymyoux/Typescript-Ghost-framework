///<lib="Promise"/>

namespace ghost.promises
{
	export class _Promise
	{
		public static series(promises:any[]):Promise<any>
		{
			var sequence:Promise<any> = Promise.resolve();
			if(!promises || promises.length == 0)
			{
				return sequence;
			}
			promises.forEach(function(promise:any, index:number):void
			{
				sequence = sequence.then(function()
				{
					if(promise instanceof Function)
					{
						promise = promise();
					}

					if(!promise || (!(promise instanceof Promise) && !(promise.then instanceof Function)))
					{
						if(!promise)
						{
							console.error(promise);
							debugger;
						}
						promise = promise?Promise.resolve():Promise.reject(new Error(promise));
					}
					return promise;
				});

			});
			return sequence;
		}
	}
	(<any>Promise).series = _Promise.series;
}
