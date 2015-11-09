///<lib="es6-promise"/>
module ghost.browser.apis
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
        protected _id:string;
        protected _promise:Promise<any>;
        protected _config:IAPIOptions;


        public request():T
        {
            var cls:any = this["constructor"];
            var c:T = new cls();
            if(this._config && this !== API._instance)
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
            .id(this._id);

            return clone;
        }
        public config(options:IAPIOptions):T
        {
            this._config = options;
            return <any>this;
        }
        public controller(controller:string):T
        {
            this._controller = controller;
            return <any>this;
        }
        public action(action:string):T
        {
            this._action = action;
            return <any>this;
        }
        public id(id:string):T
        {
            this._id = id;
            return <any>this;
        }
        public then(success?:Function, fail?:Function):T
        {
            if(!this._promise)
            {
                this._promise = this.getPromise();
            }
            this._promise.then.call(this._promise, success, fail);
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
            return new Promise<any>(function(resolve:any, reject:any):void
            {
                resolve();
            });
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
            console.log(this._config);
            debugger;

        }
    }
    export interface IAPIOptions
    {

    }
    APICustom.instance((new APICustom()).config({url:window.location.href}));
    APICustom.instance().echo().then(function()
    {
        debugger;
    }, function()
    {
        debugger;
    });
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