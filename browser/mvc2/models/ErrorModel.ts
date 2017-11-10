import {Model, IModelConfig, ModelLoadRequest} from "browser/mvc2/Model";
import {API2} from "browser/api/API2";
import {Singleton} from "browser/mvc2/Mixin";
//TODO:get apis list to know to which api the user is connected
//maybe made a service to request each api
export class ErrorModel extends Model
{   
    public getIDName():string
    {
        return "id";
    }
}