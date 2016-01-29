///<lib="es6-promise"/>
///<module="io"/>
///<module="framework/ghost/events"/>
///<module="framework/ghost/utils"/>
module ghost.browser.api
{

    import Objects = ghost.utils.Objects;
    import EventDispatcher = ghost.events.EventDispatcher;
    export abstract class API<T extends API<any>> extends EventDispatcher
    {
        public static EVENT_DATA:any = "event_data";
        public static EVENT_DATA_FORMATTED:any = "event_data_formatted";
        private static _instance:API<any>;
        public static instance(inst?:API<any>):API<any>
        {
            if(inst || !API._instance)
            {
                API._instance = inst?inst:new APIExtended();
            }
            return API._instance;
        }
        public static request():API<any>
        {
            return API.instance().request();
        }


        protected _controller:string;
        protected _action:string;
        protected _method:string;
        protected _data:any;
        protected _id:string;
        protected _promise:Promise<any>;
        protected _config:IAPIOptions;


        public request():T
        {
            var cls:any = this["constructor"];
            var c:T = new cls();
            if(this._config && c !== API._instance)
            {
                c.config(this._config);
            }
            return c;
        }
        public clone():T
        {
            var clone:T = this.request();

            clone.controller(this._controller)
            .action(this._action)
            .id(this._id)
            .data(this._data)
            .method(this._method);

            return clone;
        }
        public config(options:IAPIOptions):T
        {
            this._config = options;
            if(this._config.url)
            {
                if(this._config.url.substr(-1, 1) != "/")
                {
                    this._config.url+="/";
                }
            }
            return <any>this;
        }
        public controller(controller:string):T
        {
            this._controller = controller;
            return <any>this;
        }
        public method(method:string):T
        {
            this._method = method;
            return <any>this;
        }
        public data(data:any):T
        {
            this._data = data;
            return <any>this;
        }
        public action(action:string):T
        {
            this._action = action;
            return <any>this;
        }
        public id(id:number):T
        public id(id:string):T
        public id(id:any):T
        {
            this._id = id+"";
            return <any>this;
        }
        public then(resolve?:any, reject?:any):T
        {
           /* if(!this._promise)
            {
                this._promise = this.getPromise();
            }*/
            var promise = this.getPromise();
            promise.then((data:any)=>
            {
               // this._promise = null;
                if(data && data.error)
                {
                    if(reject)
                    reject(data);
                    return;
                }
                var parsed:any = this.parseResult(data);
                this.trigger(API.EVENT_DATA, data);
                if(resolve)
                    resolve(parsed, data);
            }, reject);
            return <any>this;
        }
        public done():T
        {
            return this.then();
        }
        protected getConfig(name:string):any
        {
            if(this._config && this._config[name])
            {
                return this._config[name];
            }
            if(API.instance()._config && API.instance()._config[name])
            {
                return API.instance()._config[name];
            }
            return null;
        }
        protected hasData():boolean
        {
            return this._data != null;
        }
        protected getData():any
        {
            return this._data;
        }
        protected getRequest():any
        {
            var request:any = {};
            //request.method = this._method?this._method:'GET';
            request.method = "POST";
            var data: any = this.getData();
            if (data)
                request.data = data;

            if(!request.data)
            {
                request.data = {};
            }
            request.data.method = this._method?this._method:'GET';
        //      request.data.__timestamp = Date.now();
            request.retry = ghost.io.RETRY_INFINITE;
            request.url = this._config.url+this._controller+"/"+this._action+(this._id!=undefined?'/'+this._id:'');
            return request;
        }
        protected parseResult(data:any):any
        {
            return data;
        }
        protected getPromise():Promise<any>
        {
               var request:any = this.getRequest();
               return  ghost.io.ajax(request);
        }

    }
    export class APIExtended extends API<APIExtended>
    {
        private _services:any[];
        private _apiData:any;
        private _direction:number = 1;
        public static instance(inst?:API<any>):APIExtended
        {
            return <APIExtended>API.instance(inst);
        }
        public constructor()
        {
            super();
            this._services = [];
        }
        public getAPIData():any
        {
            return this._apiData;
        }
        public static request():APIExtended
        {
            return <APIExtended>API.instance().request();
        }
        protected hasData():boolean
        {
            return this._data != null || this._services.length!=0;
        }
        protected getData():any
        {
            var data:any = this._data?Objects.clone(this._data):{};
            data = this._services.reduce(function(previous:any, item:any):any
            {
                if(!previous[item.name])
                    previous[item.name] = {}
                previous[item.name][item.property] = item.data;
                return previous;
            }, data);
            return data;
        }
        public echo():APIExtended
        {
            return this.request().controller("echo").action("echo");
        }
        public test():void{
            debugger;
        }
        protected service(serviceName:string, property:string, data):APIExtended
        {
            this.removeService(serviceName, property);
            this._services.push({name:serviceName, property:property, data:data});
            return this;
        }
        protected removeService(serviceName:string, property:string):APIExtended
        {
            for(var p in this._services)
            {
                if(this._services[p].name == serviceName && this._services[p].property == property)
                {
                    this._services.splice(p, 1);
                }
            }
            return this;
        }
        public order(id:string, direction:number = 1):APIExtended
        {
            this._direction = direction;
            return this.service("paginate", "key", id).service("paginate","direction", direction);
        }
        public param(param:string, data:any):APIExtended
        {
            if(!this._data)
            {
                this._data = {};
            }
            this._data[param] = data;
            return this;
        }
        public paginate(key:string):APIExtended
        {
            return this.service("paginate", "key", key);
        }
        public limit(size:number):APIExtended
        {
            return this.service("paginate", "limit", size);
        }
        protected parseResult(data:any):any
        {
            if(data.api_data)
            {
                this.parseAPIData(data.api_data);
                if(data.api_data.key &&  data.data)
                {
                    this.trigger(API.EVENT_DATA_FORMATTED, data.data[data.api_data.key]);
                }
                return data.data[data.api_data.key];
            }
            return data;
        }
        protected parseAPIData(data:any):void
        {
            if(!data)
            {
                return;
            }
            if(!this._apiData)
            {
                this._apiData = {};
            }
            if(data.paginate)
            {
                if(!this._apiData.paginate)
                {
                    this._apiData.paginate = {};
                }
                if(data.paginate.next)
                {
                    this._apiData.paginate.next = data.paginate.next;
                    if(!this._apiData.paginate.nextAll || (this._apiData.paginate.nextAll< data.paginate.next && this._direction>0) || (this._apiData.paginate.nextAll> data.paginate.next && this._direction<0) )
                    {
                        this._apiData.paginate.nextAll = data.paginate.next;
                    }

                }                                                                                                                                                           https://lacontrerevolution.wordpress.com/2015/11/30/attentats-avant-les-elections-une-simple-coincidence/https://lacontrerevolution.wordpress.com/2015/11/30/attentats-avant-les-elections-une-simple-coincidence/
                if(data.paginate.previous)
                {
                    this._apiData.paginate.previous = data.paginate.previous;
                    if(!this._apiData.paginate.previousAll || (this._apiData.paginate.previousAll> data.paginate.previous && this._direction>0) || (this._apiData.paginate.previousAll< data.paginate.previous && this._direction<0) )
                    {
                        this._apiData.paginate.previousAll = data.paginate.previous;
                    }

                }
                var keys = ["allowed","direction","key","limit","previous","next"];
                for(var p in data.paginate)
                {
                    if(keys.indexOf(p)==-1)
                    {
                        this._apiData[p] = data.paginate[p];
                    }
                }
            }
        }

        public next(quantity?:number):APIExtended
        {
            if(this._apiData && this._apiData.paginate)
            {
                this.removeService("paginate", "previous");
                this.service("paginate", "next", this._apiData.paginate.next);
                if(quantity != undefined)
                {
                    this.service("paginate", "limit", quantity);
                }
            }else
            {
                throw new Error("No previous data");
            }
            return <any>this;
        }
        public nextAll(quantity?:number):APIExtended
        {
            if(this._apiData && this._apiData.paginate)
            {
                this.removeService("paginate", "previous");
                this.service("paginate", "next", this._apiData.paginate.nextAll);
                if(quantity != undefined)
                {
                    this.service("paginate", "limit", quantity);
                }
            }else
            {
                //throw new Error("No previous data");
            }
            return <any>this;
        }
        public previous(quantity?:number):APIExtended
        {
            if(this._apiData && this._apiData.paginate)
            {
                this.service("paginate", "previous", this._apiData.paginate.previous);
                this.removeService("paginate", "next");
                if(quantity != undefined)
                {
                    this.service("paginate", "limit", quantity);
                }
            }else
            {
                throw new Error("No previous data");
            }
            return <any>this;
        }
        public previousAll(quantity?:number):APIExtended
        {
            if(this._apiData && this._apiData.paginate)
            {
                this.service("paginate", "previous", this._apiData.paginate.previousAll);
                this.removeService("paginate", "next");
                if(quantity != undefined)
                {
                    this.service("paginate", "limit", quantity);
                }
            }else
            {
             //   throw new Error("No previous data");
            }
            return <any>this;
        }
    }
    export interface IAPIOptions
    {
        url?:string;
    }


    /*
    var custom:APICustom = new APICustom();
    custom.controller("test").config({}).then(function()
    {
        debugger;
    }, function()
    {
        debugger;
    });*/
}
