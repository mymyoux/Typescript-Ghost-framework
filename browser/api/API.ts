//convert
 /*:ghost.browser.io.RETRY_INFINITE;*/
import {RETRY_INFINITE} from "browser/io/Ajax";
//convert
 /*>ghost.browser.io.ajax(*/
import {ajax} from "browser/io/Ajax";

//convert-files
import {IMiddleWare} from "./IMiddleWare";
//convert-files
import {IAPIOptions} from "./IAPIOptions";
///<module="io"/>
///<module="framework/ghost/events"/>
///<module="framework/ghost/utils"/>
///<module="data"/>


    //convert-import
import {Objects} from "ghost/utils/Objects";
    //convert-import
import {EventDispatcher} from "ghost/events/EventDispatcher";
    //convert-import
import {CancelablePromise} from "ghost/io/CancelablePromise";
    //convert-import
import {Arrays} from "ghost/utils/Arrays";
    export abstract class API<T extends API<any>> extends EventDispatcher
    {
        public static EVENT_DATA:any = "event_data";
        public static EVENT_DATA_FORMATTED:any = "event_data_formatted";
        private static _instance:API<any>;
        protected static _instances: any = {};
        public static instance(name?:string, cls?:API<any>):API<any>
        public static instance(cls?:API<any>):API<any>
        public static instance(name?:any, cls?:API<any>):API<any>
        {
            if (!cls && name)
            {
                if(typeof name != "string")
                {
                    cls = name;
                    name = null;
                }
            }

            if(name && typeof name == "string")
            {
                if(!API._instances[name])
                {
                    if(!cls)
                    {
                        debugger;
                    }
                    API._instances[name] = cls;//cls?cls:new APIExtended();
                    API._instances[name].instance_name = name;
                } 
                return API._instances[name];
            }
            else
            {
                if(cls || !API._instance)
                {
                    if(!cls)
                    {
                        debugger;
                    }
                    API._instance = cls;//?cls:new APIExtended();
                }
            }
            return API._instance;
        }
        public static hasInstance(name:string):boolean
        {
            return API._instances[name] != null;
        }
        public static getAllInstances():API<any>[]
        {
            var instances: API<any>[] = [];
            instances.push(API._instance);
            for(var p in API._instances)
            {
                instances.push(API._instances[p]);
            }
            return instances;
        } 
        public static request():API<any>
        {
            return API.instance().request();
        }

        public instance_name: string = "default";
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
        public done():Promise<any>
        {
            var promise: Promise<any> = new Promise<any>((resolve: any, reject: any): void => {
                this.then((data: any): void => {
                    resolve(data);
                }, (error) => {
                    reject(error);
                });
            });

            return promise.then();
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
            if(request.data instanceof FormData)
            {
                request.data.append('method', this._method?this._method:'GET');
            }else
            {
                request.data.method = this._method?this._method:'GET';
            }
        //      request.data.__timestamp = Date.now();
            request.retry = this._config.retry != undefined ? this._config.retry:RETRY_INFINITE;
            request.url = this._config.url+this._controller+"/"+this._action+(this._id!=undefined?'/'+this._id:'');

           // var temp: string[] = window.location.hostname.split(".");
            //var short: string = temp[temp.length - 2] + "." + temp[temp.length - 1];
            var short: string = "/"+window.location.hostname+"/";   
            if (this._config.jsonp/* || (request.url.indexOf(short) == -1 && !window['EXTENSION_CONFIG'])*/)
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
               return  <any>ajax(request);
        }

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
  
