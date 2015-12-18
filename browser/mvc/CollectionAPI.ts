///<file="Collection.ts"/>
///<module="api"/>
namespace ghost.mvc
{
    import API = ghost.browser.api.API;
    import APIExtended = ghost.browser.api.APIExtended;
    import Arrays = ghost.utils.Arrays;
    import IBinaryResult = ghost.utils.IBinaryResult;
    /**
     * Collection API class
     */
    export class CollectionAPI<T extends IModel> extends Collection<T>
    {
        private _order:string;
        private requests:any;
        public constructor()
        {
            super();
            this.requests = {};
        }
        public order(order:string, direction:number = 1):void
        {
            this._order = order;
            if(this.length())
            {
                this.sort(function(modelA:T, modelB:T):number
                {
                    if(modelA[order] > modelB[order])
                    {
                        return direction>0 ? -1 : 1;
                    }
                    if(modelA[order] < modelB[order])
                    {
                        return direction>0 ? 1 : -1;
                    }
                    return 0;
                });
            };

        }

        protected onPartData(name:string, data:any):void
        {
            if(name == Model.PART_DEFAULT)
                this.readExternal(data);
        }
        protected _getRequest(part?:string, params?:any ):APIExtended
        {
            if (typeof part !== "string")
            {
                part = Model.PART_DEFAULT;
            }

            if (!this.requests[part])
            {
                this.requests[part] = this.getRequest(part, params);
                this.requests[part].on(API.EVENT_DATA_FORMATTED, this.onPartData.bind(this, part));
            }

            return this.requests[part];
        }
        public next(part:string, quantity:number):APIExtended
        public next(quantity:number):APIExtended
        public next():APIExtended
        public next(part:any = null, quantity?:number):APIExtended
        {
            if(typeof part == "number")
            {
                quantity = part;
                part = null;
            }
            var request:any = this._getRequest(part);
            if(request)
            {
                return request.next(quantity);
            }

            return null;
        }
        public nextAll(part:string, quantity:number):APIExtended
        public nextAll(quantity:number):APIExtended
        public nextAll():APIExtended
        public nextAll(part:any = null, quantity?:number):APIExtended
        {
            if(typeof part == "number")
            {
                quantity = part;
                part = null;
            }
            var request:any = this._getRequest(part);
            if(request)
            {
                return request.nextAll(quantity);
            }
            return null;
        }
        public previous(part:string, quantity:number):APIExtended
        public previous(quantity:number):APIExtended
        public previous():APIExtended
        public previous(part:any = null, quantity?:number):APIExtended
        {
            if(typeof part == "number")
            {
                quantity = part;
                part = null;
            }
            var request:any = this._getRequest(part);
            if(request)
            {
                return request.previous(quantity);
            }
            return null;
        }
        public previousAll(part:string, quantity:number):APIExtended
        public previousAll(quantity:number):APIExtended
        public previousAll():APIExtended
        public previousAll(part:any = null, quantity?:number):APIExtended
        {
            if(typeof part == "number")
            {
                quantity = part;
                part = null;
            }
            var request:any = this._getRequest(part);
            if(request)
            {
                return request.previousAll(quantity);
            }
            return null;
        }
        protected hasPart(name:string, params:any = null):boolean
        {
            return this._partsPromises[name] || this.getRequest(name, params)!=null;//name == "default";
        }

        public retrieveData(data:string[] = [Collection.PART_DEFAULT], params:any = null):Promise<any>
        {
            if(!data)
            {
                data = [Collection.PART_DEFAULT];
            }
            var _this:Collection<any> = this;
            var promise:Promise<any> = new Promise<any>(function(accept:any, reject:any):void
            {

                var failed:boolean = false;
                var promises:Promise<any>[] = data.map(function(name:string)
                {
                    if(this.hasPart(name, params))
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
                    //TODO:weird le data.read devrait être dans le filter ? MAIS VA TE FAIRE FOUTRE CHROME
                    values.filter(function(data:any):boolean{ return data!==true && !data.read?true:false;}).map(function(data:any){
                        data.read = true;
                        return data.data[0];})//.forEach(this.readExternal, _this);
                    accept();
                }.bind(_this), reject);
            });
            return promise;
        }

        protected getPartPromise(name:string, params:any = null):Promise<any>|boolean
        {
            if(!this.hasPart(name, params))
            {
                return null;
            }
            if(!this._partsPromises[name])
            {
                var request:API<API<any>> = this._getRequest(name, params); //this.getRequest(name, params);



              //  this.requests[name] = request;

                this._partsPromises[name] = new Promise<any>((accept, reject)=>
                {
                    var _self:any = this;
                    request
                        .then(function()
                        {
                            _self._partsPromises[name] = true;
                            accept.call(null, {data:Array.prototype.slice.call(arguments),read:false});

                        },reject);
                });
            }
            return this._partsPromises[name];
        }

        /**
         * Gets default controller for api request
         * @returns {string}
         */
        protected controller():string
        {
            return this.name();
        }
        protected getRequest(name:string, params:any = null):API<API<any>>
        {
            switch(name)
            {
                case Model.PART_DEFAULT:
                    return API.instance().controller(this.controller()).action(this.name());
                    break;
            }
            return null;
        }
        public getModelByID(id:any):T
        {
            var id_name:string = this.getModelIDName();
            var len:number = this._models.length;
            for(var i:number=0; i<len; i++)
            {
                if(this._models[i] && this._models[i][id_name] == id)
                {
                    return this._models[i];
                }
            }
            return null;
        }
        protected getModelIDName():string
        {
            var cls:any = this.getDefaultClass();
            if(typeof cls.getIDName != "function")
            {
                debugger;
                throw new Error("[API ERROR] Child class must have a static method getIDName()");
            }
           return cls.getIDName();
        }
        /**
         * @protected
         * @type {[type]}
         */
        public _onChange( model:T):void
        public _onChange(key:string, model:T):void
        public _onChange(key:any, model?:T):void
        {
            if(typeof key != "string")
            {
                model = key;
                key = null;
            }

            if(model)
            {
                this._triggerUpdate(model);
            }else
            {
                debugger;
            }
        }
        private t = 0;
        public push(...models:T[]):number
        {
            var index:number;
            var model:T;
            for(var p in models)
            {
                model = models[p]
                if((index = this._models.indexOf(model))==-1)
                {
                    //if list ordonned
                    if(this._order)
                    {
                        var result:IBinaryResult = Arrays.binaryFind(this._models, model, this._order);
                        if(result.index == undefined)
                        {
                            //handle order
                               this._models.push(model);
                        }else
                        {
                            this._models.splice(result.index, 0, model);
                            model["added"] = this.t++ + "-"+result.index;
                        }
                    }else
                    {
                        this._models.push(model);
                    }
                    this._add(model);
                }else
                {
                    console.warn("already into collection:", model);
                }
            }

            return this.length();
        }
        public readExternal(input:any[]):void
        {
            if(input)
            {
                if(input.forEach)
                    input.forEach(function(rawModel:any):void
                    {
                        if(rawModel.__class)
                        {
                            var model:T = <any>Model.get(rawModel.__class);
                            model.readExternal(rawModel);
                            this.push(model);
                        }else
                        {
                            if(typeof rawModel == "object")
                            {
                                var cls:any = this.getDefaultClass();
                                var id:string = this.getModelIDName();
                                var model:T;
                                if(rawModel && rawModel[id] != undefined)
                                {
                                    model = this.getModelByID(rawModel[id] );
                                }
                                if(!model)
                                {
                                    model  = <any>Model.get(cls);
                                    model.readExternal(rawModel);
                                    this.push(model);
                                }else
                                {
                                    model.readExternal(rawModel);
                                }

                                this.trigger(Collection.EVENT_CHANGE, model);
                            }else
                            {
                                console.error("RawModel must be object, given ", rawModel);
                            }
                        }
                    }, this);
            }
        }
        public toRactive():any
        {
            return this;
        }
    }
}