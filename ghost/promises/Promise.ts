///<lib="es6-promise"/>

module ghost.promises
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
				console.log("promise", index);
				sequence = sequence.then(function()
				{
					console.log("promise done", index);
					if(promise instanceof Function)
					{
						promise = promise();
					}
					if(!(promise instanceof Promise))
					{
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
