import {Master} from "browser/mvc2/Master";
import {Model} from "browser/mvc2/Model";
import {Inst} from "browser/mvc2/Inst";
import {Auth} from "browser/mvc2/Auth";
import {Router} from "browser/mvc2/Router";
import {Component} from "browser/mvc2/Component";
import {Buffer} from "ghost/utils/Buffer";


export class AutocompleteComponent extends Component
{
    protected throttlingTyping:any;
    public constructor(template:any)
    {
        super(template);
        this.throttlingTyping = Buffer.throttle(this.throttleTyping.bind(this), 200);
    }
    public props():any {
        return {
            "list":
            {
                required:true
            } ,
            "name":
            {
                required:false
            },
            /**
             * Allow custom choice (otherwise must select an item inside list)
             */
            "allow_custom":
            {
                type:Boolean,
                default:false
            }
            // "actions":
            // {
            //     type:Boolean,
            //     default:true
            // },
            // "list":
            // {
            //     required:true
            // }     ,
            // "data":
            // {
            //     required:false,
            //     default:null
            // }     ,
            // "alert":
            // {
            //     required:false,
            //     default:null
            // }
        };
    }
     protected bindVue():void
    {
        this.$addData('choice', "");
        this.$addData('selected', -1);
    }
    public $click(item:any):void
    {
        this.select(item);
        
        //this.template.list = [];
    }
    public $enter():void{
        if(this.template.selected>-1)
        {
            return this.select(this.template.list[this.template.selected]);
        }
        if(!this.template.allow_custom)
        {
            return;
        }
        this.select({name:this.template.choice});
    }
    protected select(choice:any):void{
        this.emit('autocompleteChoice', this, choice);
        this.template.choice = choice.name;
    }
    public $typing(event):void
    {
        if(event.keyCode == 13)
            return;
        if([38,40].indexOf(event.keyCode)!=-1 )
        {
            return this.$selectChange(event.keyCode);
        }
        this.throttlingTyping();
    }
    protected $selectChange(key:number):void
    {
        //up
        if(key == 38)
        {
            if(this.template.selected>0 || (this.template.selected > -1 && this.template.allow_custom))
                this.template.selected--;
        }else if(key == 40){
            if(this.template.selected < this.template.list.length-1)
                this.template.selected++;
        }
    }
    protected throttleTyping():void
    {
        var choice:string = this.template.choice;
        if(!choice)
            return; 
        this.emit('autocomplete', this);
        if(this.template.name)
        {
            this.emit('autocomplete:'+this.template.name, choice, this);
        }
        console.log("choice: "+choice);
        //debugger;
    }
    public getChoice():any
    {
        return this.template.choice;
    }
    public activate():void{
    }
}