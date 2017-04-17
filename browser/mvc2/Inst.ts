import {Root} from "ghost/core/Root";
export class Inst
{
    private static _instances:any ={};
    public static get(cls:any):any
    public static get(name:string):any
    public static get(cls:any):any
    {
        if(!cls)
        {
            throw new Error("You can't instantiate null class");
        }
        if(typeof cls == "object")
        {
            return cls;
        }
        if(typeof cls == "string")
        {
            var model:any

            model = require(cls.replace("/\./g","/"));
            if(!model)
            {
                throw new Error("No Model named "+cls);
            }else
            {
                cls = model;
            }
        }

        if(Inst._instances[cls])
        {
            return Inst._instances[cls];
        }
        return new cls();
    }
    public static register(inst:any):void
    {
        Inst._instances[inst.constructor] = inst;
    }
}