//convert
 /* ghost.utils.Maths.*/
import {Maths} from "ghost/utils/Maths";
import {Classes} from "ghost/utils/Classes";
//convert
 /* ghost.core.CoreObject
*/
import {CoreObject} from "ghost/core/CoreObject";




type Constructor<T extends {}> = new(...args: any[]) => T;
/**
 * Add #getPicture method to an existing class
 */
export function MEventDispatcher<X extends Constructor<{}>>( Child:X ) {
    type T =  typeof Child.prototype;
    return class extends Child {
   public static EVENTS:any = 
        {
            ALL : "all"
        };
        public _eventsK1: any = {};
        public _eventsK2: any = {};
        /**
         * named indexed objects for each event
         */
        public _events:any = {};
        /**
         * named indexed objects for each event. Used by once function
         */

        public _eventsOnce:any= {};

        /**
         * Mute the dispatcher
         */
        public _muted:boolean = false;

        private _listeners: Listener[] = [];

        private _trigerring: boolean;
        /**
         * Mutes the event dispatcher
         */
        public mute():void
        {
            this._muted = true;
        }
        /**
         * Unmutes the event dispatcher
         */
        public unmute():void
        {
            this._muted = false;
        }
        /**
         * Tests if the event dispatcher is muted
         */
        public isMuted():boolean
        {
            return this._muted;
        }
        public trigger(name:string, ...data:any[]):void
        {
            if (!this._listeners) {
                //disposed
                return;
            }

            if(this._muted)
            {
                return;
            }
            if(!name)
            {
                debugger;
                throw(new Error("event's name can't be null"));
            }

            var key1:string;
            var key2:string;
            if(name.indexOf(":") != -1)
            {
                var parts:string[] = name.split(":");
                key1 = parts[0];
                key2 = parts.slice(1).join(":");
                if(key1 == "" || !key1)
                {
                    key1 = EventDispatcher.EVENTS.ALL;
                }
                if(key2 == "" || !key2)
                {
                    key2 = null;
                }
            }else
            {
                key1 = name;
                key2 = null;//EventDispatcher.EVENTS.ALL;
            }
            //var len: number = this._listeners.length;
            var i: number = 0;
            var listener: Listener;
            var listeners: Listener[] = this._listeners.slice();
            //copy array & remove once after ?
            var len: number = listeners.length;
            while (i < len)
            {
                listener = listeners[i];
                if (listener.disposed !== true && (listener.key1 == key1 || listener.key1 == EventDispatcher.EVENTS.ALL || key1 == EventDispatcher.EVENTS.ALL) && (listener.key2 == EventDispatcher.EVENTS.ALL || listener.key2 == key2 || key2 == EventDispatcher.EVENTS.ALL))
                {
                    if (listener.key1 == EventDispatcher.EVENTS.ALL) 
                    {
                        listener.execute(data, [key1]);
                    }else
                    {
                        listener.execute(data);
                    }
                    //test if the current dispatcher has been disposed();
                    if(listener.once)
                    {

                        listener.dispose();
                        //this._listeners.splice(i, 1);
                        //len--;
                      //  continue;
                    }
                }
                i++;
            }
            //disposed between
            if (!this._listeners)
            {
                return;
            }
            i = 0;
            len = this._listeners.length;
            while(i<len)
            {
                if (this._listeners[i].disposed === true)
                {
                    this._listeners.splice(i, 1);
                    len--;
                    continue;
                }            
                i++;    
            }


            //for dispose maybe set a variable to running & only dispose listeners after the running
            //for off ?
        }

        public on(name:string, callback:Function, scope?:any, ...parameters:any[]):void
        {
            return this.__on(false, name, callback, scope, parameters);
        }
        public __on(once:boolean, name:string, callback:Function, scope:any, parameters:any[]):void
        {
            if (!this._listeners) {
                //disposed
                return;
            }
            if(!name)
            {
                throw(new Error("event's name can't be null"));
            }
            if(!callback)
            {
                throw(new Error("callback is required"));
            }
            if(name.indexOf(" ")>-1)
            {
                var names:string[] = name.split(" ");
                for(var p in names)
                {
                    if(names[p].length>0)
                    {
                       // this.once.apply(this, [names[p],callback, scope].concat(parameters));
                        this.__on(once, names[p], callback, scope, parameters); 
                    }
                }
                return;
            }
            var key1:string;
            var key2:string;
            if(name.indexOf(":") != -1)
            {
                var parts:string[] = name.split(":");
                key1 = parts[0];
                key2 = parts.slice(1).join(":");
                if(key1 == "" || !key1)
                {
                    key1 = EventDispatcher.EVENTS.ALL;
                }
                if(key2 == "" || !key2)
                {
                    key2 = EventDispatcher.EVENTS.ALL;
                }
            }else
            {
                key1 = name;
                key2 = EventDispatcher.EVENTS.ALL;
            }
          ///  if(key1 == "page_changed")
          //console.log("TT___on["+once+"]=>"+name +"      |    "+key1+":"+key2);
            var listener:Listener = new Listener(key1, key2, once, callback, scope, parameters);
            this._listeners.push(listener);
        }
        public once(name:string, callback:Function, scope?:any, ...parameters:any[]):void
        {
           return this.__on(true, name, callback, scope, parameters);
        }
        public off(name?:string,  callback?:Function, scope?:any):void
        {
            if (!this._listeners)
            {
                //disposed
                return;
            }
//debugger;
            var key1:string, key2:string; 
            var listener:Listener;  

            //TODO:off with new system
            if(name)
            {
                 if(name.indexOf(" ")>-1)
                {
                    var names:string[] = name.split(" ");
                    for(var p in names)
                    {
                        if(names[p].length>0)
                        {
                            this.off(names[p],callback, scope);
                        }
                    }
                    return;
                }
                var index:number;
                if((index = name.indexOf(":")) != -1)
                {
                    key1 = name.substring(0, index);
                    key2 = name.substring(index + 1);
                }else
                {
                    key1 = name;
                }
            }
            if(!key1 || key1 == "")
            {
                key1 = EventDispatcher.EVENTS.ALL;
            }
            if(!key2 || key2 == "")
            {
                key2 = EventDispatcher.EVENTS.ALL;
            }

            if (!name) {
                while(this._listeners.length)
                {
                    this._listeners.shift();//.dispose();
                }
                return;
            }

            var len: number = this._listeners.length;
            var i: number = 0;
            var listener: Listener;
            while (i < len) {
                listener = this._listeners[i];
                if ((!callback || callback === listener.callback) && (!scope || scope === listener.scope) && (listener.key1 == key1 || key1 == EventDispatcher.EVENTS.ALL) && (listener.key2 == key2 || key2 == EventDispatcher.EVENTS.ALL)) {
                        this._listeners.splice(i, 1);
                        //listener.dispose();
                        len--;
                        continue;
                }
                i++;
            }
        }
        public proxy(callback:Function, scope?:any):any
        {
            scope = scope || this;
            return function()
            {
                return callback.apply(scope, Array.prototype.splice.apply(arguments));
            };
        }
        public dispose():void
        {
            if(super["dispose"])
            {
                super["dispose"]();
            }
            this.destroy();
        }
        public destroy():void
        {
            this._listeners = null;
        }
    }
}

    /**
     * Event Dispatcher
     */
    export class EventDispatcher extends CoreObject
    {
        public static EVENTS:any = 
        {
            ALL : "all"
        };
        public _eventsK1: any = {};
        public _eventsK2: any = {};
        /**
         * named indexed objects for each event
         */
        public _events:any = {};
        /**
         * named indexed objects for each event. Used by once function
         */

        public _eventsOnce:any= {};

        /**
         * Mute the dispatcher
         */
        public _muted:boolean = false;

        private _listeners: Listener[] = [];

        private _trigerring: boolean;

        /**
         * Constructor
         */
        public constructor()
        {
            super();
        }

        /**
         * Mutes the event dispatcher
         */
        public mute():void
        {
            this._muted = true;
        }
        /**
         * Unmutes the event dispatcher
         */
        public unmute():void
        {
            this._muted = false;
        }
        /**
         * Tests if the event dispatcher is muted
         */
        public isMuted():boolean
        {
            return this._muted;
        }
        public trigger(name:string, ...data:any[]):void
        {
            if (!this._listeners) {
                //disposed
                return;
            }

            if(this._muted)
            {
                return;
            }
            if(!name)
            {
                debugger;
                throw(new Error("event's name can't be null"));
            }

            var key1:string;
            var key2:string;
            if(name.indexOf(":") != -1)
            {
                var parts:string[] = name.split(":");
                key1 = parts[0];
                key2 = parts.slice(1).join(":");
                if(key1 == "" || !key1)
                {
                    key1 = EventDispatcher.EVENTS.ALL;
                }
                if(key2 == "" || !key2)
                {
                    key2 = null;
                }
            }else
            {
                key1 = name;
                key2 = null;//EventDispatcher.EVENTS.ALL;
            }
            //var len: number = this._listeners.length;
            var i: number = 0;
            var listener: Listener;
            var listeners: Listener[] = this._listeners.slice();
            //copy array & remove once after ?
            var len: number = listeners.length;
            while (i < len)
            {
                listener = listeners[i];
                if (listener.disposed !== true && (listener.key1 == key1 || listener.key1 == EventDispatcher.EVENTS.ALL || key1 == EventDispatcher.EVENTS.ALL) && (listener.key2 == EventDispatcher.EVENTS.ALL || listener.key2 == key2 || key2 == EventDispatcher.EVENTS.ALL))
                {
                    if (listener.key1 == EventDispatcher.EVENTS.ALL) 
                    {
                        listener.execute(data, [key1]);
                    }else
                    {
                        listener.execute(data);
                    }
                    //test if the current dispatcher has been disposed();
                    if(listener.once)
                    {

                        listener.dispose();
                        //this._listeners.splice(i, 1);
                        //len--;
                      //  continue;
                    }
                }
                i++;
            }
            //disposed between
            if (!this._listeners)
            {
                return;
            }
            i = 0;
            len = this._listeners.length;
            while(i<len)
            {
                if (this._listeners[i].disposed === true)
                {
                    this._listeners.splice(i, 1);
                    len--;
                    continue;
                }            
                i++;    
            }


            //for dispose maybe set a variable to running & only dispose listeners after the running
            //for off ?
        }

        public on(name:string, callback:Function, scope?:any, ...parameters:any[]):void
        {
            return this.__on(false, name, callback, scope, parameters);
        }
        private __on(once:boolean, name:string, callback:Function, scope:any, parameters:any[]):void
        {
            if (!this._listeners) {
                //disposed
                return;
            }
            if(!name)
            {
                throw(new Error("event's name can't be null"));
            }
            if(!callback)
            {
                throw(new Error("callback is required"));
            }
            if(name.indexOf(" ")>-1)
            {
                var names:string[] = name.split(" ");
                for(var p in names)
                {
                    if(names[p].length>0)
                    {
                       // this.once.apply(this, [names[p],callback, scope].concat(parameters));
                        this.__on(once, names[p], callback, scope, parameters); 
                    }
                }
                return;
            }
            var key1:string;
            var key2:string;
            if(name.indexOf(":") != -1)
            {
                var parts:string[] = name.split(":");
                key1 = parts[0];
                key2 = parts.slice(1).join(":");
                if(key1 == "" || !key1)
                {
                    key1 = EventDispatcher.EVENTS.ALL;
                }
                if(key2 == "" || !key2)
                {
                    key2 = EventDispatcher.EVENTS.ALL;
                }
            }else
            {
                key1 = name;
                key2 = EventDispatcher.EVENTS.ALL;
            }
          ///  if(key1 == "page_changed")
          //console.log("TT___on["+once+"]=>"+name +"      |    "+key1+":"+key2);
            var listener:Listener = new Listener(key1, key2, once, callback, scope, parameters);
            this._listeners.push(listener);
        }
        public once(name:string, callback:Function, scope?:any, ...parameters:any[]):void
        {
           return this.__on(true, name, callback, scope, parameters);
        }
        public off(name?:string,  callback?:Function, scope?:any):void
        {
            if (!this._listeners)
            {
                //disposed
                return;
            }
//debugger;
            var key1:string, key2:string; 
            var listener:Listener;  

            //TODO:off with new system
            if(name)
            {
                 if(name.indexOf(" ")>-1)
                {
                    var names:string[] = name.split(" ");
                    for(var p in names)
                    {
                        if(names[p].length>0)
                        {
                            this.off(names[p],callback, scope);
                        }
                    }
                    return;
                }
                var index:number;
                if((index = name.indexOf(":")) != -1)
                {
                    key1 = name.substring(0, index);
                    key2 = name.substring(index + 1);
                }else
                {
                    key1 = name;
                }
            }
            if(!key1 || key1 == "")
            {
                key1 = EventDispatcher.EVENTS.ALL;
            }
            if(!key2 || key2 == "")
            {
                key2 = EventDispatcher.EVENTS.ALL;
            }

            if (!name) {
                while(this._listeners.length)
                {
                    this._listeners.shift();//.dispose();
                }
                return;
            }

            var len: number = this._listeners.length;
            var i: number = 0;
            var listener: Listener;
            while (i < len) {
                listener = this._listeners[i];
                if ((!callback || callback === listener.callback) && (!scope || scope === listener.scope) && (listener.key1 == key1 || key1 == EventDispatcher.EVENTS.ALL) && (listener.key2 == key2 || key2 == EventDispatcher.EVENTS.ALL)) {
                        this._listeners.splice(i, 1);
                        //listener.dispose();
                        len--;
                        continue;
                }
                i++;
            }
        }
        public proxy(callback:Function, scope?:any):any
        {
            scope = scope || this;
            return function()
            {
                return callback.apply(scope, Array.prototype.splice.apply(arguments));
            };
        }
        public dispose():void
        {
            if(super.dispose)
            {
                super.dispose();
            }
            this.destroy();
        }
        public destroy():void
        {
            this._listeners = null;
        }
    }
    /**
     * Private class that represents a listener object
     */
    class Listener
    {

        public instance: number = Maths.getUniqueID();
        public disposed: boolean;
        constructor(public key1:string, public key2:string, public once:boolean, public callback:Function, public scope?:any, public parameters?:any[])
        {
            if(!callback)
            {
                debugger;
            }
        }
        public isScope(scope:any):boolean
        {
            return scope === this.scope;
        }
        public isCallback(callback:Function):boolean
        {
            return callback === this.callback;
        }
        public execute(parameters?:any[], prefixParams?:any[])
        {
            var params:any[] = parameters.length?parameters.concat(this.parameters):this.parameters;
            if(prefixParams){
                params = prefixParams.concat(params);
            }
            this.callback.apply(this.scope, params/*parameters.concat(params)*/);
        }
        public dispose():void
        {
            this.callback = null;
            this.scope = null;
            this.parameters = null;
            this.once = false;
            this.disposed = true;
        }
    }
