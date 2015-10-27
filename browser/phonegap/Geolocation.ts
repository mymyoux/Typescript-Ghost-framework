namespace ghost.phonegap
{
    export interface IDataPosition
    {
        coords:ICoordinates;
        timestamp:number;
    }
    export interface ICoordinates
    {
        latitude:number;
        longitude:number;
        altitude:number;
        accuracy:number;
        altitudeAccuracy:number;
        heading:number;
        speed:number;
    }
    export interface IWatcherOptions
    {
        enableHighAccuracy:boolean;
        maximumAge?:number;
        timeout?:number;
        frequency?:number;
    }
    /**
     * Position Object
     * @type {Position}
     */
    export class Position
    {
        private _coords:ICoordinates;
        private _timestamp:number;
        /**
         * Constructor
         * @param data Geolocation data
         * @private
         */
        constructor(data:IDataPosition)
        {
            this._coords = data.coords;
            this._timestamp = data.timestamp;
        }
        /**
         * Returns latitude
         * @returns {number}
         */
        public getLatitude():number
        {
            return this._coords.latitude;
        }
        /**
         * Returns longitude
         * @returns {number}
         */
        public getLongitude():number
        {
            return this._coords.longitude;
        }
        /**
         * Returns altitude
         * @returns {number}
         */
        public getAltitude():number
        {
            return this._coords.altitude;
        }
        /**
         * Returns accuracy
         * @returns {number}
         */
        public getAccuracy():number
        {
            return this._coords.accuracy;
        }
        /**
         * Returns altitudeAccuracy
         * @returns {number}
         */
        public getAltitudeAccuracy():number
        {
            return this._coords.altitudeAccuracy;
        }
        /**
         * Returns heading
         * @returns {number}
         */
        public getHeading():number
        {
            return this._coords.heading;
        }
        /**
         * Returns speed
         * @returns {number}
         */
        public getSpeed():number
        {
            return this._coords.speed;
        }
        /**
         * Returns timestamp of the position
         * @returns {number}
         */
        public getTimestamp():number
        {
            return this._timestamp;
        }
    }
    /**
     * Position Watcher
     * @type {GeolocationWatcher}
     */
    export class GeolocationWatcher extends ghost.events.EventDispatcher
    {
        /**
         * Event dispatched when the gps send data
         * @type {string}
         */
        public static DATA:string = "data";
        /**
         * Event dispatched when an error occurs
         * @type {string}
         */
        public static ERROR:string = "error";
        /**
         * Event dispatched when the watcher is disposed
         * @type {string}
         */
        public static DISPOSED:string = "dispose";
        /**
         * @private
         */
        private _geolocation:any;
        /**
         * @private
         */
        private _id:number;
        /**
         * Constructor. <b>Should not be called  directly, only by Geolocation singleton></b>
         * @param geolocation phonegap geolocation instance
         * @param options (frequency:frequency value}
         * @private
         */
        constructor(geolocation:any, options:{frequency?:number})
        {
            super();
            var _this = this;
            this._geolocation = geolocation;
            this._id = geolocation.watchPosition(function(data)
            {
                _this._onSuccess(data);
            }, function(error)
            {
                _this._onError(error);
            }, options);
        }
        /**
         * Called when data is sent by the gps
         * @param data Geolocation data
         * @private
         */
        private _onSuccess(data:IDataPosition):void
        {
            this.trigger(GeolocationWatcher.DATA, new Position(data));
        }
        /**
         * Called when an error occurs from the gps
         * @param error Geolocation error
         * @private
         */
        private _onError(error:Error)
        {
            this.trigger(GeolocationWatcher.ERROR, error);
        }
        /**
         * Disposes the current watcher. Stop watching and remove all listeners.
         */
        public dispose()
        {
            if(this._id != -1)
            {
                this._geolocation.clearWatch(this._id);
                this._id = -1;
                this._geolocation = null;
                this.trigger(GeolocationWatcher.DISPOSED);
                this.off();
            }
        }

    } 
    /**
     * @private
     */
    export class _Geolocation
    {
        /**
         * @private
         */
        private _geolocation:any;
        /**
         * Constructor
         */
        constructor()
        {
            this._geolocation = ROOT.navigator["geolocation"];
        }
        /**
         * Returns the device's current position as a Position object.
         * @param callback callback's function (errors, Position)
         */
        public getCurrentPosition(callback:(error:Error,position?:Position)=>void):void
        {
    
            this._geolocation.getCurrentPosition(function(data:IDataPosition)
            {
                if(callback)
                {
                    callback(null, new Position(data));
                }
            },function(error:Error)
            {
                if(callback)
                {
                    callback(error);
                }
            });
        }
        /**
         * Get position watcher
         * @param timeout {optional} The maximum length of time (milliseconds) that is allowed
         * @param maximumAge {optional} Accept a cached position whose age is no greater than the specified time in milliseconds.
         * @returns {GeolocationWatcher}
         */
        public getWatcher(timeout?:number, maximumAge?:number):GeolocationWatcher
        {
            var options:IWatcherOptions =
            {
                enableHighAccuracy:true
            };
            if(timeout!=undefined)
            {
                options.timeout = timeout;
            }
            if(maximumAge!=undefined)
            {
                options.maximumAge = maximumAge;
            }
            return new GeolocationWatcher(this._geolocation, options);
        }
    }
    /**
     * Geolocation manager
     * @type _Geolocation
     */
    export var Geolocation:_Geolocation = ghost.core.Hardware.isBrowser()?new _Geolocation():null;
    
}