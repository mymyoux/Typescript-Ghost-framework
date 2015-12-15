///<file="Collection.ts"/>
///<module="api"/>
namespace ghost.mvc
{
    import API = ghost.browser.api.API;
    import APIExtended = ghost.browser.api.APIExtended;
    /**
     * Collection API class
     */
    export class CollectionAPI<T extends ghost.mvc.Model> extends Collection<T>
    {
        private requests:any;
        public constructor()
        {
            super();
            this.requests = {};
        }
        protected onPartData(name:string, data:any):void
        {
            if(name == Model.PART_DEFAULT)
                this.readExternal(data);
        }
        protected _getRequest(part?:string):APIExtended
        {
            if (typeof part !== "string")
            {
                part = Model.PART_DEFAULT;
            }

            if (!this.requests[part])
            {
                this.requests[part] = this.getRequest(part);
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
            if(request);
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
            if(request);
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
            if(request);
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
            if(request);
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
                    debugger;
                    //TODO:weird le data.read devrait être dans le filter ?
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
                var request:API<API<any>> = this.getRequest(name, params);

                request.on(API.EVENT_DATA_FORMATTED, this.onPartData.bind(this, name));

                this.requests[name] = request;

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

        public readExternal(input:any[]):void
        {
            super.readExternal(input);
            // debugger;
        }
    }
}
