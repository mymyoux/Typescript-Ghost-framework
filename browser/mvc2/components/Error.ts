import {Master} from "browser/mvc2/Master";
import {Model} from "browser/mvc2/Model";
import {Inst} from "browser/mvc2/Inst";
import {Auth} from "browser/mvc2/Auth";
import {Router} from "browser/mvc2/Router";
import {Component} from "browser/mvc2/Component";
import {Buffer} from "ghost/utils/Buffer";
import {ErrorCollection} from "../collections/ErrorCollection";

export class ErrorComponent extends Component
{
    public constructor(template:any)
    {
        super(template);
    }
    public props():any {
        return {
        };
    }
     protected bindVue():void
    {   
        this.$addModel(ErrorCollection).loadGet();
        var collection2:any = new ErrorCollection();
        this.$addModel("errors_realtime", collection2);
        this.realtime();
    }
    protected realtime():void
    {
        var collection:any = this.$getModel("errors_realtime");
        collection.loadRealtime(
            {start:1501624800,
            end:1504303200,step:43200}
        ).then(()=>
        {
            collection.max = collection.models.reduce(function(previous, item)
            {
                if(item.count>previous)
                    return item.count;
                return previous;
            }, 0);
        });
    }
    public bindEvents():void
    {

    }


}