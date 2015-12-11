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
            if(typeof part == "string")
            {
                return this.requests[part];
            }else
            {
                return  this.requests[ Model.PART_DEFAULT];
            }
            return null;
        }
        public next(part:string, quantity:number):APIExtended
        public next(quantity:number):APIExtended
        public next():APIExtended
        public next(part:any = null, quantity:number = 10):APIExtended
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
        public nextAll(part:any = null, quantity:number = 10):APIExtended
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
        public previous(part:any = null, quantity:number = 10):APIExtended
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
        public previousAll(part:any = null, quantity:number = 10):APIExtended
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
        protected getPartPromise(name:string, params:any = null):Promise<any>|boolean
        {
            if(!this.hasPart(name, params))
            {
                return null;
            }
            if(!this._partsPromises[name])
            {
                var request:API<API<any>> = this.getRequest(name, params);
                this.requests[name] = request;

                this._partsPromises[name] = new Promise<any>((accept, reject)=>
                {
                    var _self:any = this;
                    request
                        .then(function()
                        {
                            _self._partsPromises[name] = true;
                            accept.call(null, {data:Array.prototype.slice.call(arguments),read:false});

                            request.on(API.EVENT_DATA_FORMATTED, _self.onPartData.bind(_self, name));
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
            debugger;
        }
    }
}
