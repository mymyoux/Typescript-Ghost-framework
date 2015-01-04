

module ghost.events
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
        constructor()
        {
            super();
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
            if(this._muted)
            {
                return;
            }
            if(!name)
            {
                throw(new Error("event's name can't be null"));
            }
            if(this._events[name])
            {
               for(var p in this._events[name])
               {
                   this._events[name][p].execute(data);
               }
            }
            if(this._eventsOnce[name])
            {
                while(this._eventsOnce[name].length>0)
                {
                    this._eventsOnce[name].shift().execute(data);
                }
                delete this._eventsOnce[name];
            }
            var index:number;
            if((index = name.indexOf(":"))!=-1)
            {
                this.trigger.apply(this, [name.substring(0, index), name.substring(index+1)].concat(data));
            }
            if(name != EventDispatcher.EVENTS.ALL)
                this.trigger.apply(this, [EventDispatcher.EVENTS.ALL, name].concat(data));
        }

        public on(name:string, callback:Function, scope?:any, ...parameters:any[]):void
        {
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
                        this.on.apply(this, [names[p],callback, scope].concat(parameters));
                    }
                }
                return;
            }
            if(!this._events[name])
            {
                this._events[name] = new Array<Listener>();
            }

            this._events[name].push(new Listener(callback, scope, parameters));
        }
        public once(name:string, callback:Function, scope?:any, ...parameters:any[]):void
        {
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
                        this.once.apply(this, [names[p],callback, scope].concat(parameters));
                    }
                }
                return;
            }
            if(!this._eventsOnce[name])
            {
                this._eventsOnce[name] = new Array<Listener>();
            }

            this._eventsOnce[name].push(new Listener(callback, scope, parameters));
        }
        public off(name?:string,  callback?:Function, scope?:any):void
        {
            if(name)
            {
                 if(name.indexOf(" ")>-1)
                {
                    var names:string[] = name.split(" ");
                    for(var p in names)
                    {
                        if(names[p].length>0)
                        {
                            this.off.call(this, names[p],callback, scope);
                        }
                    }
                    return;
                }
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
                }
            }
            if(!scope && !callback)
            {
                if(!name)
                {
                    this._events = {};
                    this._eventsOnce = {};
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

        constructor(private callback:Function, private scope?:any, private parameters?:any[])
        {
        }
        public isScope(scope:any):boolean
        {
            return scope === this.scope;
        }
        public isCallback(callback:Function):boolean
        {
            return callback === this.callback;
        }
        public execute(parameters?:any[])
        {
            var params:any[] = parameters.length?parameters.concat(this.parameters):this.parameters;
            this.callback.apply(this.scope, params/*parameters.concat(params)*/);
        }
    }
}

