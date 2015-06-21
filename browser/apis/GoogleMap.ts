///<lib="googlemaps"/>
///<lib="es6-promise"/>
module ghost.browser.apis
{
	/**
	 * Google Map API wrapper
	 */
	export class GMap
	{
		/**
		 * Geocoder instance
		 * @type {google.maps.Geocoder}
		 */
		private static _geocoder:google.maps.Geocoder;
		/**
		 * Specifies if the google maps API is enabled
		 * @return {boolean}
		 */
		public static isEnabled():boolean
		{
			return window["google"] && window["google"].maps && window["google"].maps.Geocoder;
		}
		private static init():Promise<any>
		{
			var promise:Promise<any> = new Promise((resolve, reject)=>
			{
				if(GMap.isEnabled())
				{
					resolve();
					return;
				}
				__initialize__gmap["resolve"] = resolve;
				var script = document.createElement('script');
				script.type = 'text/javascript';
				script.src =  'https://maps.googleapis.com/maps/api/js?v=3.exp&' + 'libraries=places'+'&callback=__initialize__gmap';
				document.body.appendChild(script);
			});
			return promise;
		}
		/**
		 * Gets geocoder instance
		 * @return {google.maps.Geocoder} Geocoder instance
		 */
		public static geocoder():google.maps.Geocoder
		{
			if(!GMap._geocoder)
			{
				GMap._geocoder = new google.maps.Geocoder();
			}
			return GMap._geocoder;
		}
		public static autocomplete(data:any):Promise<any>
		{
			if(typeof data == "string")
			{
				data = {
					input:data
				};
			}

			var promise:Promise<any> = new Promise((resolve, reject):void=>
			{
				if(!GMap.isEnabled())
				{
					GMap.init().then(()=>
					{
						this.autocomplete(data).then(resolve, reject);
					});
					return;
				}
				var service:any = new google.maps.places["AutocompleteService"]();
				service.getPlacePredictions(data,
					function(result, status){
						if(status === google.maps.GeocoderStatus.OK)
						{
							resolve(result);
						}else
						{
							reject(result);
						}
					});
			});
			return promise;
		}
		/**
		 * Geocodes an address to lattitude and longitude
		 * @param  {string}                      address    Address
		 * @param  {boolean}                     simplified if false, will send the complete google response
		 * @return {Promise<google.maps.LatLng>}            [description]
		 */
		public static geocode(address:string, simplified?:boolean):Promise<google.maps.LatLng|any[]>;
		/**
		 * Geocodes an address to lattitude and longitude
		 * @param  {google.maps.GeocoderRequest}                      address    Options
		 * @param  {boolean}                     simplified if false, will send the complete google response
		 * @return {Promise<google.maps.LatLng>}            [description]
		 */
		public  static geocode(params:google.maps.GeocoderRequest, simplified?:boolean):Promise<google.maps.LatLng|any[]>;
		public  static geocode(params:any, simplified:boolean = true):Promise<google.maps.LatLng|any[]>
		{
			if(typeof params == "string")
			{
				params = {address:params};
			}
			var promise:Promise<google.maps.LatLng> = new Promise((resolve, reject)=>
			{
				if(!GMap.isEnabled())
				{
					GMap.init().then(()=>
					{
						this.geocode(params, simplified).then(resolve, reject);
					});
					return;
				}
				GMap.geocoder().geocode(params, function(results, status)
				{
					if (status == google.maps.GeocoderStatus.OK) 
					{
						if(simplified)
						{
							resolve(results[0].geometry.location);
						}else
						{
							resolve(results);
						}
					}else
					{
						reject({error:results, status:status});
					}
				});
			});
			return promise;
		}
	}
}

function __initialize__gmap()
{
	__initialize__gmap["resolve"]();
}