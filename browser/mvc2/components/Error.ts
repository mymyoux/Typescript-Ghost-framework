import {Master} from "browser/mvc2/Master";
import {Model} from "browser/mvc2/Model";
import {Inst} from "browser/mvc2/Inst";
import {Auth} from "browser/mvc2/Auth";
import {Router} from "browser/mvc2/Router";
import {Component} from "browser/mvc2/Component";
import {Buffer} from "ghost/utils/Buffer";
import {ErrorCollection} from "../collections/ErrorCollection";
import {ErrorModel} from "../models/ErrorModel";
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
        this.$addData('is_api', true);
        this.$addData('front', true);
        this.$addData('back', true);
        this.$addModel(ErrorCollection);
        this.loadOneHour();
    }
    
    public $setIsApi( value : boolean = null ) : void
    {
        // null = both
        // false = only non api errors
        // true = only api errors
        this.$addData('is_api', value);

        this.$onErrorUnselected();
    }

    public $setFront( value : boolean ) : void
    {
        this.$addData('front', value);

        this.$onErrorUnselected();
    }

    public $setBack( value : boolean ) : void
    {
        this.$addData('back', value);

        this.$onErrorUnselected();
    }

    public $onErrorSelected(item:ErrorModel):void
    {
        this.template.errors.clear();
        this.template.errors.order(["count","last_created_time"],[-1, -1]);
        this.template.errors.loadGet({
            start   : item.timestamp,
            end     : item.timestamp + 60 * 5,
            is_api  : this.$getData('is_api'),
            front   : this.$getData('front'),
            back    : this.$getData('back'),
        });
    }
    public $onErrorUnselected():void
    {
        this.template.errors.clear();
        this.template.errors.order(['last_created_time'], [-1]);
        this.loadOneHour();
    }
    protected loadOneHour()
    {
        var time:Date = new Date();//Date(1504303200*1000+60*1000*5*12);
        time.setSeconds(0);
        time.setMilliseconds(0);
        time.setMinutes(time.getMinutes()-time.getMinutes()%5);
        time.setMinutes(time.getMinutes()+5);
        this.$getModel("errors").loadGet({
            start   : time.getTime() - 60 * 1000 * 5 * 12,
            end     : time.getTime(),
            step    : 60 * 5,
            is_api  : this.$getData('is_api'),
            front   : this.$getData('front'),
            back    : this.$getData('back'),
        });
    }
    public bindEvents():void
    {
    }
    public unbindEvents():void
    {
    }
    public activate():void
    {
        $("body").addClass("hide_front");
    }
    public disactivate():void
    {
        $("body").removeClass("hide_front");
    }


}