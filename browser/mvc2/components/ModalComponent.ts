import {Master} from "browser/mvc2/Master";
import {Model} from "browser/mvc2/Model";
import {Inst} from "browser/mvc2/Inst";
import {Auth} from "browser/mvc2/Auth";
import {Router} from "browser/mvc2/Router";
//import {JobBoardModel} from "resources/assets/ts/yb/main/models/JobBoardModel";
import {JobBoardModel} from "yb/main/models/JobBoardModel";
import {Component} from "browser/mvc2/Component";

export class ModalComponent extends Component
{
    public place: any;
    public modalInfo: any;
    public tags: any;
    public skills: string;
    public search: string = "";
    protected language:any = [];
    protected experience:any = [];
    protected position:any = [];

    protected bindVue():void
    {
        window["modal"]    = this;
    }

    public props():any {
        return {
            "actions":
            {
                type:Boolean,
                default:true
            },
            "data":
            {
                required:true
            }
        };
    }

    public $closemodal():void
    {
        $(".job").find('.modal').addClass('hide');
    }

    public $alert(jobboards:any):void
    {
        this.$getModel("data").alert(jobboards);
    }

    public $getTags(jobboards: any): any
    {
        var result = [];

        if (jobboards) {
            for (var l in jobboards) {
                if (jobboards[l].selected == true) {
                    result.push(jobboards[l].type);
                }
            }
        }

        return result.join(", ");
    }

    public $eventSelect(jobboards: any):void
    {
        if (jobboards.selected == false) {
            jobboards.selected = true;
        } else {
            jobboards.selected = false;
        }
    }

    protected $show():void{
    }
    protected $debug(data:any):void
    {
        debugger;
    }
   
    public activate():void{
        debugger;
    }
}