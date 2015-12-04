///<file="Collection.ts"/>
///<module="api"/>
namespace ghost.mvc
{
    import API = ghost.browser.api.API;
    /**
     * Collection API class
     */
    export class CollectionAPI<T extends ghost.mvc.Model> extends Collection<T>
    {
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
