import {Master} from "browser/mvc2/Master";
import {Model} from "browser/mvc2/Model";
import {Inst} from "browser/mvc2/Inst";
import {Auth} from "browser/mvc2/Auth";
import {Router} from "browser/mvc2/Router";
import {Component} from "browser/mvc2/Component";
import {Buffer} from "ghost/utils/Buffer";
import {ErrorCollection} from "../../collections/ErrorCollection";
import {ErrorModel} from "../../models/ErrorModel";
import {Gradient} from "ghost/utils/Colours";
import {Eventer} from "ghost/events/Eventer";
export class ErrorGraphComponent extends Component
{
    protected interval:any;
    protected colors:Gradient;
    public constructor(template:any)
    {
        super(template);
    }
    public getComponentName():string
    {
        return "error-graph";
    }
    public props():any {
        return {
            "collection":
            {
                required:false
            }
        };
    }
     protected bindVue():void
    {   
        var collection2:any = this.$getProp("collection")?this.$getProp("collection"):new ErrorCollection();
        collection2.order(['time'], [1]);
        this.$addModel("errors_realtime", collection2);
        this.$addData("selected", null);
        
        this.realtime();
        this.colors = new Gradient();
        this.colors.setColours(["#16ab4e","#f3a60c","#FF0000"]);
    }
    public $select(item:ErrorModel):void
    {
        if(this.template.selected && this.template.selected.time == item.time)
        {
            this.template.selected = null;
        }else{
            this.template.selected = item;
        }
        if(this.template.selected)
        {
            this.$proxy("onErrorSelected", this.template.selected);
        }else{
            this.$proxy("onErrorUnselected");
        }
    }
    protected realtime():void
    {
        var collection:any = this.$getModel("errors_realtime");
        if(!collection)
        {
            this.interval = setTimeout(this.realtime.bind(this), 1000);
            return;
        }
        var time:Date = new Date();//Date(1504303200*1000+60*1000*5*12);
        time.setSeconds(0);
        time.setMilliseconds(0);
        time.setMinutes(time.getMinutes()-time.getMinutes()%5);
        time.setMinutes(time.getMinutes()+5);
        collection.loadRealtime(
            {start:time.getTime()-60*1000*5*12,
            end:time.getTime(),step:60*5}
        ).then(()=>
        {
            collection.max = collection.models.reduce(function(previous, item)
            {
                if(item.count>previous)
                    return item.count;
                return previous;
            }, 1);
            collection.models.map(( item)=>
            {
                item.color = this.colors.getColour(Math.floor(item.count/collection.max*100)-1);
                return item;
            }, 0);
            this.interval = setTimeout(this.realtime.bind(this), 1000);
        }, ()=>
        {
            this.interval = setTimeout(this.realtime.bind(this), 1000);
        
        });
     
    }
    public templatePath():string
    {
        return "error/graph";
    }
    public bindEvents():void
    {
        Eventer.on(Eventer.VISIBILITY_CHANGE, this.onVisibility, this);
    }
    protected onVisibility():void
    {
         clearInterval(this.interval);
        if(document.visibilityState == "hidden")
        {
        }else{
            this.realtime();
        }
    } 
    public unbindEvents():void
    {
       clearInterval(this.interval);
       Eventer.off(Eventer.VISIBILITY_CHANGE, this.onVisibility, this);
    }


}