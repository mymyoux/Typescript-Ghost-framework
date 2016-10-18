///<lib="es6-promise"/>
///<module="io"/>
///<module="framework/ghost/events"/>
///<module="framework/ghost/utils"/>
///<module="data"/>
module ghost.browser.api
{

    import Objects = ghost.utils.Objects;
    import EventDispatcher = ghost.events.EventDispatcher;
    import CancelablePromise = ghost.io.CancelablePromise;
    import Arrays = ghost.utils.Arrays;
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
            if(!this._config)
            {
                this._config = {};
            }
            for(var p in options)
            {
                this._config[p] = options[p];
            }
            if (options.url)
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
            request.retry = this._config.retry != undefined ? this._config.retry:ghost.io.RETRY_INFINITE;
            request.url = this._config.url+this._controller+"/"+this._action+(this._id!=undefined?'/'+this._id:'');

            if (request.url.indexOf(window.location.hostname) == -1 && !window['EXTENSION_CONFIG'])
            {
                //crossdomain
                request.dataType = "jsonp";

            }
            return request;
        }
        protected parseResult(data:any):any
        {
            return data;
        }
        protected getPromise():Promise<any>
        {
               var request:any = this.getRequest();
               return  <any>ghost.io.ajax(request);
        }

    }
    class CacheManager {
        protected _api:APIExtended;
        protected _local: ghost.browser.data.LocalForage;
        protected _instance:string;
        protected _initialized:boolean;
        public instance():string
        {
            if(!this._instance)
            {
                this._instance = this.generateUniqueID();
            }
            return this._instance;
        }
        public war(name?:string): ghost.browser.data.LocalForage {
            if(!this._local)
            {
                name = "apicache_"+(name?name:"");
                this._local = ghost.forage.warehouse(name);
            }
            return this._local;
        }
        public add(request: any): string {
            if (!this._initialized)
            {
                debugger;
            }
            request._instance = this.instance();
            var token: string = this.generateUniqueID();
            this.war().setItem(token, request);
            return token;
        }
        public clear():Promise<any>
        {
            return this.war().clear();
        }
        public remove(token: string): void {
            this.war().removeItem(token);
        }
        protected generateUniqueID(): string {
            return ghost.utils.Strings.getUniqueToken();
        }
        public init(name:string = null):void
        {
            if (this._initialized)
            {
                return;
            }
            if(name)
            {
                this._local = null;
                this.war(name);
            }
            this._initialized = true;

            this.war().keys().then((keys:string[]) => {
                if (!keys || !keys.length)
                {
                    return;
                }
                this._api = APIExtended.request().stack(true);
                keys.forEach((key:string):void=>
                {
                    this.war().getItem(key).then((request:any):void=>
                    {
                        if(!request)
                        {
                            this.war().removeItem(key);
                            return;
                        }
                        if(request._instance != this.instance())
                        {
                            console.warn("api -reexecute: ", request);
                            if(request.data)
                            {
                                if(request.data._reloaded_count == undefined)
                                {
                                    request.data._reloaded_count = 0;
                                }
                                request.data._reloaded_count++;
                                this.war().setItem(key, request);
                            }

                            this._api.then(key, request);
                        }else
                        {
                            console.warn("api -ignore: ", request);
                        }
                    }, (error:any):void=>
                    {
                        debugger;
                    });
                });
        }, () => {
                debugger;
            });
        }
    }

    export class APIExtended extends API<APIExtended>
    {
        private static _always: any[] = [];
        private static _cacheManager: CacheManager = new CacheManager();
        protected static _initialized:boolean;
        protected static _id_user:string;
        protected static middlewares:any[] = [];

        public static init(id:string , name?:string):void
        {
            if (APIExtended._initialized === true)
            {
                return;
            }
            APIExtended._initialized  = true;
            APIExtended._id_user = id;
            APIExtended._cacheManager.init(name?name:"cache_"+id);
            /*
            APIExtended._cacheManager.keys().then(()=>
            {
                debugger;
            }, ()=>
            {
                debugger;
            });    */


        }
        protected getRequest(): any {
            var request: any = super.getRequest();
            if(request.data)
            {
                request.data._id = ghost.utils.Strings.getUniqueToken();
                request.data._instance = APIExtended._cacheManager.instance();
                request.data._timestamp = Date.now();
            }
            return request;
        }
        public static clearCache():Promise<any>
        {
            return this._cacheManager.clear();
        }

        protected lastRequest: any;
        private _services:any[];
        private _apiData:any;
        private _direction:number[] = [1];
        private _cacheLength: number;
        private _name: string;
        private _always: boolean;
        private _stack: boolean = false;
        public _instance:number = ghost.utils.Maths.getUniqueID();
        protected _previousPromise: CancelablePromise<any>;
        protected _stacklist: any[];
        public static instance(inst?:API<any>):APIExtended
        {
            return <APIExtended>API.instance(inst);
        }
        public getLastRequest():any
        {
            return this.lastRequest;
        }
        public constructor()
        {
            super();
            this._services = [];
            this._stacklist = [];
        }
        public cache(quantity: number): APIExtended
        {
            this._cacheLength = quantity;
            return this;
        }
        public always(value:boolean):APIExtended
        {
            this._always = value;
            return this;
        }
        public name(name:string):APIExtended
        {
            this._name = name;
            return this;
        }
        public method(method: string): APIExtended {
            if(method != "GET" && this._always == undefined)
            {
                this._always = true;
            }
            return <APIExtended>super.method(method);
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
        protected removeService(serviceName:string, property?:string):APIExtended
        {

            var i:number = 0;
            while(i<this._services.length)
            {
                if (this._services[i].name == serviceName && (!property || this._services[i].property == property))
                {
                    this._services.splice(i, 1);
                }else
                {
                    i++;
                }
            }
            return this;
        }
        public order(id:string|string[], direction:number|number[] = 1):APIExtended
        {
            if(typeof direction == "number")
            {
                direction = [direction];
            }
            if (typeof id == "string") {
                id = [id];
            }
            if(direction.length != id.length)
            {
                debugger;
                throw new Error("direction != keys");
            }
            this._direction = direction;
            return this.service("paginate", "key", id).service("paginate","direction", direction);
        }
        public param(param:string, data:any):APIExtended
        {
            if(!this._data)
            {
                this._data = {};
            }
            if(data && data.writeExternal)
            {
                data = data.writeExternal();
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
            var keys = ["allowed", "direction", "key", "limit", "previous", "next"];
            if(data.paginate)
            {
                if(!this._apiData.paginate)
                {
                    this._apiData.paginate = {};
                }


                if(data.paginate.next)
                {
                    this._apiData.paginate.next = data.paginate.next;
                    var isNextAll: boolean = !this._apiData.paginate.nextAll;
                    if (!isNextAll)
                    {
                        isNextAll = true;
                        for (var i: number = 0; i < data.paginate.next.length; i++)
                        {
                            if (!((this._apiData.paginate.nextAll[i] < data.paginate.next[i] && this._direction[i] > 0) || (this._apiData.paginate.nextAll[i] > data.paginate.next[i] && this._direction[i] <0 )))
                            {
                                if (this._apiData.paginate.nextAll[i] == data.paginate.next[i]) {
                                    continue;
                                }
                                isNextAll = false;
                                break;
                            }else{
                                break;
                            }
                        }
                    }

                    if (isNextAll)
                    {
                        this._apiData.paginate.nextAll = data.paginate.next;
                    }

                }
                if(data.paginate.previous)
                {
                    this._apiData.paginate.previous = data.paginate.previous;

                    var isPreviousAll: boolean = !this._apiData.paginate.previousAll;
                    if (!isPreviousAll) {
                        isPreviousAll = true;
                        for (var i: number = 0; i < data.paginate.previous.length; i++) {
                            if (!((this._apiData.paginate.previousAll[i] > data.paginate.previous[i] && this._direction[i] > 0) || (this._apiData.paginate.previousAll[i] < data.paginate.previous[i] && this._direction[i] < 0))) {
                                if (this._apiData.paginate.previousAll[i] == data.paginate.previous[i]) {
                                    continue;
                                }
                                isPreviousAll = false;
                                break;
                            } else {
                                break;
                            }
                        }
                    }

                    if (isPreviousAll) {
                        this._apiData.paginate.previousAll = data.paginate.previous;
                    }

                  /*  if(!this._apiData.paginate.previousAll || (this._apiData.paginate.previousAll> data.paginate.previous && this._direction>0) || (this._apiData.paginate.previousAll< data.paginate.previous && this._direction<0) )
                    {
                        this._apiData.paginate.previousAll = data.paginate.previous;
                    }*/

                }
                if (data.paginate.limit)
                    this._apiData.paginate.limit = data.paginate.limit;

                for(var p in data.paginate)
                {
                    if(keys.indexOf(p)==-1)
                    {
                        this._apiData[p] = data.paginate[p];
                    }
                }
            }
            keys.push("paginate");
            for(var p in data)
            {
                if(keys.indexOf(p) == -1)
                {
                    this._apiData[p] = data[p];
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
        public cancel():APIExtended
        {
            //TODO:remove saved ones
            if(this._stack && this._stacklist.length )
            {
                var popped:any = this._stacklist.pop();
                if(popped.reject)
                {
                    popped.reject("abort");
                }
                return this;
            }
            if(this._previousPromise){
                this._previousPromise.cancel();
                this._previousPromise = null;
            }
            return this;
        }
        public cancelAll():APIExtended
        {
            while(this._stacklist.length)
            {
                console.error("CANCEL");
                var popped: any = this._stacklist.pop();
                if (popped.reject) {
                    popped.reject("abort");
                }
            }
            if (this._previousPromise) {
                console.error("CANCEL");
                this._previousPromise.cancel();
                this._previousPromise = null;
            }
            console.error(this._instance);
            return this;
        }
        public stack(value:boolean):APIExtended{
            this._stack = value;
            if (value && !this._stacklist)
            {
                this._stacklist = [];
            }
            return this;
        }

        public then(token?:string, request?:any): APIExtended
        public then(resolve?: any, reject?: any): APIExtended
        public then(resolve?: any, reject?: any): APIExtended {
            var request: any;
            var token:string;
            if(typeof resolve == "string")
            {
                token = resolve;
                resolve = null;
                request = reject;
                reject = null;
            }
            if(!request)
            {
                request = this.getRequest();
            }
            if(this._always && !token)
            {
                token = APIExtended._cacheManager.add(request);
            }
            /* if(!this._promise)
             {
                 this._promise = this.getPromise();
             }*/

            if(this._stack && this._previousPromise)
            {
                //stack et already existing promise;
                this._stacklist.push({ resolve: resolve, reject: reject, request: request, token:token});
                return this;
            }
            return this._then(request, resolve, reject, token);
        }
        protected _then(request:any, resolve:any, reject:any, token:string):APIExtended
        {
            for (var p in APIExtended.middlewares) {
                if (APIExtended.middlewares[p].request) {
                    APIExtended.middlewares[p].request(request);
                }
            }
            this.lastRequest = request;
            var promise = ghost.io.ajax(request, {asObject:true});//this.getPromise();
            this._previousPromise = promise;
            promise.then((rawData: any) => {
                if (promise === this._previousPromise) {
                    this._previousPromise = null;
                }
                this._next();
                var data: any;
                if (rawData && rawData.data) {
                    data = rawData.data;
                }
                if (data && token)
                {
                       APIExtended._cacheManager.remove(token);
                }

                // this._promise = null;
                if (data && data.error) {
                    if (reject)
                        reject(data);
                    return;
                }

                var parsed: any = this.parseResult(data);
                this.trigger(API.EVENT_DATA, data);
                if (resolve)
                    resolve.call(this, parsed, data);
            }, (error: any) => {
                if (promise === this._previousPromise) {
                    this._previousPromise = null;
                }
                var reason: string = "unknown";
                if (error && token)
                {
                    if (error.jqXHR && error.jqXHR.status != undefined)
                    {
                        var status: number = error.jqXHR.status;
                        if(status>=200 && status<400)
                        {
                            var good_user:boolean = true;
                            //server good real error
                            if (error.data) {
                                var data: any = error.data;
                                if (data.state_user && data.state_user.id_user != APIExtended._id_user) {
                                    //error but bad user id
                                    good_user = false;
                                }
                                if(data.api_error_code != undefined)
                                {
                                    if (good_user)
                                    {
                                        APIExtended._cacheManager.remove(token);
                                    }
                                }
                            }
                        }

                    }

                }
                if(error && error.errorThrown)
                {
                    reason = error.errorThrown;
                }
                this._next();

                if (reject)
                    reject(reason);
            });
            return <any>this;
        }
        protected _next():void
        {
            if (!this._previousPromise && this._stacklist && this._stacklist.length)
            {
                var next: any = this._stacklist.shift();
                this._then(next.request, next.resolve, next.reject, next.token);
            }
        }
        public reset():APIExtended
        {
            this._data = {};
            this.removeService("paginate", "next");
            this.removeService("paginate", "previous");
            this._apiData = null;
            return this;
        }
        public addMiddleware(middleware: IMiddleWare | Function): void {
            if (typeof middleware == "function") {
                middleware = { request: <any>middleware };
            }
            APIExtended.middlewares.push(middleware);
        }

    }

    export interface IAPIOptions
    {
        url?:string;
        retry?: any;
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
    export interface IMiddleWare {

        request?: (data: any) => any | void;
    }
}
