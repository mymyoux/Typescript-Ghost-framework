//convert
 /* ghost.events.EventDispatcher
*/
import {EventDispatcher} from "ghost/events/EventDispatcher";
///<module="ghost/events"/>

    /**
     * @private
     */
    export class _Accelerometer
    {
        private _accelerometer:any;
        
        constructor()
        {
            this._accelerometer = navigator["accelerometer"];
        }
          /**
         * Get the current acceleration along the x, y, and z axis.<b>Should not work properly on iOS. See phonegap docs but seems to work</b>
         * @param callback callback's function (errors, Acceleration)
         */
        public getCurrentAcceleration(callback:(error:Error, acceleration?:Acceleration)=>void):void
        {
    
            this._accelerometer.getCurrentAcceleration(function(data)
            {
                if(callback)
                {
                    callback(null, new Acceleration(data));
                }
            },function(error)
            {
                if(callback)
                {
                    callback(error);
                }
            });
        }
        /**
         * Specifies if acceleration sensors are available
         */
        public isSupported():boolean
        {
            return this._accelerometer != null;
        }
        /**
         * Get acceleration watcher
         * @param frequency {optional} time between two calls
         * @returns {AccelerometerWatcher}
         */
        public getWatcher(frequency:number):AccelerometerWatcher
        {
            return new AccelerometerWatcher(this._accelerometer, frequency!=undefined?{frequency:frequency}:undefined);
        }

        
    }
    var _instance:_Accelerometer;
    /**
     * Accelerometer singleton
     */
    export function Accelerometer():_Accelerometer
    {
        if(!_instance)
        {
            _instance = new _Accelerometer();
        }
        return _instance;
    }
    
    export interface IAcceleration
    {
        x:number;
        y:number;
        z:number;
        timestamp:number;
    }
    export class Acceleration
    {
        private _x:number;
        private _y:number;
        private _z:number;
        private _timestamp:number;
        constructor(data:IAcceleration)
        {
            this._x = data.x;
            this._y = data.y;
            this._z = data.z;
            this._timestamp = data.timestamp;
        }
        /**
         * Returns x acceleration
         * @returns {number}
         */
        public getX():number
        {
            return this._x;
        }
        /**
         * Returns y acceleration
         * @returns {number}
         */
        public getY():number
        {
            return this._y;
        }
        /**
         * Returns z acceleration
         * @returns {number}
         */
        public getZ():number
        {
            return this._z;
        }
        /**
         * Returns timestamp of the acceleration
         * @returns {number}
         */
        public getTimestamp():number
        {
            return this._timestamp;
        }
        
    }
    export class AccelerometerWatcher extends EventDispatcher
    {
        
        /**
         * Event dispatched when accelerometers send data
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
        private _accelerometer:any;
        private _id:any;
        /**
         * Constructor. <b>Should not be called  directly, only by Accelerometer singleton></b>
         * @param accelerometer phonegap accelerometer instance
         * @param options (frequency:frequency value}
         * @private
         */
        constructor(accelerometer:any, options:{frequency})
        {
            super();
            var _self = this;
            this._accelerometer = accelerometer;
            this._id = accelerometer.watchAcceleration(function(data:IAcceleration):void
            {
                _self._onSuccess(data);
            }, function(error:Error):void
            {
                _self._onError(error);
            }, options);
        }
        /**
         * Called when data is sent by accelerometers
         * @param data Accelerometer data
         * @private
         */
        private _onSuccess (data:IAcceleration):void
        {
            this.trigger(AccelerometerWatcher.DATA, new Acceleration(data));
        }
        /**
         * Called when an error occurs from accelerometers
         * @param error Accelerometer error
         * @private
         */
        private _onError (error:Error):void
        {
            this.trigger(AccelerometerWatcher.ERROR, error);
        }
        /**
         * Disposes the current watcher. Stop watching and remove all listeners.
         */
        public dispose():void
        {
            if(this._id != -1)
            {
                this._accelerometer.clearWatch(this._id);
                this._id = -1;
                this._accelerometer = null;
                this.trigger(AccelerometerWatcher.DISPOSED);
                this.off();
            }
        }

    }
