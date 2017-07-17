import {Master} from "browser/mvc2/Master";
import {Model} from "browser/mvc2/Model";
import {Inst} from "browser/mvc2/Inst";
import {Auth} from "browser/mvc2/Auth";
import {Router} from "browser/mvc2/Router";
import {Component} from "browser/mvc2/Component";
import {Buffer} from "ghost/utils/Buffer";


export class TableComponent extends Component
{
    protected saveObject:any;
    protected savePromise:Promise<any> = null;
    protected reload:any;
    protected $paginating:any;
    protected search:string;
    public constructor(template:any)
    {
        super(template);
        this.reload = Buffer.throttle(this._reload.bind(this), 200);
    }
    protected bindEvents():void
    {
        var _self:any = this;
        if(this.$getProp('scroll')===false)
        {
            return;
        }
        this.scroll(function()
        {
            if(_self.$paginating)
                return;
           var element:any = this;
           var a = element.scrollTop;
           var b = element.scrollHeight - element.clientHeight;
           var c = a / b;
           console.log("scroll:"+c); 
           if(c>0.7)
           {
               _self.$paginating = _self.$paginate();
               _self.$paginating.then(function()
               {
                    _self.$paginating = null;
               }, function()
               {
                    _self.$paginating = null;
               });
           }
        });
    }
    protected bindVue():void
    {
        this.$addData("edition", false);
        this.$addData("deleting", false);
        this.$addData("loading", false);
        this.$addData("search_open", false);
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
            }     ,
            "data":
            {
                required:false,
                default:null
            }     ,
            "alert":
            {
                required:false,
                default:null
            },
            "scroll":
            {
                type:Boolean,
                default:true
            }
        };
    }
    public $openSearch():void
    {
        this.$addData('search_open', true);
        setTimeout(()=>
        {
            $(this.template.$el).find('.searchbox input').get(0).focus();
        },0);
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
        this.$addData("loading", true);
        return this.$getModel("list").nextAll().then(()=>
        {
            this.$addData("loading", false);
        },()=>
        {
            this.$addData("loading", false);
        });
    }
    protected getPromise(event?:any):Promise<any>
    {
        var promise:any = this.savePromise;
        if(!promise)
        {
            if(this.$getData("edition"))
            {
                promise = this.$edited(this.$getData("edition"), event);
            }else
                promise = new Promise<any>(function(resolve){resolve();});
        }
        return promise;
    }
    public $edit(item:any, column:any, event:any):Promise<any>
    {
        if(!column.editable)
        {
            return new Promise<any>(function(resolve){resolve(false);});
        }
        this.$addData('deleting', false);
        var promise:any = this.getPromise(event);
        return promise.then((success:boolean)=>
        {
            if(success === false)
                return false;
            var columns:any[] = this.$getProp('list').columns;
            this.saveObject = {};
            for(var p in columns)
            {
                if(columns[p].prop)
                    this.saveObject[columns[p].prop] = item[columns[p].prop];
            }
            var $td:any = $(event.currentTarget).closest('.table-td');
            setTimeout(function()
            {
                $td.find('input').focus();
            },0);
            this.$addData("edition", item);
        });
    }
    public showError(column:string, error:string):void
    {
        var columns:any[] = this.$getProp('list').columns;
        for(var c of columns)
        {
            if((c.name && c.name.toLowerCase() == column) || c.prop == column)
            {
                c.error = error;
            }
        }
    }
    public $change(item:any, column:any, event:any):void
    {
        column.error = null;
    }
    public $edited(item:any, event:any):Promise<any>
    {
        if(this.savePromise)
        {
            return null;
        }
        if(item.isValid)
        {
            var columns:any[] = this.$getProp('list').columns;
            for(var c of columns)
            {
                c.error = null;
            }
            return this.savePromise = item.isValid(this.$getProp('list'), this).then(()=>
            {
                this.savePromise = null;
                console.log("[edited]edited=>false");
                this.$addData("edition", false);
                this.save(item);
            },(error:any)=>
            {
                this.savePromise = null;
                this.showError(error.column, error.error);
                return false;
            });
        }
        console.log("[edited]edited-direct=>false");
        this.$addData("edition", false);
        this.save(item);
        return  new Promise<any>(function(resolve){resolve();}) ;
        
    }   
    public $liclick(item:any, event:any):void
    {
        if(this.$getData("edition") && this.$getData("edition") !== item)
        {
            this.$edited(this.$getData("edition"), event);
            // this.save(this.$getData("edition"));
            // this.$addData("edition", false);
        }
        
    }
    public $checkOutside(event:any):void
    {
        if(!this.$getData("edition"))
        {
            return;
        }
        if(!$(event.target).closest('.table-tr.table-item').length && $(event.target).closest('body').length)
        {
            if($(event.target).closest('.create').length )
            {
                return;
            }
            this.$edited(this.$getData("edition"), event);
        }
    }
    /**
     * Called on create item button
     * @param event 
     */
    public $create(event:any):void
    {
        var promise:any = this.getPromise(event);
        promise.then((success:boolean)=>
        {
            if(success === false)
                return;
            var list:any = this.$getProp('list');
            var model:any = list.createModel();
            model._creating = true;
            list.models.unshift(model);
            var columns:any[] = this.$getProp('list').columns;
            for(var column of columns)
                if(column.editable)
                    break;
            
            this.$edit(model, column, event).then((success:boolean)=>
            {
                if(success === false)
                    return;
                var elmt:any = this.template.$el.querySelector("[data-create='true']");
                delete model._creating;
                if(elmt) 
                {
                    $(elmt).find('input').eq(0).focus();
                }
            });
        });
    }
    public $cancel(item:any, event:any):void
    {
        var promise:any = this.savePromise;
        if(!promise)
        {
            promise = new Promise<any>(function(resolve){resolve();});
        }
        promise.then((success:boolean)=>
        {
            var model:any = this.$getData("edition");
            var list:any = this.$getProp('list');
            if(!model)
                return
            if(!model.getID())
            {
                var index:number = list.models.indexOf(model);
                if(index != -1){
                    list.models.splice(index, 1);
                }
            }else{
                if(this.saveObject)
                {
                    for(var p in this.saveObject)
                    {
                        model[p] = this.saveObject[p];
                    }
                }
            }
            this.$addData("edition", false);
        });
    }
    /**
     * 
     * Click on delete
     * @param item
     * @param event 
     */
    public $askRemove(item:any, event:any):void
    {
        this.$addData('deleting', item);
    }
    /**
     * Cancel deleting
     * @param item
     * @param event 
     */
    public $cancelRemove(item:any, event:any):void
    {
        this.$addData('deleting', false);
    }
    /**
     * Confirm deleting of item
     * @param item
     * @param event 
     */
    public $remove(item:any, event:any):void
    {
        
        item.loadDelete().then(()=>
        {
            this.$getProp('list').remove(item);
        });
        this.$addData('deleting', false);
    }
    protected $onSearch(column:any, event:any):void
    {
        this.$getProp('list').cancelGet();
        this.reload();
    }
    protected $onSearchGlobal(event:any, blur:boolean = false)
    {
        var list:any = this.$getProp('list');
        if(blur)
        {
            if(!list.search)
            {
                this.$addData("search_open", false);
            }
        }
        if(this.search != list.search)
        {
            this.search = list.search;
            this.$onSearch(null, event);
        }
    }
    protected _reload():void
    {
        this.$addData("loading", true);
        this.$getProp('list').clear();
        this.$getProp('list').loadGet().then(()=>
        {
            this.$addData("loading", false);
        }).catch(()=>{
            this.$addData("loading", false);
        });
    }
    protected save(item:any):void
    {
        console.log("item save:", item);
        item.loadUpdate();
    }
    protected $show():void{
    }
   
    public activate():void{
    }
}