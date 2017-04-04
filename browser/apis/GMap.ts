///<lib="googlemaps"/>
///<lib="Promise"/>
///<module="framework/ghost/data"/>
namespace ghost.browser.apis
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
		public static init(key:string = null):Promise<any>
		{
			if (!key && ghost.data.Configuration.has("gmap_api_key"))
			{
				key = ghost.data.Configuration.get("gmap_api_key");
			}
			var promise:Promise<any> = new Promise((resolve, reject)=>
			{
				if(GMap.isEnabled())
				{
					resolve();
					return;
				}
				window["__initialize__gmap"]  = function()
				{
					window["__initialize__gmap"]["resolve"]();
				};
				window["__initialize__gmap"]["resolve"] = resolve;
				var script = document.createElement('script');
				script.type = 'text/javascript';
				script.src =  'https://maps.googleapis.com/maps/api/js?'+(key?'key='+key+'&':'')+'v=3.exp&' + 'libraries=places'+'&callback=__initialize__gmap&language=en';
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
		/**
		 * Autocomplete google maps places
		 * @param data
		 * @returns {Promise<any>}
		 * @see https://developers.google.com/maps/documentation/javascript/places-autocomplete
		 */
		public static getDetails(data:any):Promise<any>
		{
			if(typeof data == "string")
			{
				data = {
					placeId:data
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
				var obj= $(".gmap").length?$(".gmap"):$('<div class="g_map hidden">').appendTo('body');
				var service:any = new google.maps.places["PlacesService"](obj.get(0));
				service.getDetails(data,
					function(result, status){
						if(status === google.maps.places.PlacesServiceStatus.OK)
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
		public static textSearch(data:any):Promise<any>
		{
			if(typeof data == "string")
			{
				data = {
					query:data
				};
			}

			var promise:Promise<any> = new Promise((resolve, reject):void=>
			{
				if(!GMap.isEnabled())
				{
					GMap.init().then(()=>
					{
						this.textSearch(data).then(resolve, reject);
					});
					return;
				}
				var obj= $(".gmap").length?$(".gmap"):$('<div class="g_map hidden">').appendTo('body');
				var service:any = new google.maps.places["PlacesService"](obj.get(0));
				service.textSearch(data,
					function(result, status){
						if(status === google.maps.places.PlacesServiceStatus.OK)
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
		public static nearbySearch(data:any):Promise<any>
		{
			if(typeof data == "string")
			{
				data = {
					name:data
				};
			}

			var promise:Promise<any> = new Promise((resolve, reject):void=>
			{
				if(!GMap.isEnabled())
				{
					GMap.init().then(()=>
					{
						this.nearbySearch(data).then(resolve, reject);
					});
					return;
				}
				var obj= $(".gmap").length?$(".gmap"):$('<div class="g_map hidden">').appendTo('body');
				var service:any = new google.maps.places["PlacesService"](obj.get(0));
				service.nearbySearch(data,
					function(result, status){
						if(status === google.maps.places.PlacesServiceStatus.OK)
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
		 * Autocomplete google maps places
		 * @param data
		 * @returns {Promise<any>}
		 * @see https://developers.google.com/maps/documentation/javascript/places-autocomplete
		 */
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
	//end:namespace
}

function __initialize__gmap()
{
	__initialize__gmap["resolve"]();
}
