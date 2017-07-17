import {EventDispatcher} from "ghost/events/EventDispatcher";
import {Eventer} from "ghost/events/Eventer";
import {Inst} from "./Inst";
import {Strings} from "ghost/utils/Strings";
import {LocalForage} from "browser/data/Forage";
import {API2} from "browser/api/API2";
import {Arrays} from "ghost/utils/Arrays";
export class Model extends EventDispatcher
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
    private _pathLoaded:any = {};
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
        if(this["id"])
        {
            return this["id"];
        }else{
            return this[this.getIDName()];
        }
    }
    public setID(value:number):void
    {
        this.id = value;
        this[this.getIDName()] = value;
    }
    protected triggerChange(key:string):void
    {
        this.trigger(Model.EVENT_CHANGE, key, this[key]);
    }
     protected triggerForceChange(key:string = null):void
    {
        if(key)
            this.trigger(Model.EVENT_FORCE_CHANGE, key, this[key]);
        else
            this.trigger(Model.EVENT_FORCE_CHANGE);
    }
     protected triggerFirstData(): void {
        if (!this._firstData) {
            this._firstData = true;
            setTimeout(() => {
                this.trigger(Model.EVENT_FIRST_DATA);
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
    protected api(name: string): API2 {
        return API2.request().name(this.getClassName()+"_"+name);
    }
    public cache(): LocalForage {
        return LocalForage.instance().war(this.getClassName());
    }
    public readExternal(input:any, path:string = null):void
    {
        for(var p in input)
        {
            if(this[p] === undefined)
                this.invalidate();
            if(typeof this[p] == "function")
            {
                console.warn("you overwrite function: "+p);
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
        this.trigger(Model.EVENT_FORCE_CHANGE);
    }
     /**
     * Returns model's data
     * @returns {any}
     */
    public writeExternal():any
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
            external[p] = this[p];
        }
        return external;
    }
    private static regexp = /%([^%]+)%/g;
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
                            v = v();
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
    public loadGet(params?:any):Promise<any>
    {
        return this.load(this.constructor["PATH_GET"], params);
    }
    public loadCreate(params?:any):Promise<any>
    {
        return this.load(this.constructor["PATH_CREATE"], params);
    }
    public loadUpdate(params?:any):Promise<any>
    {
        return this.load(this.constructor["PATH_UPDATE"], params);
    }
    public loadDelete(params?:any):Promise<any>
    {
        return this.load(this.constructor["PATH_DELETE"], params);
    }
    public loadCV(params?:any):Promise<any>
    {
        return this.load("user/cv", params, {});
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
                    config[p] = path.config[p];
                }
            }
            if(!params)
                params = {};
            if(path.params)
            {
                for(var p in path.params)
                {
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
        var request:API2 = this.getPathRequest(<string>path, params, config)
        .always(config.always===true);
        if(config.execute !== false)
        {
            return request.then((data:any)=>
            {
                if(config.readExternal !== false)
                {
                    
                    this.readExternal(data, <string>path);
                    this.validate();
                }
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
        return this.api(path).path(path).params(params);
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
}

export class ModelLoadRequest
{
    protected static regexp = /%([^%]+)%/g;
    public constructor(public path:string, public params:any = null, public config:any = null)
    {

    }

}
