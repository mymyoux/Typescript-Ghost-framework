///<module="ghost/events"/>
///<module="ghost/utils"/>
///<file="Model.ts"/>
module ghost.mvc
{
    /**
     * Collection class
     */
    export class Collection<T extends ghost.mvc.Model> extends ghost.events.EventDispatcher implements IRetrievable
    {
        public static EVENT_RETRIEVED:string = Model.EVENT_RETRIEVED;
        public static EVENT_CHANGE:string = "change";
        public static EVENT_CHANGED:string = "changed";

        /**
         * Model's instances
         * @type {string:Model}
         * @private
         */
        private static _instances:any = {};

        /**
         * Gets or instanciate a model
         * @param cls Class's model
         * @returns {Model}
         */
        public static get(cls:any):Collection<any>
        {
            if(!cls)
            {
                throw new Error("You can't instantiate null class");
            }
            if(cls instanceof Collection)
            {
                return cls;
            }
            if(typeof cls == "string")
            {
                ///collection from string
                var collection:Collection<any> = cls.split(".").reduce(function(previous:any, next:string):Collection<any>
                {
                   return previous? previous[next] : null;
                }, this);

                if(!collection)
                {
                    throw new Error("No Collection named "+cls);
                }else
                {
                    cls = collection;
                }
            }

            if(Collection._instances[cls])
            {
                return Collection._instances[cls];
            }
            return new cls();
        }

        /**
         * Save instance for further get operations
         * @param instance Instance's to save
         */
        public static saveInstance(instance:Collection<any>):void
        {
            if( Collection._instances[<any>instance.constructor])
            {
                console.warn("Instance already exists for ",instance.constructor," previous will be ")
            }
            Collection._instances[<any>instance.constructor] = instance;
        }


        /**
         * Is the data already retrieved from Server
         * @type {boolean}
         * @private
         */
        protected _retrieved:boolean = false;
        /**
         * data currently being retrieve from server
         * @type {boolean}
         * @private
         */
        protected _retrieving:boolean = false;
        /**
         * Models
         */
        public _models:T[];
        public _changed:T[];
        /**
         * @protected
         */
        public _name:string;
        private _timeout:NodeTimer = <any>-1;

        /**
         * Constructor
         */
        constructor()
        {
            super();
            this._models = [];
            this._changed = [];
            if(this.saveInstance())
            {
                Collection.saveInstance(this);
            }
        }
        protected saveInstance():boolean
        {
            return true;
        }
        public getFullClassName():string
        {
            throw new Error("You must override this function and set a complete class name return");
            return null;
        }
        public name():string
        {
            if(!this._name)
            {
                this._name = this.getClassName().replace(/collection/gi,"");
                this._name = this._name.substring(0,1).toLocaleLowerCase()+this._name.substring(1);
            }
            return this._name;
        }
        /**
         * Length
         */
        public length():number
        {
            return this._models.length;
        }
        /**
         * Erases all models
         */
        public clear():void
        {
            var models:T[] = this._models.concat();
            this._models.length = 0;
            for(var i:number = 0;i<models.length; i++)
            {
                this._remove(models[i]);
            }

        }
        public get(id:number):T
        {
            return this._models[id];
        }
        /**
         * Pop the last element
         */
        public pop():Model
        {
            this._remove(this._models[this._models.length-1]);
            return this._models.pop();
        }

        public push(...models:T[]):number
        {
            var index:number;
            var model:T;
            for(var p in models)
            {
                model = models[p]
                if((index = this._models.indexOf(model))==-1)
                {
                    this._models.push(model);
                    this._add(model);
                }else
                {
                    console.warn("already into collection:", model);
                }
            }

            return this.length();
        }
        /**
         * @protected
         * @type {[type]}
         */
        public _add(model:T):void
        {

            if(model)
            {

                model.on(Model.EVENT_CHANGED, this._onChange, this, model);
                this._triggerUpdate(model);
            }
        }
        public remove(model:T):void
        {
            var index:number = this.indexOf(model);
            if(index != -1)
            {
                this.splice(index, 1);
            }
        }
        /**
         * @protected
         * @type {[type]}
         */
        public _remove(model:T):void
        {
            if(model)
            {
                model.off(Model.EVENT_CHANGED, this._onChange, this);
                this._triggerUpdate(model);
            }
        }
        /**
         * @protected
         * @type {[type]}
         */
        public _onChange(key:string, model:T):void
        {
            if(model)
            {
                this._triggerUpdate(model);
            }
        }
        private _triggerUpdate(model:T):void
        {
            this.trigger(Collection.EVENT_CHANGE, model);
            if(this._changed.indexOf(model)==-1)
                this._changed.push(model);
            if(<any>this._timeout == -1)
            {
                this._timeout = <any>setTimeout(()=>
                {
                    this._timeout = <any>-1;
                    var copy:T[] = this._changed;
                    this._changed = [];
                    this.trigger(Collection.EVENT_CHANGED, copy);

                },0);
            }
        }
        public _orderChange():void
        {
            this.trigger(Collection.EVENT_CHANGE);
            if(<any>this._timeout == -1)
            {
                this._timeout = <any>setTimeout(()=>
                {
                    this._timeout = <any>-1;
                    var copy:T[] = this._models.concat();
                    this._changed = [];
                    this.trigger(Collection.EVENT_CHANGED, copy);

                },0);
            }
        }
        public reverse():T[]
        {
            this._models.reverse();
            this._orderChange();
            return this._models;
        }
        public shift():T
        {
            var model:T = this._models[0];
            this._models.shift();
            this._remove(model);
            return model;
        }
        public sort(compareFunction?:(a: T, b: T) => number):T[]
        {
            //TODO:réorganiser dans le dom les élements
            var result:T[] =  this._models.sort(compareFunction);
            this._orderChange();
            return result;
        }
        public splice(index:number, howMany:number, ...models:T[]):T[]
        {
            var i:number = 0;
            while(i<models.length)
            {
                if(this._models.indexOf(models[i])==-1)
                {
                    i++;
                    this._add(models[i]);
                }else
                {
                    models.splice(i, 1);
                }
            }
            var args:any[] = [index, howMany];
            args = args.concat(models);
            var removed:T[] =  this._models.splice.apply(this._models, args);
            for(i=0; i<removed.length; i++)
            {
                this._remove(removed[i]);
            }
            this._orderChange();
            return removed;
        }
        public unshift(...models:T[]):number
        {
            var i:number = 0;
            while(i<models.length)
            {
                if(this._models.indexOf(models[i])==-1)
                {
                    i++;
                    this._add(models[i]);
                }else
                {
                    models.splice(i, 1);
                }
            }
            return this._models.unshift.apply(this, models);
        }
        public concat(...models:T[]):Collection<T>
        {
            var collection:Collection<T> = new Collection<T>();
            var i:number = 0;
            while(i<models.length)
            {
                if(this._models.indexOf(models[i])==-1)
                {
                    i++;
                    this._add(models[i]);
                }else
                {
                    models.splice(i, 1);
                }
            }
            collection._models = this._models.concat(models);
            return collection;
        }
        public slice(begin:number, end?:number):T[]
        {
            return this._models.slice(begin, end);
        }
        public toString():string
        {
            return "[Collection  length=\""+this.length()+"\"]";
        }
        public indexOf(model:T):number
        {
            return this._models.indexOf(model);
        }
        public lastIndexOf(model:T):number
        {
            return this._models.lastIndexOf(model);
        }
        public forEach(callback:(value: T, index: number, array: T[]) => void, thisArg?:any):void
        {
            return this._models.forEach(callback, thisArg);
        }
        public every(callback:(value: T, index: number, array: T[]) => boolean, thisObject?:any):boolean
        {
            return this._models.every(callback, thisObject);
        }
        public some(callback:(value: T, index: number, array: T[]) => boolean, thisObject?:any):boolean
        {
            return this._models.some(callback, thisObject);
        }
        public filter(callback:(value: T, index: number, array: T[]) => boolean, thisObject?:any):T[]
        {
            return this._models.filter(callback, thisObject);
        }
        public map(callback:(value: T, index: number, array: T[]) => any[], thisObject?:any):any[]
        {
            return this._models.map(callback, thisObject);
        }
        public reduce(callback:(previousValue: T, nextValue:T, index: number, array: T[]) => boolean, initialValue?:any):any
        {
            return this._models.reduce(callback, initialValue);
        }

        /**
         * Gets Root URL for data URL (prefix if no / first from  #getDataURLForServer()
         * @return {string} [description]
         */
        protected getRootURL():string
        {
            var pathname:string = window.location.pathname;
            var index:number = pathname.indexOf("/",1);
            if(index > -1)
            {
                pathname = pathname.substring(0, index);
            }
             return window.location.protocol+"//"+window.location.host+(pathname.length>1?pathname+"/":pathname);
        }
        protected getMethodForServer():string
        {
            return "GET";
        }
        /**
        * Retrieves Data fro mserver
        * @param callback Callback's function
        * @param times @internal Number of errors
        */
        public retrieveFromServer(callback:Function, times:number = 0):void
        {
            if(!this._retrieving && !this._retrieved)
            {

                this._retrieving = true;
                var url:string = this.getDataURLForServer();
                if(url && url.substring(0, 1) != "/" && url.substring(0,4)!="http")
                {
                    url = this.getRootURL()+url;
                }
                var data:any = this.getDataForServer();
                $.ajax(url,
                    {
                        data:data,
                        "type":this.getMethodForServer()
                    }).done((result:any)=> {
                        this._retrieved = true;
                        this._retrieving = true;
                        this.readExternal(result);
                        this.trigger(Collection.EVENT_RETRIEVED);
                        if(callback)
                        {
                            callback();
                        }
                    })
                    .fail((error)=> {
                        if(error.status == 404)
                        {
                            console.error("Data: "+url+" not found");
                        }else
                        {
                            console.error("Error retrieving data", error)
                        }
                        setTimeout(()=>
                        {
                            this._retrieving = false;
                            this.retrieveFromServer(callback, times);

                        },( error.status==500?(++times):1)*500);
                    });
            }else
            {
                if(this._retrieved){
                    callback();
                }else
                {
                    this.once(Collection.EVENT_RETRIEVED, callback);
                }
            }

        }
        /**
         * Collection's data is retrieved from server
         * @returns {boolean}
         */
        public isRetrieved():boolean
        {
            return this._retrieved;
        }

        /**
         * URL for data retrieving
         * @returns {string}
         */
        protected getDataURLForServer():string
        {
            return "data";
        }
        /**
         * Data's arguments for data retrieving
         * @returns {string}
         */
        protected getDataForServer():any
        {
            return null;
        }

        /**
         * Set current model's data with input
         * @param input
         */
        public readExternal(input:any[]):void
        {

            if(input)
            {
                if(input.forEach)
                    input.forEach(function(rawModel:any):void
                    {
                        if(rawModel.__class)
                        {
                            var model:T = <T>Model.get(rawModel.__class);
                            model.readExternal(rawModel);
                            this.push(model);
                        }else
                        {
                            if(typeof rawModel == "object")
                            {
                                var model:T = <T>Model.get(this.getDefaultClass());
                                model.readExternal(rawModel);
                                this.push(model);
                            }else
                            {
                                console.error("RawModel must be object, given ", rawModel);
                            }
                        }
                    }, this);
            }
        }
        protected getDefaultClass():any
        {
            return Model;
        }
        /**
         * Returns model's data
         * @returns {any}
         */
        public writeExternal():any
        {
            return this.toObject();
        }
        public toObject():any
        {
            return this._models;
            return this._models.map(function(model:T):any
            {
                return model.toObject();
            });
        }

    }
}
