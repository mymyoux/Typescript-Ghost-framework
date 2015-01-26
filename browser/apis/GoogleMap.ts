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
		private _geocoder:google.maps.Geocoder;
		/**
		 * Specifies if the google maps API is enabled
		 * @return {boolean}
		 */
		public static isEnabled():boolean
		{
			return window["google"] && window["google"].maps && window["google"].maps.Geocoder;
		}
		/**
		 * Gets geocoder instance
		 * @return {google.maps.Geocoder} Geocoder instance
		 */
		public geocoder():google.maps.Geocoder
		{
			if(!this._geocoder)
			{
				this._geocoder = new google.maps.Geocoder();
			}
			return this._geocoder;
		}
		/**
		 * Geocodes an address to lattitude and longitude
		 * @param  {string}                      address    Address
		 * @param  {boolean}                     simplified if false, will send the complete google response
		 * @return {Promise<google.maps.LatLng>}            [description]
		 */
		public geocode(address:string, simplified?:boolean):Promise<google.maps.LatLng>
		/**
		 * Geocodes an address to lattitude and longitude
		 * @param  {google.maps.GeocoderRequest}                      address    Options
		 * @param  {boolean}                     simplified if false, will send the complete google response
		 * @return {Promise<google.maps.LatLng>}            [description]
		 */
		public geocode(params:google.maps.GeocoderRequest, simplified?:boolean):Promise<google.maps.LatLng>
		public geocode(params:any, simplified:boolean = true):Promise<google.maps.LatLng>
		{
			if(typeof params == "string")
			{
				params = {address:params};
			}
			var promise:Promise<google.maps.LatLng> = new Promise((resolve, reject)=>
			{
				this.geocoder().geocode(params, function(results, status)
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