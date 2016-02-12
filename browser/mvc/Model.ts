///<module="ghost/events"/>
///<module="ghost/utils"/>
///<file="IData"/>
namespace ghost.mvc
{

    //TODO:controller(view) => preload models=> load data from ajax or memory


    /**
     * Model class
     */
    export class Model extends ghost.events.EventDispatcher implements IRetrievable, IModel
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
         * Default part
         * @type {string}
         */
        public static PART_DEFAULT:string = "default";
        /**
         * Model's instances
         * @type {string:Model}
         * @private
         */
        private static _instances:any = {};

        /**
         * Gets or instanciate a model
         * @param cls Class's model
         * @param searchForCollectionToo Will look for model or collection
         * @returns {Model}
         */
        public static get(cls:any, searchForCollectionToo:boolean = true):Model
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
            if(searchForCollectionToo)
            {
                return <any>Collection.get(cls);
            }
            return new cls();
        }
        public static has(cls:any, searchForCollectionToo:boolean = true):boolean
        {
            if(!cls)
            {
                throw new Error("You can't instantiate null class");
            }
            if(cls instanceof Model)
            {
                return true;
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
                return true;
            }
            if(searchForCollectionToo)
            {
                return <any>Collection.has(cls);
            }
            return false;
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
                return;
            }
            Model._instances[<any>instance.constructor] = instance;
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
         * @protected
         * @type {any}
         */
        public data:any;
        private _timeout:any = <any>-1;
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

        ///PROMISES PARTS
        protected _partsPromises:any = {};
        protected hasPart(name:string):boolean
        {
            return this._partsPromises[name] || this.getPartRequest(name)!=null;//name == "default";
        }
        protected getPartPromise(name:string, params:any = null):Promise<any>|boolean
        {
            if(!this.hasPart(name))
            {
                return null;
            }
            if(!this._partsPromises[name])
            {
                var request:any = this.getPartRequest(name, params);
                if(request === false)
                {
                    this._partsPromises[name] = true;
                    return true;
                }
                if(request.reset === true)
                {
                    this.reset(name);
                }
               this._partsPromises[name] = new Promise<any>((accept, reject)=>
               {
                    var _self:any = this;

                    if(!request)
                    {
                        request = {};
                    }
                    var url = request.url?request.url:this.getDataURLForServer();
                    if(url && url.substring(0, 1) != "/" && url.substring(0,4)!="http")
                    {
                        url = this.getRootURL()+url;
                    }
                    var server_data:any = this.getDataForServer();
                    var data:any = request.data?request.data:{};
                    for(var p in server_data)
                    {
                        data[p] = server_data[p];
                    }
                    ghost.io.ajax(url,
                    {
                        data:data,
                        "method":request.method?request.method:this.getMethodForServer()
                    })
                    .then(function()
                    {
                        if(request.cache === false)
                        {
                            delete _self._partsPromises[name];
                        }else
                        {
                            _self._partsPromises[name] = true;
                        }
                        accept.call(null, {data:Array.prototype.slice.call(arguments),read:false});
                    },reject);
               });
            }
            return this._partsPromises[name];
        }
        protected getPartRequest(name:string, params:any = null):IPartRequest
        {
            debugger;
             throw new Error("you must override getPartRequest function");
            switch(name)
            {
                case Model.PART_DEFAULT:
                    return {
                        method:"GET",
                        url:"data",
                        data:{}
                    };
                break;
            }
            return null;
        }

        public retrieveData(data:string[] = [Model.PART_DEFAULT], params:any = null):Promise<any>
        {
            if(!data)
            {
                data = [Model.PART_DEFAULT];
            }
            var _this:Model = this;
            var promise:Promise<any> = new Promise<any>(function(accept:any, reject:any):void
            {

                var failed:boolean = false;
                var promises:Promise<any>[] = data.map(function(name:string)
                {
                    if(this.hasPart(name))
                    {
                        return this.getPartPromise(name, params);
                    }else
                    {
                        //reject Promise
                        failed = true;
                        reject(new Error(name+" is not a correct part's name"));
                        return null;
                    }
                }, _this);
                if(failed)
                {
                    return;
                }
                Promise.all(promises).then(function(values:any[])
                {
                    //TODO:weird le data.read devrait être dans le filter ?
                    values.filter(function(data:any):boolean{ return data!==true && !data.read?true:false;}).map(function(data:any){
                        data.read = true;
                        return data.data[0];}).forEach(this.readExternal, _this);
                    accept();
                }.bind(_this), reject);
            });
            return promise;
        }
        ///END PROMISES




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

        public executePartRequest(name:string, params:any = null, ajaxOptions:any = null):Promise<any>
        {
            var promise:Promise<any> = new Promise<any>((resolve:any, reject:any):void=>
            {
                var request:any = this.getPartRequest(name, params);
                request.retry = ghost.io.RETRY_INFINITE;
                request.url = this.getRootURL()+request.url;
                request = ghost.utils.Objects.mergeObjects(request, ajaxOptions);
                ghost.io.ajax(request).then(resolve, reject);
            });

            return promise;
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
            return ghost.mvc.Application.getRootURL();
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

                var url:string = this.getDataURLForServer();
                if(!url)
                {
                    if(callback)
                    {
                        callback();
                    }
                    return;
                }
                this._retrieving = true;
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

                    },( error.status==500  || error.status==404?(++times):1)*500);
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

        /**
         * Override this function to modify how reset is handled
         * @param name Part's name
         */
        protected reset(name:string):void
        {
            this.data = {};
        }
        //TODO:futur me, check if some models override toObject() function instead of this one for ractive templates
      /*  public toRactive():any
        {
            return this.toObject();
        } */
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

    export interface IPartRequest
    {
        method?:string;
        url?:string;
        data?:any;
        /**
         * If set to false, it will replay the ajax request each times. default:true
         */
        cache?:boolean;
        /**
         * If set to true, it will erase data each times the part is requested. default:false
         */
        reset?:boolean;

    }


}
