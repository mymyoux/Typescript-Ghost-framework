///<lib="es6-promise"/>
///<module="io"/>
module ghost.browser.api
{

    export abstract class API<T extends API<any>>
    {
        private static _instance:API<any>;
        public static instance(inst?:API<any>):API<any>
        {
            if(inst || !API._instance)
            {
                API._instance = inst?inst:new APICustom();
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
            if(!this._promise)
            {
                this._promise = this.getPromise();
            }
            this._promise.then(function(data:any)
            {
                if(data && data.error)
                {
                    reject(data);
                    return;
                }
                resolve(data);
            }, reject);
            return <any>this;
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
        protected getPromise():Promise<any>
        {
          /*  return new Promise<any>((resolve:any, reject:any):void=>
            {*/
                var request:any = {};
                request.method = this._method?this._method:'GET';
                if(this._data);
                    request.data = this._data;
                request.retry = ghost.io.RETRY_INFINITE;
                request.url = this._config.url+this._controller+"/"+this._action+(this._id!=undefined?'/'+this._id:'');
                console.log(request);
               return  ghost.io.ajax(request);//.then(resolve, reject);
            //});
        }
    }
    export class APICustom extends API<APICustom>
    {
        public static instance(inst?:API<any>):APICustom
        {
            return <APICustom>API.instance(inst);
        }
        public static request():APICustom
        {
            return <APICustom>API.instance().request();
        }
        public echo():APICustom
        {
            return this.request().controller("echo").action("echo");
        }
        public test():void{
            debugger;

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