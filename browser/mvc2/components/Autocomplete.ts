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
    protected blurLater:any;
    public constructor(template:any)
    {
        super(template);
        this.throttlingTyping = Buffer.throttle(this.throttleTyping.bind(this), 200);
    }
    public props():any {
        return {
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
            },
             "selection":
            {
                type:String,
                default:""
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
        this.$addData('list', []);
        this.$addData('selected', -1);
    }
    public setAutocomplete(data:any[]):void
    {
        this.template.list = data;
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
    protected $focus():void
    {

    }
    protected $blur():void{

        if(this.blurLater)
        {
            clearTimeout(this.blurLater);
        }
        this.blurLater = setTimeout(()=>
        {
            this.blurLater = null;
            this.template.list = [];
        },100);
    }
    protected select(choice:any):void{
        this.emit('autocompleteChoice', this, choice);
        this.template.choice = choice.name;
        this.template.list = [];
    }
    public $typing(event):any
    {
        if(event.keyCode == 13)
            return;
        if([38,40].indexOf(event.keyCode)!=-1 )
        {
            return this.$selectChange(event.keyCode == 38);//false;
        }
        this.throttlingTyping();
    }
    public Wselection()
    {
        this.template.choice = this.template.selection;
    }
    protected $selectChange(up:boolean):boolean
    {
        //up
        if(up)
        {
            if(this.template.selected>0 || (this.template.selected > -1 && this.template.allow_custom))
                this.template.selected--;
        }else{
            if(this.template.selected < this.template.list.length-1)
                this.template.selected++;
        }
        return false;
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
    public getName() : string
    {
        return this.template.name;
    }
    public getChoice():any
    {
        return this.template.choice;
    }
    protected onMounted():void
    {
        this.Wselection();
    }
    public activate():void{
        
    }
}