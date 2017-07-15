export class Form
{
    protected error:any = {};
    protected globalError:string = null;
    protected _fields:any = {};
    public addInput(name:string, config?:IConfig):void
    {
        this._fields[name] = config?config:{};
    } 
    public validate():Promise<any>
    {
        this.error = {};
        this.globalError = null;
        var keys:string[] = Object.keys(this._fields);
        return new Promise<any>((resolve:any, reject:any):void=>
        {
            Promise.all(keys.map((name:string)=>this.validateField(name))).then((data:any):void=>
            {
                var keys:string[] = Object.keys(this.error);
                if(keys.length)
                {
                    reject(keys);
                }else
                    resolve();
            });
        });
    }
    protected validateField(field:string):boolean|Promise<any>
    {
        delete this.error[field];
        var config:IConfig  = this._fields[field];
        if(config.required && !this[field])
        {   
            this.addError(field, 'required');
        }
        return true;
    }
    public addGlobalError(message:string):void
    {
        this.globalError = message;
    }
    protected addError(field:string, message:string):void
    {
        this.error[field] = message;
    }
    public getValues():any
    {
        var object:any = {};
        for(var p in this)
        {
            if(typeof this[p] == "function")
                continue;
            if(["error", "_fields"].indexOf(p)!=-1)
                continue;
            object[p] = this[p];
        }
        //default values
        for(var q in this._fields)
        {
            if(this._fields[q].default && !object[q])
            {
                object[q] = this._fields[q].default;
            }
        }
        return object;
    }
}

export interface IConfig
{
    required?:boolean;
    default?:any;
}