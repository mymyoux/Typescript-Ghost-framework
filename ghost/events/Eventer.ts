///<file="EventDispatcher"/>
///<module="core"/>
///<module="utils"/>
module ghost.events
{
    
    /**
     * Events manager
     * @type _Events
     * @private
     */
    export class _Eventer extends ghost.events.EventDispatcher
    {
         /**
         * This event is fired when screen orientation changed or screen resize
         * @type {string}
         */
        public SCREEN_ORIENTATION_CHANGE = "orientationchange";
        /**
         * This event is fired when screen orientation changed or screen resize
         * @type {string}
         */
        public SCREEN_RESIZE = "orientationchange";
        /**
         * This is an event that fires when Cordova is fully loaded.
         * @type {string}
         */
        public DEVICE_READY = "deviceready";
        /**
         * This is an event that fires when a Cordova application is put into the background.
         * @type {string}
         */
        public APPLICATION_PAUSE = "pause";
        /**
         * This is an event that fires when a Cordova application is ready and Dom Loaded.
         * @type {string}
         */
        public APPLICATION_READY = "application_ready";
        /**
         * This is an event that fires when a Cordova application is ready, JQuery-like is ready and Dom Loaded.
         * @type {string}
         */
        public $APPLICATION_READY = "$application_ready";
        /**
         * This is an event that is fired when a JQuery-like library is ready
         */
        public $JQUERY_LIKE_READY = "$jquery-like";
        /**
         * This is an event that fires when a Cordova application is retrieved from the background.
         * @type {string}
         */
        public APPLICATION_RESUME = "resume";
        /**
         * This is an event that fires when a Cordova application is online (connected to the Internet).
         * @type {string}
         */
        public NETWORK_ONLINE = "online";
        /**
         * This is an event that fires when a Cordova application is offline (not connected to the Internet).
         * @type {string}
         */
        public NETWORK_OFFLINE = "offline";
        /**
         * This is an event that fires when the user presses the back button.
         * @type {string}
         */
        public KEYBOARD_BACK_BUTTON = "backbutton";
        /**
         * This is an event that fires when the user presses the menu button.
         * @type {string}
         */
        public KEYBOARD_MENU_BUTTON = "menubutton";
        /**
         * This is an event that fires when the user presses the search button on Android.
         * @type {string}
         */
        public KEYBOARD_SEARCH_BUTTON = "searchbutton";
        /**
         * This is an event that fires when the user presses the start call button.
         * @type {string}
         */
        public KEYBOARD_START_CALL_BUTTON = "startcallbutton";
        /**
         * This is an event that fires when the user presses the end call button.
         * @type {string}
         */
        public KEYBOARD_STOP_CALL_BUTTON = "endcallbutton";
        /**
         * This is an event that fires when the user presses the volume down button.
         * @type {string}
         */
        public KEYBOARD_VOLUME_DOWN_BUTTON = "volumedownbutton";
        /**
         * This is an event that fires when the user presses the volume up button.
         * @type {string}
         */
        public KEYBOARD_VOLUME_UP_BUTTON = "volumeupbutton";
        /**
         * This is an event that fires when a Cordova application detects the battery has reached the critical level threshold.
         * @type {string}
         */
        public BATTERY_CRITICAL = "batterycritical";
        /**
         * This is an event that fires when a Cordova application detects the battery has reached the low level threshold.
         * @type {string}
         */
        public BATTERY_LOW = "batterylow";
        /**
         * This is an event that fires when a Cordova application detects a change in the battery status.
         * @type {string}
         */
        public BATTERY_STATUS = "batterystatus";
        /**
         * This is an event that fires when the hash has changed.
         * @type {string}
         */
        public HASH_CHANGE = "hashchange";
        /**
         * This is the event fired when the dom is loaded.
         * @type {string}
         */
        public DOM_LOADED = "load";
         /**
         * This is the event fired when the dom is loaded and ready.
         * @type {string}
         */
        public DOM_READY = "dom_ready";
    
        /**
         * This event is fired when the page is changed by the navigation manager.
         * @type {string}
         */
        public PAGE_CHANGED = "page_changed";
        /**
         * List all events to listen. (linked to document)
         * @type {Array}
         * @private
         */
        private _list:string[] = 
        [
            this.DEVICE_READY,
            this.APPLICATION_PAUSE,
            this.APPLICATION_RESUME,
            this.NETWORK_ONLINE,
            this.NETWORK_OFFLINE,
            this.KEYBOARD_BACK_BUTTON,
            this.KEYBOARD_MENU_BUTTON,
            this.KEYBOARD_SEARCH_BUTTON,
            this.KEYBOARD_START_CALL_BUTTON,
            this.KEYBOARD_STOP_CALL_BUTTON,
            this.KEYBOARD_VOLUME_DOWN_BUTTON,
            this.KEYBOARD_VOLUME_UP_BUTTON,
            this.BATTERY_CRITICAL,
            this.BATTERY_LOW,
            this.BATTERY_STATUS,
            this.SCREEN_ORIENTATION_CHANGE
        ];
        /**
         * List all events to listen. (linked to window)
         * @type {Array}
         * @private
         */
        private _listWindow:string[] =
        [
            this.DOM_LOADED,
            this.HASH_CHANGE
        ];
            
        private _deviceReady:boolean = false;
        private _domReady:boolean = false;
        private _$Ready:boolean = false;
        private _allReady:boolean = false;
        private _$allReady:boolean = false;
        
        constructor()
        {
            super();
            if(!ROOT.document)
                return;
            var _this = this;
            var len = this._list.length;
            
            for(var i=0; i<len; i++)
            {
                this._addListener(this._list[i], ROOT.document);
            }
            len = this._listWindow.length;
            for(i=0; i<len; i++)
            {
                this._addListener(this._listWindow[i], ROOT);
            }
            ROOT.document.addEventListener(this.DEVICE_READY, function(event)
            {
                _this._triggerDeviceReady(event);
               
            }, false);
            ROOT.addEventListener(this.DOM_LOADED, function(event)
            {
                ROOT["loaded"] = true;
            }, false);
            this._checkDomReady(function(event)
            {
                if(!_this._domReady )
                {
                        
                    _this._domReady = true;
                    ROOT["loaded"] = true;
                    _this.trigger(_this.DOM_READY, event);
                    _this._dispatchAllReady();
                    
                }
            });
            if(ROOT.$)
            {
                ROOT.$(function() {
                    _this._$Ready = true;
                    _this.trigger(_this.$JQUERY_LIKE_READY);
                    _this._dispatchAllReady();
                });
            }
          
            //some devices don't dispatch orientationchanged event
            ROOT.addEventListener("resize", function(event) {
                _this.trigger(_this.SCREEN_ORIENTATION_CHANGE, event);
            }, false);



            //simulate cordova for non phonegap projet
            if(ghost.core.Hardware.isBrowser())
            {
                if(!ROOT.cordova)
                {
                   // console.log("False Cordova is Ready");
                    this._triggerDeviceReady();
                    ghost.constants.cordovaEmulated = true;
                }
                else
                {
                    //emulator
                    if(ROOT.location.href.indexOf("file://")==-1 || ROOT.location.href.indexOf("ripple")>-1 || ROOT.location.href.indexOf("local")>-1)
                    {
                        ghost.constants.cordovaEmulated = true;
                  //      console.log("Cordova['emulated'] is Ready");

                        if(ROOT.location.href.indexOf("ripple")==-1)
                        {
                            this._triggerDeviceReady();
                        }
                    }
                }
            }

        }
        /**
         * Should not be called by user
         */
        public _triggerDeviceReady(event?:Event):void
        {
            if(!event)
            {
               // console.log("DEVICE READY EMULATED");
            }
            if(!this._deviceReady)
            {
                this._deviceReady = true;
                if(!event)
                    this.trigger(this.DEVICE_READY);
                
                this._dispatchAllReady();
                
            }
            
        }
        
        private _checkDomReady(callback:any):void
        {
            /* Mozilla, Chrome, Opera */
            if (ROOT.document.addEventListener) {
                ROOT.document.addEventListener("DOMContentLoaded", callback, false);
                return;
            }
            /* Safari, iCab, Konqueror */
            if (/KHTML|WebKit|iCab/i.test(ROOT.navigator.userAgent)) {
                var DOMLoadTimer = setInterval(function () {
                    if (/loaded|complete/i.test(ROOT.document.readyState)) {
                        callback();
                        clearInterval(DOMLoadTimer);
                    }
                }, 10);
                return;
            }
            /* Other web browsers */
            window.onload = callback;
        }
        private _dispatchAllReady():void
        {

            if(!this._allReady && this._domReady && this._deviceReady)
            {
                this._allReady = true;
                this.trigger(this.APPLICATION_READY);
                if(!this._$allReady && this._$Ready)
                {
                    this._$allReady = true;
                    this.trigger(this.$APPLICATION_READY);
                    
                }
            }
                
        }
        /**
         * Adds a listener for an event
         * @param name Event's name
         * @private
         */
        private _addListener(name, object)
        {
            var _this = this;
            object.addEventListener(name, function(event)
            {
                //console.log(name, object, event);
                _this.trigger(name, event);
            }, false);
        }
        private _on(name:string, listener:Function, thisObject:any):void
        {
            return super.on(name, listener, thisObject);
        }
        private _once(name:string, listener:Function, thisObject:any):void
        {
            return super.once(name, listener, thisObject);
        }
        public once(name:string, listener:Function, thisObject?:any, ...parameters:any[]):void
        {
            if(name == this.DEVICE_READY)
            {
                if(this._deviceReady)
                {
                    if(listener)
                    {
                        listener.apply(thisObject, parameters);
                        return;
                    }
                }
            }
            else
            if(name == this.APPLICATION_READY)
            {
                if(this._allReady)
                {
                    if(listener)
                    {
                        listener.apply(thisObject, parameters);
                        return;
                    }
                }
            }
            else
            if(name == this.DOM_LOADED)
            {
                if(window["loaded"])
                {
                    if(listener)
                    {
                        listener.apply(thisObject, parameters);
                        return;
                    }
                }
            }
            else
            if(name == this.DOM_READY)
            {
                if(this._domReady)
                {
                    if(listener)
                    {
                        listener.apply(thisObject, parameters);
                        return;
                    }
                }
            }else
            if(name == this.$APPLICATION_READY)
            {
                if(this._$allReady)
                {
                    if(listener)
                    {
                        listener.apply(thisObject, parameters);
                        return;
                    }
                }
            }
            return this._once.apply(this, Array.prototype.slice.apply(arguments) );
        }
        public onThrottle(name:string, listener:Function, delay:number=300, thisObject?:any, ...parameters:any[]):void
        {
            var params:any[] = [];
            params.push(name);
            params.push(ghost.utils.Buffer.throttle(listener, delay));
            params.push(thisObject);
            params = params.concat(parameters);
            this.on.apply(this, params);
        }
        public on(name:string, listener:Function, thisObject?:any, ...parameters:any[]):void
        {
            if(name == this.DEVICE_READY)
            {
                if(this._deviceReady)
                {
                    if(listener)
                    {
                        listener.apply(thisObject, parameters);
                    }
                }
            }
            else
            if(name == this.APPLICATION_READY)
            {
                if(this._allReady)
                {
                    if(listener)
                    {
                        listener.apply(thisObject, parameters);
                    }
                }
            }
            else
            if(name == this.DOM_LOADED)
            {
                if(window["loaded"])
                {
                    if(listener)
                    {
                        listener.apply(thisObject, parameters);
                    }
                }
            }
            else
            if(name == this.DOM_READY)
            {
                if(this._domReady)
                {
                    if(listener)
                    {
                        listener.apply(thisObject, parameters);
                    }
                }
            }else
            if(name == this.$APPLICATION_READY)
            {
                if(this._$allReady)
                {
                    if(listener)
                    {
                        listener.apply(thisObject, parameters);
                    }
                }
            }
            return this._on.apply(this, Array.prototype.slice.apply(arguments) );
        } 
    }
    /**
     * Event bus
     */
    export var Eventer:_Eventer = new _Eventer();
}

