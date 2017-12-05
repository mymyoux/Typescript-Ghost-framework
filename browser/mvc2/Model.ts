import {CoreObject} from "ghost/core/CoreObject";
import {EventDispatcher} from "ghost/events/EventDispatcher"
import {Inst} from "./Inst";
import {Strings} from "ghost/utils/Strings";
import {LocalForage} from "browser/data/Forage";
import {API2} from "browser/api/API2";
import {Arrays} from "ghost/utils/Arrays";
import {Application} from "./Application";
export class Model extends CoreObject
{
    public static EVENT_CHANGE:string = "change";
    public static EVENT_FIRST_DATA:string = "first_data";
    public static EVENT_FORCE_CHANGE:string = "force_change";
    public static PATH_CREATE:()=>ModelLoadRequest =
        ()=>new ModelLoadRequest("%root-path%/create", null,{replaceDynamicParams:true,ignorePathLoadState:true, marksPathAsLoaded:false});
    public static PATH_GET:()=>ModelLoadRequest =
        ()=>new ModelLoadRequest("%root-path%/get", {'%id-name%':'%id%'}, {replaceDynamicParams:true});
    public static PATH_DELETE:()=>ModelLoadRequest =
        ()=>new ModelLoadRequest("%root-path%/delete", {'%id-name%':'%id%'}, {replaceDynamicParams:true,ignorePathLoadState:true, marksPathAsLoaded:false});
    public static PATH_UPDATE:()=>ModelLoadRequest =
        ()=>new ModelLoadRequest("%root-path%/update", {'%id-name%':'%id%'}, {replaceDynamicParams:true,ignorePathLoadState:true, marksPathAsLoaded:false});

    private _firstData:boolean;
    protected _pathLoaded:any = {};
    protected _modelName:string;
    public id:number;
    private _invalidated:boolean;
    public constructor()
    {
        super();
    }
    public get(key:string):any
    {
        if(!key || key.length==0)
        {
            throw new Error("Key must be defined - null given");
        }
        var methodName:string = "get"+key.substring(0,1).toUpperCase()+key.substring(1);
        if(this[methodName])
        {
            return this[methodName]();
        }
        return this[key];
    }
    public set(key:string, value:any):void
    {
        if(!key || key.length==0)
        {
            throw new Error("Key must be defined - null given");
        }
        var methodName:string = "set"+key.substring(0,1).toUpperCase()+key.substring(1);

        if(this[methodName])
        {
            return this[methodName](value);
        }else
        {
            //TODO:add possibility to set key.object1.name = 'value'
            this[key] = value;
        }
        this.triggerForceChange(key);
    }
    protected getIDName():string
    {
        var name:string = this.getModelName();
        return  "id_"+Strings.uncamel(name);
    }
    public getID():number
    {
        var id_name:string = this.getIDName();
        if(id_name && this[id_name])
            return this[id_name];
        if(this["id"])
        {
            return this["id"];
        }
        return null;
    }
    public setID(value:number):void
    {
        this.id = value;
        this[this.getIDName()] = value;
    }
    protected triggerChange(key:string):void
    {
        this._trigger(Model.EVENT_CHANGE, key, this[key]);
    }
     protected triggerForceChange(key:string = null):void
    {
        if(key)
            this._trigger(Model.EVENT_FORCE_CHANGE, key, this[key]);
        else
            this._trigger(Model.EVENT_FORCE_CHANGE);
    }
    protected _trigger(...params:any[]):void
    {
        if(this["trigger"])
        {
            (<any>this["trigger"])(...params);
        }
    }
     protected triggerFirstData(): void {
        if (!this._firstData) {
            this._firstData = true;
            setTimeout(() => {
                this._trigger(Model.EVENT_FIRST_DATA);
            }, 0);
        }
    }
    protected getRootPath():string
    {
        return this.getModelName();
    }
    public getModelName():string
    {
        if(!this._modelName)
        {
            var name:string = this.getClassName();
            name =  name.replace('Model', '').toLowerCase();
            if(typeof this == "function")
                return name;
            this._modelName = name;
        }
        return this._modelName;
    }
    protected _path(path:string):string
    {
       if(path.substring(0, 1)==".")
        {
            path = this.getRootPath()+"/"+path.substring(1);
        }
        return path;
    }
    protected api(name: string, api_name?:string): API2 {
        return API2.request(api_name).name(this.getClassName()+"_"+name);
    }
    public cache(): LocalForage {
        return LocalForage.instance().war(this.getClassName());
    }
    public readExternal(input:any, path:any = null):void
    {
        for(var p in input)
        {
            if(this[p] === undefined)
                this.invalidate();
            if(typeof this[p] == "function")
            {
                // console.warn("you overwrite function: "+p);
            }
            this[p] = input[p];
        }
        this.triggerFirstData();
        //this.data = input;
    }
    protected invalidate():void
    {
        this._invalidated = true;
    }
    protected isInvalidated():boolean
    {
        return this._invalidated;
    }
    protected validate():void
    {
        if(!this.isInvalidated())
            return;
        this._invalidated = false;
        this._trigger(Model.EVENT_FORCE_CHANGE);
    }
     /**
     * Returns model's data
     * @returns {any}
     */
    public writeExternal( remove_null_values = false ):any
    {
        var external: any = {};
        for(var p in this)
        {
            //TODO:check this not sure if needed
            // if(!this.hasOwnProperty(p))
            //     continue;
            if(typeof this[p] == "function")
            {
                continue;
            }
           
            if (Strings.startsWith(p, "_"))
            {
                continue;
            }

            if (remove_null_values === true && this[p] === null)
            {
                continue;
            }

            if(this[p] && typeof this[p] == "object" && typeof this[p]['writeExternal'] === 'function')
            {
                console.log("child writeExtenral", this[p]);
                external[p] = this[p]['writeExternal']( remove_null_values );
            }
            else
            {
                external[p] = this[p];
                // if(Arrays.isArray(external[p]))
                // {
                //     external[p] = this._writeExternal(external[p].slice());
                // }
            }
        }
        return external;
    }
    protected _writeExternal(data:any)
    {
        console.log(data);
        for(var i:number=0; i<data.length; i++)
        {
            //TODO:check this not sure if needed
            // if(!this.hasOwnProperty(p))
            //     continue;
            if(data[i] && typeof data[i] == "object" && typeof data[i]['writeExternal'] === 'function')
            {
                console.log("subchild writeExtenral", data[i]);
                data[i] = data[i]['writeExternal']( );
            }else
            if(Arrays.isArray(data[i]))
            {
                console.log("is array: ["+i+"]", data[i]);
                data[i] = this._writeExternal(data[i].slice());
            }
        }
        return data;
    }
    public static regexp = /%([^%]+)%/g;
    /**
     * Replace %key% in strings 
     *
     */
    protected replace(value:string):string
    {
        var results:any[] = value.match(Model.regexp);
        if(results)
        {
            results.map(function(key:string):string
            {
                return key.replace(/%/g,'');
            }).forEach((key:string):void=>
            {
                if(key == "root-path")
                {
                    value = value.replace('%root-path%', this.getRootPath());
                }else
                if(key == "id-name")
                {
                    value = value.replace('%id-name%', this.getIDName());
                }else
                if(key == "id")
                {
                    value = value.replace('%id%', ""+this.getID());
                }else
                {
                    if(this[key])
                    {
                        var v:any = this[key];
                        if(typeof v == "function")
                            v = v.call(this);
                        if(value == '%'+key+'%')
                        {
                            if(typeof v == "object")
                            {
                                //TODO:maybe json of that
                                value = v;

                                if(Arrays.isArray(v))
                                {
                                    value = v;
                                }
                            }else{
                                value = value.replace('%'+key+'%', v); 
                            }
                        }
                    }else if(value == '%'+key+'%')
                    {
                        value = null;
                    }
                }
            });
        }
        return value;
    }
    public loadGet(params?:any, config?:IModelConfig):Promise<any>
    {
        return this.load(this.constructor["PATH_GET"], params, config);
    }
    public loadCreate(params?:any, config?:IModelConfig):Promise<any>
    {
        return this.load(this.constructor["PATH_CREATE"], params, config);
    }
    public loadUpdate(params?:any, config?:IModelConfig):Promise<any>
    {
        return this.load(this.constructor["PATH_UPDATE"], params, config);
    }
    public loadDelete(params?:any, config?:IModelConfig):Promise<any>
    {
        return this.load(this.constructor["PATH_DELETE"], params, config);
    }
    public getLoadPath(path:any):string
    {
        if(typeof path == "function")
        {
            path = path.call(this);
        }
        if(path instanceof ModelLoadRequest)
        {
            path = path.path;
        }
        return path;
    }
    public load(path:string|Function|ModelLoadRequest, params:any, config:IModelConfig&{execute:false}):API2
    public load(path:string|Function|ModelLoadRequest, params:any, config:IModelConfig&{execute:true}):Promise<any>
    public load(path:string|Function|ModelLoadRequest, params:any, config:IModelConfig):Promise<any>
    public load(path:string|Function|ModelLoadRequest, params:any):Promise<any>
    public load(path:string|Function|ModelLoadRequest):Promise<any>
    public load(path:string|Function|ModelLoadRequest, params?:any, config:IModelConfig = null):API2|Promise<any>
    {
        if(!config)
            config = {};
        if(typeof path == "function")
        {
            path = path.call(this);
        }
        if(typeof params == "function")
        {
            params = params.call(this);
        }

        if(path instanceof ModelLoadRequest)
        {
            if(path.config)
            {
                for(var p in path.config)
                {
                    if(config[p] == undefined)
                    config[p] = path.config[p];
                }
            }
            if(!params)
                params = {};
            if(path.params)
            {
                for(var p in path.params)
                {
                    if(params[p] == undefined)
                        params[p] = path.params[p];
                }
            }
            path = path.path;
        }
        if(config.replaceDynamicParams)
        {
            path = this.replace(<string>path);
            if(params)
            {
                var k:string;
                for(var p in params)
                {

                    if(Model.regexp.test(params[p]))
                    {
                        params[p] = this.replace(params[p]);
                        if(params[p] == "undefined")
                        {
                            delete params[p];
                        }
                    }
                    if(Model.regexp.test(p))
                    {
                        k =  this.replace(p);
                        if(k!=p)
                        {
                            params[k] = params[p];
                            delete params[p];
                        }
                    }
                }

            }
        }
        if(config.execute !== false && config.ignorePathLoadState !== true)
        {
            //already loaded
            if(this._pathLoaded[<string>path])
            {
                if(typeof this._pathLoaded[<string>path] != "boolean")
                {
                    //return promise
                    return this._pathLoaded[<string>path];
                }
                console.log("shortcircuit: "+path);
                return new Promise<any>((resolve, reject)=>
                {
                    resolve();
                }).then(function(){});
            }
        }
        if(config.marksPathAsLoaded !== false)
        {
            this._pathLoaded[<string>path] = true;
        }
        if(Application.isLocal())
        {
            if(!params)
                params = {};
            params.__source = this.getClassName();
        }
        var request:API2 = this.getPathRequest(<string>path, params, config)
        .always(config.always===true);

        request["model_config"] = config;

        if(config.execute !== false)
        {
            return this._pathLoaded[<string>path] = request.then((data:any)=>
            {
                if(config.removePreviousModels)
                {
                    if(this["clearModels"])
                    {
                        this["clearModels"]();
                    }
                }
                if(config.callback)
                {
                    if(typeof config.callback == "function")
                    {
                        config.callback(data, {...config,path:path});
                    }else{
                        this[config.callback](data, {...config,path:path});
                    }

                }
                if(config.readExternal !== false)
                {
                    this.readExternal(data, {...config,path:path});
                }
                if(config.readExternal !== false || config.callback)
                this.validate();
                return data;
            }, (error:any)=>
            {
                console.error(error);
                if(error.exception)
                    throw error.exception
                else
                    throw error;
            });
        }
        return request;
    }
    protected getPathRequest(path:string, params:any, config:IModelConfig):API2{
        path = this._path(path);
        return this.api(path, config.api_name).path(path).params(params);
    }

}

export interface IModelConfig
{
    /**
     * Loaded data will be sent to readExternal
     * default:true
     */
    readExternal?:boolean;
    /**
     * remove previous models when loaded. Work only on collections with readexternal = true
     * default:false
     */
    removePreviousModels?:boolean;
     /**
     * Load will be called immediatly (return instance of Promise instead of API2)
     * @default true
     */
    execute?:boolean;
    /**
     * Will mark path as loaded and will not attempt to reload them in the future
     * @default true
     */
    marksPathAsLoaded?:boolean;
    /**
     * Will shortcircuit path loading mechanism and reload data in any case.
     * If execute = false and ignorePathLoadState = false the loading mechanisme is bypassed
     * @default false
     */
    ignorePathLoadState?:boolean;
    /**
     * Call will be cached if failed
     * @default false
     */
    always?:boolean;
    /**
     * If true will check for path, params keys & params value for dynamic values
     * @default false
     */
    replaceDynamicParams?:boolean;
    /**
     * Allow collection to readExternal data without forcing array conversion. Default false
     */
    allowNoArray?:boolean;
    /**
     * Api's name to use
     */
    api_name?:string;
    /**
     * Callback method instead of readExternal
     */
    callback?:any;
    
}

export class ModelLoadRequest
{
    protected static regexp = /%([^%]+)%/g;
    public constructor(public path:string, public params:any = null, public config:any = null)
    {

    }

}
