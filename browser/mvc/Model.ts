///<module="ghost/events"/>
///<module="ghost/utils"/>
module ghost.mvc
{

    //TODO:controller(view) => preload models=> load data from ajax or memory


    /**
     * Model class
     */
    export class Model extends ghost.events.EventDispatcher implements IRetrievable
    {
        /**
         * Emits when the data are loaded from the server
         * @type {string}
         */
        public static EVENT_RETRIEVED:string = "loaded";
        /**
         * Real time change event
         * @type {string}
         */
        public static EVENT_CHANGE:string = "change";
        /***
         * Differed event
         * @type {string}
         */
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
        public static get(cls:any):Model
        {
            if(!cls)
            {
                throw new Error("You can't instantiate null class");
            }
            if(cls instanceof Model)
            {
                return cls;
            }
            if(typeof cls == "string")
            {
                ///model from string
                var model:Model = cls.split(".").reduce(function(previous:any, next:string):Model
                {
                    if(previous)
                        return previous[next];
                    return null;
                }, this);
                if(!model)
                {
                    throw new Error("No Model named "+cls);
                }else
                {
                    cls = model;
                }
            }

            if(Model._instances[cls])
            {
                return Model._instances[cls];
            }
            return new cls();
        }

        /**
         * Save instance for further get operations
         * @param instance Instance's to save
         */
        protected static saveInstance(instance:Model):void
        {
            if( Model._instances[<any>instance.constructor])
            {
                console.warn("Instance already exists for ",instance.constructor," previous will be ")
            }
            Model._instances[<any>instance.constructor] = instance;
        }


        /**
         * Is the data already retrieved from Server
         * @type {boolean}
         * @private
         */
        private _retrieved:boolean = false;
        /**
         * data currently being retrieve from server
         * @type {boolean}
         * @private
         */
        private _retrieving:boolean = false;
        /**
         * @protected
         * @type {any}
         */
        public data:any;
        private _timeout:NodeTimer = <any>-1;
        private _changed:string[];
        public _name:string;
        constructor()
        {
            super();
            if(!this.data)
            {
                this.data = this;///{};
            }
            this._changed = [];
            if(this.saveInstance())
            {
                Model.saveInstance(this);
            }
        }

        /**
         * Specify if the model has to be saved
         * @returns {boolean}
         */
        protected saveInstance():boolean
        {
            return false;
        }
        public readFromJSON(selector:string = null):void
        {
            if(!selector)
            {
                return this.readFromJSON("[data-model='"+this.name()+"']");
            }
            try
            {

                this.data = JSON.parse($(selector).html());
            }catch(exception)
            {
                console.warn("Unable to read JSON from "+selector);
            }
        }
        public get(key:string):any
        {
            if(!key || key.length==0)
            {
                throw new Error("Key must be defined - null given");
            }
            var methodName:string = "get"+key.substring(0,1).toUpperCase()+key.substring(1);
            if(this[methodName])
            {
                return this[methodName]();
            }
            return this.data[key];
        }
        public set(key:string, value:any):void
        {
            if(!key || key.length==0)
            {
                throw new Error("Key must be defined - null given");
            }
            var methodName:string = "set"+key.substring(0,1).toUpperCase()+key.substring(1);

            if(this[methodName])
            {
                return this[methodName](value);
            }else
            {
                this.data[key] = value;
            }
            this._triggerUpdate(key);
        }

        public getFullClassName():string
        {
            throw new Error("You must override this function and set a complete class name return");
            return null;
        }


        public _triggerUpdate(key:string):void
        {
            this.trigger(Model.EVENT_CHANGE, key);
            if(this._changed.indexOf(key)==-1)
                this._changed.push(key);
            if(<any>this._timeout == -1)
            {
                this._timeout = <any>setTimeout(()=>
                {
                    this._timeout = <any>-1;
                    var copy:string[] = this._changed;
                    this._changed = [];
                    this.trigger(Model.EVENT_CHANGED, copy);

                },0);
            }
        }

        /**
         * Get's model's name
         * @returns {string}
         */
        public name():string
        {
            if(!this._name)
            {
                this._name = this.getClassName().replace(/model/gi,"");
                this._name = this._name.substring(0,1).toLocaleLowerCase()+this._name.substring(1);
            }
            return this._name;
        }

        /**
         * Set current model's data with input
         * @param input
         */
        public readExternal(input:any):void
        {
            for(var p in input)
            {
                this.data[p] = input[p];
            }
            //this.data = input;
        }

        /**
         * Returns model's data
         * @returns {any}
         */
        public writeExternal():any
        {
            return this.toObject();
        }

        /**
         * Returns model.data value
         * @param keys
         * @returns {any}
         */
        public toObject(keys:string[] = null):any
        {
            var result:any = {};
            for(var p in this.data)
            {
                if(this.data.hasOwnProperty(p) && p.substring(0,1)!="_" && p!="data")
                {
                    result[p] = this.data[p];
                }
            }
            return result;
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
            return window.location.protocol+"//"+window.location.host+pathname+"/";
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
                    "type":"POST"
                }).done((result:any)=> {
                    this._retrieved = true;
                    this._retrieving = true;
                    this.readExternal(result);
                    this.trigger(Model.EVENT_RETRIEVED);
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
                    this.once(Model.EVENT_RETRIEVED, callback);
                }
            }

        }

        /**
         * Model's data is retrieved from server
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
    }
    export class ModelID extends Model
    {
        private _generateID():void
        {
            if(!this.hasID())
            {
                this.setID(ghost.utils.Strings.getUniqueToken());
            }
        }
        public getID():string
        {
            if(!this.hasID())
            {
                this._generateID();
            }
            return this.data.id;
        }
        public hasID():boolean
        {
            return this.data.id != null;
        }
        public setID(value:string):void
        {
            this.set("id", value);
        }
        public name():string
        {
            if(!this._name)
            {
                this._name = this.getClassName().replace(/modelid/gi,"");
            }
            return this._name;
        }

        public toObject(keys:string[] = null):any
        {
            if(!this.hasID())
            {
                this._generateID();
            }
            return super.toObject(keys);
        }
    }

    export interface IRetrievable
    {
        retrieveFromServer(callback:Function, times?:number);
        isRetrieved():boolean;
    }

   

}