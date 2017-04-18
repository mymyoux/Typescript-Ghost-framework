import {EventDispatcher} from "ghost/events/EventDispatcher";
import {Eventer} from "ghost/events/Eventer";
import {Inst} from "./Inst";
import {Strings} from "ghost/utils/Strings";
import {LocalForage} from "browser/data/Forage";
import {API2} from "browser/api/API2";
import {IModelConfig} from "./IModelConfig";
import {ModelLoadRequest} from "./ModelLoadRequest";
export class Model extends EventDispatcher
{
    public static EVENT_CHANGE:string = "change";
    public static EVENT_FIRST_DATA:string = "first_data";
    public static EVENT_FORCE_CHANGE:string = "force_change";
    public static PATH_CREATE:()=>ModelLoadRequest = 
        ()=>new ModelLoadRequest("%root-path%/create", null,{replaceDynamicParams:true});
    public static PATH_GET:()=>ModelLoadRequest = 
        ()=>new ModelLoadRequest("%root-path%/get", {'%id-name%':'%id%'}, {replaceDynamicParams:true});
    public static PATH_DELETE:()=>ModelLoadRequest = 
        ()=>new ModelLoadRequest("%root-path%/delete", {'%id-name%':'%id%'}, {replaceDynamicParams:true});
    public static PATH_UPDATE:()=>ModelLoadRequest = 
        ()=>new ModelLoadRequest("%root-path%/update", {'%id-name%':'%id%'}, {replaceDynamicParams:true});
    private _firstData:boolean;
    private _pathLoaded:any = {};
    protected _modelName:string; 
    public constructor()
    {
        super();
        if(this.isSingleton())
        {
            Inst.register(this); 
        }
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
        this.triggerChange(key);
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
            this._modelName = this.getClassName();
            this._modelName = this._modelName.replace('Model', '').toLowerCase();
        }
        return this._modelName;
    }
    protected path(path:string):string
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
    public isSingleton():boolean
    {
        return false;
    }
    public readExternal(input:any, path:string = null):void
    {
        for(var p in input)
        {
            this[p] = input[p];
        }
        this.triggerFirstData();
        //this.data = input;
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
                        if(typeof this[key] == "function")
                        {
                            value = value.replace('%'+key+'%', this[key]());
                        }else
                        {
                            value = value.replace('%'+key+'%', this[key]);
                        }
                    }
                }
            });
        }
        return value;
    }
    public load(path:string|Function|ModelLoadRequest, params:any, config:IModelConfig = null):API2|Promise<any>
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
                    this._pathLoaded[<string>path] = true;
                    this.readExternal(data, <string>path);
                }
            }, (error:any)=>
            {
                debugger;
                console.error(error);
            });
        }
        return request;
    }
    protected getPathRequest(path:string, params:any, config:IModelConfig):API2{
        path = this.path(path);
        return this.api(path).path(path).params(params);
    }

}