import {Root} from "ghost/core/Root";
export class Inst
{
    private static _instances:any[] =[];
    private static _instancesCls:any[] =[];
    // private static _modelsInst:any[] =[];
    public static get(cls:any, id?:number, collection?:any):any
    public static get(name:string, id?:number, collection?:any):any
    public static get(cls:any, id?:number, collection?:any):any
    {
        if(!cls)
        {
            debugger;
            throw new Error("You can't instantiate null class");
        }
        if(typeof cls == "object")
        {
            return cls;
        }
        var model:any
        if(typeof cls == "string")
        {
            

            model = require(cls.replace("/\./g","/"));
            if(!model)
            {
                throw new Error("No Model named "+cls);
            }else
            { 
                var parts:string[] = cls.split('/');
                if(model[parts[parts.length-1]])
                {
                    model = model[parts[parts.length-1]];
                }
                cls = model;
            }
        }
        
        var index:number = this._instancesCls.indexOf(cls);
        if(index != -1)
        {
            return this._instances[index];
        }
        if(id !== undefined)
        {
            if(collection)
            {
                model = Inst.get(collection).getModelByID(id);
                if(model)
                    return model;
            }else
            {
                for(var p in this._instances)
                {
                    if(this._instances[p] instanceof cls)
                    {
                        model = this._instances[p].getModelByID(id);
                        if(model.constructor === cls)
                        { 
                            return model;
                        }
                    }
                }   
            }
            model = new cls();
            model.setID(id);
            return model;
        }
        return new cls();
    }
    public static register(inst:any):void
    {
        Inst._instancesCls.push(inst.constructor);
        Inst._instances.push(inst);
    }
}