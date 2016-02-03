

namespace ghost.events
{
    /**
     * Event Dispatcher
     */
    export class EventDispatcher extends ghost.core.CoreObject
    {
        public static EVENTS:any = 
        {
            ALL : "all"
        };
        public _eventsK1: any;
        public _eventsK2: any;
        /**
         * named indexed objects for each event
         */
        public _events:any;
        /**
         * named indexed objects for each event. Used by once function
         */

        public _eventsOnce:any;

        /**
         * Mute the dispatcher
         */
        public _muted:boolean = false;

        /**
         * Constructor
         */
        public constructor()
        {
            super();
            this._eventsK1 = {};
            this._eventsK2 = {};

            this._events = {};
            this._eventsOnce = {};
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
            if (!this._events) {
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
                    key2 = EventDispatcher.EVENTS.ALL;
                }
            }else
            {
                key1 = name;
                key2 = EventDispatcher.EVENTS.ALL;
            }
            //if(key1 == "page_changed")
            //console.log("TT_TRIGGER_=>"+name+"     |      "+key1+":"+key2);
            var once:Listener[] = [];
            var listener:Listener;

            if(this._eventsK1[key1])
            {
                for(var p in this._eventsK1[key1])
                {
                    listener = this._eventsK1[key1][p];
                    if(listener.key2 != key2 && listener.key2 != EventDispatcher.EVENTS.ALL)
                    {
                        continue;
                    }
                     //  if(key1 == "page_changed")
                     //console.log("TT_execute=>"+listener.key1+":"+listener.key2);
                    if(listener.once)
                    {
                        once.push(listener);
                    }
                    listener.execute(data);
                }
            }
            if(this._eventsK1[EventDispatcher.EVENTS.ALL])
            {
                for(var p in this._eventsK1[EventDispatcher.EVENTS.ALL])
                {
                    listener = this._eventsK1[EventDispatcher.EVENTS.ALL][p];
                    if(listener.key2 != key2 && listener.key2 != EventDispatcher.EVENTS.ALL)
                    {
                        continue;
                    }
                    //  if(key1 == "page_changed")
                    //console.log("TT_execute=>"+listener.key1+":"+listener.key2);
                    if(listener.once)
                    {
                        once.push(listener);
                    }
                    listener.execute(data,  [key1]);
                }
            }
            if(this._eventsK2[key2])
            {
                for(var p in this._eventsK2[key2])
                {
                    listener = this._eventsK2[key2][p];
                    if(!listener)
                    {
                        debugger;
                    }
                    //we dont re-execute two keys match & all:all match
                    if(listener.key1 != EventDispatcher.EVENTS.ALL || (listener.key1 == EventDispatcher.EVENTS.ALL && key2 == EventDispatcher.EVENTS.ALL))
                    {
                        continue;
                    }
                    if(listener.once)
                    {
                        if( once.indexOf(listener) == -1)
                        {

                            once.push(listener);
                        }else
                        {
                            //not called twice
                            continue;
                        }
                    }
                   //if(key1 == "page_changed")
                    //console.log("TT___execute=>"+listener.key1+":"+listener.key2);
                    listener.execute(data);
                }
            }
            while(once.length)
            {
                this.off(once[0].key1+":"+once[0].key2, once[0].callback, once[0].scope);
                once.shift();
            }
        }

        public on(name:string, callback:Function, scope?:any, ...parameters:any[]):void
        {
            return this.__on(false, name, callback, scope, parameters);
        }
        private __on(once:boolean, name:string, callback:Function, scope:any, parameters:any[]):void
        {
            if (!this._events) {
                //disposed
                return;
            }
            if(!name)
            {
                throw(new Error("event's name can't be null"));
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
            if(key1)
            {
                if(!this._eventsK1[key1])
                {
                    this._eventsK1[key1] = new Array<Listener>();
                }
                this._eventsK1[key1].push(listener);
            }
            if(key2)
            {
                if(!this._eventsK2[key2])
                {
                    this._eventsK2[key2] = new Array<Listener>();
                }
                this._eventsK2[key2].push(listener);
            }
        }
        public once(name:string, callback:Function, scope?:any, ...parameters:any[]):void
        {
           return this.__on(true, name, callback, scope, parameters);
        }
        public off(name?:string,  callback?:Function, scope?:any):void
        {
            if (!this._events)
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
                /*
                 //si c'est un event categorie on supprime tous les events liés
                if(name.indexOf(":") == -1)
                {
                    for(var p in this._events)
                    {
                        if(p.substring(0, name.length+1)==name+":")
                        {
                            this.off(p, callback, scope);
                        }
                    }
                }*/
            }
            if(!key1 || key1 == "")
            {
                key1 = EventDispatcher.EVENTS.ALL;
            }
            if(!key2 || key2 == "")
            {
                key2 = EventDispatcher.EVENTS.ALL;
            }


            if(!name)
            {
                this._eventsK1 = {};
                this._eventsK2 = {};
                return;
            }
            var toDispose: any[] = [];
             if(this._eventsK1[key1])
            {
                for(var p in this._eventsK1[key1])
                {
                    listener = this._eventsK1[key1][p];
                    if(listener.key2 != key2 && key2 != EventDispatcher.EVENTS.ALL)
                    {
                        continue;
                    }
                    if(listener.key2 == EventDispatcher.EVENTS.ALL && key2 != EventDispatcher.EVENTS.ALL)
                    {
                        console.warn("a listener listen for all "+key1+" events and can't be remove from a specific one like "+key2);
                        continue;
                    }
                     //  if(key1 == "page_changed")
                     //console.log("TT_execute=>"+listener.key1+":"+listener.key2);
                     if(callback && callback !== listener.callback)
                     {
                        continue;
                     }
                     if(scope && scope !== listener.scope)
                     {
                        continue;
                     }
                     toDispose.push(listener);
                     //listener.dispose();
                    this._eventsK1[key1].splice(p, 1);
                }
            } 
            if(this._eventsK2[key2])
            {
                for(var p in this._eventsK2[key2])
                {
                    listener = this._eventsK2[key2][p];
                    if(!listener)
                    {
                        debugger;
                    }
                    //we dont re-execute two keys match & all:all match
                    if(listener.key1 != EventDispatcher.EVENTS.ALL || (listener.key1 == EventDispatcher.EVENTS.ALL && key2 == EventDispatcher.EVENTS.ALL))
                    {
                        continue;
                    }
                    if(callback && callback !== listener.callback)
                     {
                        continue;
                     }
                     if(scope && scope !== listener.scope)
                     {
                        continue;
                     }
                    //listener.dispose();
                     toDispose.push(listener);
                    this._eventsK2[key2].splice(p, 1);   
                }
            }
            while(toDispose.length)
            {
                toDispose.shift().dispose();
            }

            return;


            if(!scope && !callback)
            {
                if(!name)
                {
                    //this._events = {};
                    //this._eventsOnce = {};
                    this._eventsK1 = {};
                    this._eventsK2 = {};
                }else
                {
                    delete this._events[name];
                    delete this._eventsOnce[name];
                }
            }else
            {
                if(!name)
                {
                    for(var p in this._events)
                    {
                        this.off(this._events[p], callback, scope);
                    }
                    return;
                }
               
                if(this._events[name])
                {
                    var i:number = 0;
                    while(i<this._events[name].length)
                    {
                       if((!scope || this._events[name][i].isScope(scope)) && (!callback || this._events[name][i].isCallback(callback)))
                       {
                           this._events[name].splice(i, 1);
                           continue;
                       }
                        i++;
                    }
                }
                if(this._eventsOnce[name])
                {
                    var i:number = 0;
                    while(i<this._eventsOnce[name].length)
                    {
                        if((!scope || this._eventsOnce[name][i].isScope(scope)) && (!callback || this._eventsOnce[name][i].isCallback(callback)))
                        {
                            this._eventsOnce[name].splice(i, 1);
                            continue;
                        }
                        i++;
                    }
                }
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
            this.destroy();
        }
        public destroy():void
        {
            this._events = this._eventsOnce = null;
        }
    }
    /**
     * Private class that represents a listener object
     */
    class Listener
    {

        public instance: number = ghost.utils.Maths.getUniqueID();
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
        }
    }
}

