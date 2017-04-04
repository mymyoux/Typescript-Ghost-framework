//convert
 /* ghost.events.Eventer.*/
import {Eventer} from "ghost/events/Eventer";
//convert
 /* ghost.events.EventDispatcher
*/
import {EventDispatcher} from "ghost/events/EventDispatcher";
//convert
 /*!ghost.core.Root.*/
import {Root} from "ghost/core/Root";


    var _Connection:any;
    if(!Root.getRoot().Connection)
    {
        _Connection = 
        {
            UNKNOWN:"unknown",
            ETHERNET:"ethernet",
            WIFI:"wifi",
            CELL_2G:"cell_2g",
            CELL_3G:"cell_3g",
            CELL_4G:"cell_4g",
            CELL:"cell",
            NONE:"none"
        };
    }else
    {
        _Connection = Root.getRoot().Connection;
    }
    export class _ConnexionStatus extends EventDispatcher
    {
        /**
         * Event dispatched when the connection's status has changed
         * @type {string}
         */
        public static CHANGE:string = "change";
        public static UNKNOWN:string = _Connection.UNKOWN;
        public static ETHERNET:string = _Connection.ETHERNET;
        public static WIFI:string = _Connection.WIFI;
        public static CELL_2G:string = _Connection.CELL_2G;
        public static CELL_3G:string = _Connection.CELL_3G;
        public static CELL_4G:string = _Connection.CELL_4G;
        public static CELL:string = _Connection.CELL;
        public static NONE:string = _Connection.NONE;
        /**
         * Event dispatched when the connection's status has changed
         * @type {string}
         */
        public CHANGE:string = _ConnexionStatus.CHANGE;
        public UNKNOWN:string = _ConnexionStatus.UNKNOWN;
        public ETHERNET:string = _ConnexionStatus.ETHERNET;
        public WIFI:string = _ConnexionStatus.WIFI;
        public CELL_2G:string = _ConnexionStatus.CELL_2G;
        public CELL_3G:string = _ConnexionStatus.CELL_3G;
        public CELL_4G:string = _ConnexionStatus.CELL_4G;
        public CELL:string = _ConnexionStatus.CELL;
        public NONE:string = _ConnexionStatus.NONE;
        /**
         * @private
         */
        private _interval:number;
        /**
         * @private
         */
        private _connection:any;
        /**
         * @private
         */
        private _lastState:string;
        /**
         * @private
         */
        private _delay:number;
        /**
         * Constructor
         */
        constructor()
        {
            super();
            var _self = this;
            this._interval = -1;
            this._connection = navigator["connection"];
            this._lastState = this.getType();
            Eventer.on(Eventer.NETWORK_ONLINE, function()
            {
                _self._onStatus(true);
            }, this);
            Eventer.on(Eventer.NETWORK_OFFLINE, function()
            {
                _self._onStatus(false);
            }, this);
    
        }
        /**
         * setDelay and checkStatus not used anymore
         * @param delay
         */
        public setDelay(delay:number):void
        {
            var _self = this;
            this._delay = delay;
            if(this._interval!=-1)
            {
                clearInterval(<any>this._interval);
                this._interval = -1;
            }
            this._interval = <any>setInterval(function()
            {
                _self._checkStatus();
            },this._delay);
        }
        private _checkStatus()
        {
            console.log("check status");
        }
        /**
         * Called when the connection status has changed
         * @param connected connection's status
         * @private
         */
        private _onStatus(connected:boolean):void
        {
            var status:string = this.getType();
            if(status != this._lastState)
            {
                this.trigger(this.CHANGE, status, this._lastState);
                this._lastState = status
            }
        }
        /**
         * Current connection's type
         * @returns {string}
         */
        public getType():string
        {
            return this._connection.type;
        }
    }
    var _connexionStatus:_ConnexionStatus;
    export function ConnexionStatus():_ConnexionStatus
    {
        if(!_connexionStatus)
        {
            _connexionStatus = new _ConnexionStatus();
        }
        return _connexionStatus;
    }
