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
        public next(part:string, quantity:number):APIExtended
        public next(quantity:number):APIExtended
        public next(part:any, quantity:number = 10):APIExtended
        {
            if(typeof part == "string")
            {
                //part
            }else
            {
                if(typeof part == "number")
                    quantity = part;
                part = Model.PART_DEFAULT;
            }

            if(this.requests[part])
            {
                return this.requests[part].next(quantity);
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

    }
}
