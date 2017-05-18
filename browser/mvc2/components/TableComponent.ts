import {Master} from "browser/mvc2/Master";
import {Model} from "browser/mvc2/Model";
import {Inst} from "browser/mvc2/Inst";
import {Auth} from "browser/mvc2/Auth";
import {Router} from "browser/mvc2/Router";
import {Component} from "browser/mvc2/Component";


export class TableComponent extends Component
{

    protected bindVue():void
    {
        window["table"]    = this;
    }

    public props():any {
        return {
            "actions":
            {
                type:Boolean,
                default:true
            },
            "list":
            {
                required:true
            }        
        };
    }
    protected $click(item:any, column:any, event:any):void
    {
        if(column.link !== true)
        {   
            return;
        }
        this.$getModel('list').onClick(item, column);
    }
    protected $paginate():void {
        this.$getModel("list").nextAll().then();
    }

    protected $openSearch(event):void 
    {
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