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
    protected _mouseStart:number;
    protected _mouseLast:number;
    protected _itemChanged:number[];
    protected _mousedown:any;
    protected _mouseup:any;
    protected _allmouse:any;
    protected _alldelete:any;
    protected _mousemove:any;

    public current_filter:string = null;
    public current_filters:string[] = [];
    public current_search:string = null;
  
    public constructor(template:string)
    {
        super(template);
        this.reload = this._reload.bind(this);
    }
    
    protected _onMouseDown(event:any):void
    {
        
        if(this.$getData("edition") || event.button != 0)
        {
            return;
        }
        event.preventDefault();
        this._mouseStart = null;
        var index:number = $(event.currentTarget).index()-1;
        if(index<0)
            return;
        var model:any =  this.$getProp('list').models[index];
        if(!model)
            return;
        if(!event.shiftKey)
        {
            this._mouseLast = index;
        }else{
            if(!event.metaKey && !event.ctrlKey)
            {
                this.template.selected.forEach((item)=>item.selected=false);
                this.template.selected = [];
                // this.$getProp('list').models.forEach((item)=>
                // {
                //     item.selected = false;
                // });
            }
            this._mouseStart = this._mouseLast;
            this._onMouseUp(event);
            //handle like mouseup
            return;
        }
        this._mouseStart = index;
        this._itemChanged = [index];
        model._previousSelected = model.selected;
        if(!event.metaKey && !event.ctrlKey)
        {
            this.template.selected.forEach((item)=>item.selected=false);
            this.template.selected = [];
            // this.$getProp('list').models.forEach((item)=>
            // {
            //     item.selected = false;
            // });
            model.selected = !model.selected;
            if(model.selected)
            {
                this.template.selected.push(model);
            }else{
                var index:number = this.template.selected.indexOf(model);
                if(index != -1)
                    this.template.selected.splice(index, 1);
            }
        }else
        {
            
            if(!model.selected)
                this.template.selected.push(model);
            model.selected = true;
        }
    }
    protected _onMouseMove(event:any):void
    {
        if(this._mouseStart == null)
        {
            return;
        }
        //no button
        if(event.buttons == 0)
        {
            this._onMouseUp(event);
            return;
        }
         event.preventDefault();
        var index:number = $(event.currentTarget).index()-1;
        if(index<0)
            return;
        var index1:number = Math.min(index, this._mouseStart);
        var index2:number = Math.max(index, this._mouseStart);
        var model:any;
        for(var p of this._itemChanged)
        {
                model =  this.$getProp('list').models[p];
                model.selected = model._previousSelected;
                if(model.selected && this.template.selected.indexOf(model) == -1)
                {
                    this.template.selected.push(model);
                }else{
                    var index:number = this.template.selected.indexOf(model);
                    if(index != -1)
                        this.template.selected.splice(index, 1);
                }
        }
        for(var i:number=index1; i<=index2; i++)
        {
            model =  this.$getProp('list').models[i];
            if(!model)
                continue;
            if(this._itemChanged.indexOf(i)==-1)
            {
                model._previousSelected = model.selected;
                this._itemChanged.push(i);
            }
            
            if(event.metaKey || event.ctrlKey)
            {
                model.selected = !model.selected;
                if(model.selected)
                {
                    this.template.selected.push(model);
                }else{
                    var index:number = this.template.selected.indexOf(model);
                    if(index != -1)
                        this.template.selected.splice(index, 1);
                }
            }else
            {
                if(!model.selected)
                    this.template.selected.push(model);
                model.selected = true;
            }
        }
    }
    protected _onMouseUp(event:any):void
    {
        if(this._mouseStart == null)
        {
            return;
        }
         event.preventDefault();
        var index:number = $(event.currentTarget).index()-1;
        if(index<0)
            return;
        
        var index1:number = Math.min(index, this._mouseStart);
        var index2:number = Math.max(index, this._mouseStart);

        this._mouseStart = null;
        var model:any;
        for(var p of this._itemChanged)
        {
                model =  this.$getProp('list').models[p];
                model.selected = model._previousSelected;
                if(model.selected && this.template.selected.indexOf(model) == -1)
                {
                    this.template.selected.push(model);
                }else{
                    var index:number = this.template.selected.indexOf(model);
                    if(index != -1)
                        this.template.selected.splice(index, 1);
                }
                delete model._previousSelected;
        }
        for(var i:number=index1; i<=index2; i++)
        {
            model =  this.$getProp('list').models[i];
            if(!model)
                continue;
            if(event.metaKey || event.ctrlKey)
            {
                model.selected = !model.selected;
                if(model.selected)
                {
                    this.template.selected.push(model);
                }else{
                    var index:number = this.template.selected.indexOf(model);
                    if(index != -1)
                        this.template.selected.splice(index, 1);
                }
            }else
            {
                if(!model.selected)
                    this.template.selected.push(model);
                model.selected = true;
            }
        }
        this.trigger("selection");
    }
    /**
     * @param event Called when ctrl+A,cmd+A used
     */
    protected _onMouseAll(event):void
    {
        
        this.$getProp('list').models.forEach((item)=>{if(!item.selected){this.template.selected.push(item);}item.selected=true; });
        this.trigger("selection");
    }
    protected _onMouseDelete(event):void
    {
        if(this.template.edition)
        {
            return;
        }
        this.$removeAll(this.$getProp('list').models.filter((item)=>item.selected), event);
    }
    public $removeAll(items:any[], event:any):void
    {
        items.forEach((item)=>this.$remove(item, event));
    }
    protected bindEvents():void
    {
        var _self:any = this;
         if(this.$getProp('list').config.selectable)
        {
            this._mousedown = this._onMouseDown.bind(this);
            this._mouseup = this._onMouseUp.bind(this);
            this._mousemove = this._onMouseMove.bind(this);
            this._allmouse = this._onMouseAll.bind(this);
            this._alldelete = this._onMouseDelete.bind(this);
            $(this.template.$el).on('mousedown','.col>div', this._mousedown);
            $(this.template.$el).on('mousemove','.col>div', this._mousemove);
            $(this.template.$el).on('mouseup','.col>div', this._mouseup);
            $(this.template.$el).on('key_all_selection', this._allmouse);
            $(this.template.$el).on('key_delete', this._alldelete);
        }
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
    protected unbindEvents():void
    {
        super.unbindEvents();
        if(this._mousedown)
             $(this.template.$el).on('mousedown','.col>div', this._mousedown);
        if(this._mousemove)
            $(this.template.$el).on('mousemove','.col>div', this._mousemove);
        if(this._mouseup)
            $(this.template.$el).on('mouseup','.col>div', this._mouseup);
    }
    protected bindVue():void
    {
        this.$addData("edition", false);
        this.$addData("deleting", false);
        this.$addData("loading", false);
        this.$addData("search_open", false);
        this.$addData("selected", []);
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
    public $create(event:any):Promise<any>
    {
        var promise:any = this.getPromise(event);
        return promise.then((success:boolean)=>
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
            
            return this.$edit(model, column, event).then((success:boolean)=>
            {
                if(success === false)
                    return;
                var elmt:any = this.template.$el.querySelector("[data-create='true']");
                delete model._creating;
                if(elmt) 
                {
                    $(elmt).find('input').eq(0).focus();
                }
                return model;
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

    // FILTERS
    public $filterChange( list : any ) : void
    {
        list.current_filter = list.current_filter.length ? list.current_filter : null;
        
        this.filterAction( list, list.current_filter);
    }

    public filterAction( list : any, type : string ) : Promise <any>
    {
        return list.filterData( list, this.getParams( list ) ).then( (data : any) => {
            debugger;
        });
    }

    private getParams( list ) : any
    {
        var params : any = {};

        if (list.current_search)
            params.search = list.current_search;

        if (!list.multiFilters()) {
            if (list.current_filter)
                params.types = [list.current_filter];
        }
        else
        {
            if (list.current_filters)
                params.types = list.current_filters;
        }

        return params;
    }
}