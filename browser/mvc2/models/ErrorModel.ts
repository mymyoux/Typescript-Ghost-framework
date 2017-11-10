import {Model, IModelConfig, ModelLoadRequest} from "browser/mvc2/Model";
import {API2} from "browser/api/API2";
import {Singleton} from "browser/mvc2/Mixin";
import {Maths} from "ghost/utils/Maths";
//TODO:get apis list to know to which api the user is connected
//maybe made a service to request each api
export class ErrorModel extends Model
{   
    public time:string;
    public timestamp:number;
    protected color:string = null;
    public getIDName():string
    {
        return "id";
    }
 
    public readExternal(input:any, path:string = null):void
    {
        super.readExternal(input, path);
        if(input.time)
        {
            this.timestamp = input.time;
            var time:Date = new Date(input.time*1000);
            this.time = Maths.toMinNumber(time.getHours(), 2) + ":" + Maths.toMinNumber(time.getMinutes(), 2);// + ":" + Maths.toMinNumber(time.getSeconds(), 2);
        }
        
    }
}