import {Master} from "browser/mvc2/Master";
import {Model} from "browser/mvc2/Model";
import {Inst} from "browser/mvc2/Inst";
import {Auth} from "browser/mvc2/Auth";
import {Router} from "browser/mvc2/Router";
import {Component} from "browser/mvc2/Component";
import {Buffer} from "ghost/utils/Buffer";
import {Strings} from "ghost/utils/Strings";


export class AutocompleteListComponent extends Component
{
    protected throttlingTyping:any;
    protected blurLater:any;
    public getComponentName():string
    {
        return "autocomplete-list";
    }
    public constructor(template:any)
    {
        super(template);
        this.throttlingTyping = Buffer.throttle(this.throttleTyping.bind(this), 200);
    }
    public $outside(event):void
    {
        console.log("outside",event.target);
    }
    public bindEvents():void
    {
        this.bindEvent(document, "click", this.$outside.bind(this));
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
            },
            "list":
            {
                required:true
            },
            "tag":
            {
                default: false
            },
            "index":
            {
                required: false,
                default : 0
            },
            "tabindex":
            {
                required: false,
                type: Number
            },
            "clear":
            {
                required: false,
                default: false,
                type: Boolean
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
        this.$addData('hidden', true);
        this.$addData('choice', "");
        this.$addData('selected', -1);
        this.$addData('selected_item', null);
        this.$addData('onrest', true);
    }
    public $activate():void
    {
        this.template.onrest = false;
        this.focus();
    }
    public focus():void
    {
        setTimeout(()=>
        {

            $(this.template.$el).find("input").focus();
        }, 0);
    }
    public setAutocomplete(data:any[]):void
    {
        this.template.list = data;
    }
    public $click(item:any):void
    {
        console.log('click', item);
        this.select(item);
        
        //this.template.list = [];
    }
    public $enter():void{
        if(this.template.selected>-1)
        {
            return this.select(this.template.list.models[this.template.selected]);
        }
        if(!this.template.allow_custom)
        {
            if(this.$getProp('list').models.length && Strings.trim(this.template.choice))
            {
                return this.select(this.template.list.models[0]);
            }
            return;
        }
        this.select({name:this.template.choice});
    }
    protected $focus():void
    {
        if (this.$getProp('list').models)
            return;
        this.template.hidden = false;
        this.$getProp('list').loadAutocomplete({choice:""});
    }
    protected $blur(event):void{

        console.log('bluring', event.target);
        if(this.blurLater)
        {
            clearTimeout(this.blurLater);
        }
        this.blurLater = setTimeout(()=>
        {
            console.log('blur');
            this.blurLater = null;
            if(this.template)
            {
                this.template.hidden = true;
                this.template.onrest = true;
            }
        },100);
    }
    public select(choice:any):void{
        this.emit('autocompleteChoice', this, choice, this.template.index);
        this.remit('autocompleteChoice', this, choice, this.template.index);
        if (!this.template.clear)
        {
            this.template.choice = choice.name;
            this.template.selected_item = choice;
        } else
        {
            this.template.choice = '';
        }
        this.template.hidden = true;
        this.template.onrest = true;
    }
    public $typing(event):any
    {
        if(event.keyCode == 13)
            return;
        if (this.template.choice.length == 0)
        {
            this.template.hidden = true;
            return;
        }

        this.template.selected_item = null;
        // if(this.template.choice)
        //     this.template.hidden = false;
        // else
        this.template.hidden = false;
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
        // if(!choice)
        //     return; 
        // this.emit('autocomplete', this);
        // if(this.template.name)
        // {
        //     this.emit('autocomplete:'+this.template.name, choice, this);
        // }
        this.template.list.loadAutocomplete(
        {
            choice:choice
        });
        console.log("choice: "+choice);
        //debugger;
    }
    public getChoice():any
    {
        return this.template.selected_item;
    }
    protected onMounted():void
    {
        this.Wselection();
    }
    public activate():void{
        
    }
}