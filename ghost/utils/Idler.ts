import { setTimeout } from "timers";

class Idler
{
    protected static _idle:any[] = [];
    protected static _request:any = null;
    public static push(object:any, method:string, ...params:any[])
    {
        this._idle.push({object:object, method:method, params:params});
        this.checkNext();
    }
    public static pushUnique(object:any, method:string, ...params:any[])
    {
        for(var object of this._idle)
        {
            if(object.object === object && method === method)
            {
                return;
            }
        }
        this.push(object, method, ...params);
    }
    public static execute():void
    {
        var object:any = this._idle.shift();
       var result:any =  object.object[object.method](...object.params);
       console.log("[IDLER] - execution");
       if(result instanceof Promise)
       {
           result.then(()=>{}, ()=>{});
       }
       this.next();
    }
    protected static checkNext():void
    {
        if(this._request === null)
        {
            this.next();
        }
    }
    protected static next():void
    {
        if(!this._idle.length)
        {
            this._request  = null;
            return;
        }
        if(window.requestAnimationFrame)
        {
            this._request = window.requestAnimationFrame(this.execute);
        }else{
            this._request = setTimeout(this.execute, 100);
        }
    }
}