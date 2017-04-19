import {Router} from "./Router";
import {IRoute} from "./IRoute";
import {Template} from "./Template";
import {Inst} from "./Inst";
import {Classes} from "ghost/utils/Classes";
export class Master 
{
    protected activationSteps:string[] = ["bootTemplate", "bootVue","bindVue","renderVue"];
    protected _template:Template;
    protected template:any;
    protected container:HTMLElement;
    protected vueConfig:any;
    public constructor() 
    {
        
    }
    /**
     * Called by MasterRouter on initilisation
     * @warning you can use this but it's not the real instance of this Master (prototype.call)
     */
    public route(masterRouter:any):IRoute
    {
        if(typeof this["path"] == "function")
        {
            return Router.static(this["path"]());
        }
        return null;
    }
    public scope():string
    {
        return "main";
    }
    protected _getName():string
    {
        var name:string = Classes.getName(this.constructor);
        name = name.replace('Master', '');
        name = name.replace('Controller', '');
        return name;
    }
    public getContainer():HTMLElement
    {
            if(this.container)
            {
                return this.container;
            }
            var $scope = $("[data-scope='" + this.scope() + "']");
            if($scope.length)
            {
                var name:string = this._getName();
                 var container:HTMLElement = $scope.children("[data-container='"+name+"']").get(0);
	            if(!container)
	            {
	            	$scope.append('<div data-container="'+name+'"></div>');
	                container = $scope.children("[data-container='"+name+"']").get(0);
	            }
                return this.container = container;
            }
        return null;
    }
    /**
     * Called first after instanciation
     */
    public boot():void
    {

    }
    /**
     * Called when a route match
     */
    public handleRoute(url:string, route:IRoute):boolean
    {
        return true;
    }
     /**
     * Called when a route is activated
     */
    public handleActivation(url:string, route:IRoute):void
    {
        this._nextActivationStep(this.activationSteps.shift());
    }
    private _nextActivationStep(step:string):void
    {
        if(!step)
        {
            return this.activate();
        }
        var result:Promise<any> = this[step]();
        if(!result)
            return this._nextActivationStep(this.activationSteps.shift());
        result.then(()=>
        {
            this._nextActivationStep(this.activationSteps.shift());
        }, (error:any)=>
        {
            debugger;
            console.error("activation error, step="+step, error);
        });
    }
    /**
     * Called when master is activated && internals traitments are done
     */
    protected activate():void
    {

    }
    protected bootTemplate():Promise<any>
    {
        var templatePath:string;
        if(typeof this["template"] == "function")
        {
            templatePath = this["template"]();
            
        }else
        if(typeof this["path"] == "function")
        {
            templatePath = this["path"]();
        }
        if(templatePath){
            return Template.get(templatePath).then((template:Template)=>
            {
                this._template = template;
            });
        }
        return null;
    }
    protected bindVue():void
    {
        throw new Error('override this');
    }
    protected $addComputedProperty(name:string, computed:Function):void
    {
        if(!this.vueConfig.computed)
        {
            this.vueConfig.computed = {};
        }
        this.vueConfig.computed[name] = computed;
    }
    protected $addData(name:string, value:any):void
    {
        if(!this.template)
        {
            if(!this.vueConfig.data)
            {
                this.vueConfig.data = {};
            }
            this.vueConfig.data[name] = value;
            return;
        }
        this.template.$set(this.template, name, value);
    }
    protected $getData(name:string):any
    {
        if(!this.template) 
        {
            if(!this.vueConfig.data)
            {
                this.vueConfig.data = {};
            }
            return this.vueConfig.data[name];
        }
        return this.template[name];
    }
    protected $addModel(model:any):any
    protected $addModel(name:string, model:any):any
    protected $addModel(name:any, model?:any):any
    {
        if(typeof name != "string")
        {
            model = name;
            name = null;
        }
        model = Inst.get(model);
        this.$addData(name?name:model.getModelName(), model);
        return model;
    }
    protected $getModel(model:any):any
    {
        var name:string = model.prototype.getModelName.call(model);
        debugger;
        return this.$getData(model.prototype.getModelName.call(model));
    }
    protected $addMethod(name:string):void;
    protected $addMethod(name:string, method:Function):void
    protected $addMethod(name:string, method?:Function):void
    {
        if(!this.vueConfig.methods)
        {
            this.vueConfig.methods = {};
        }
        if(!method)
        {
            method = this[name].bind(this);
        }
        this.vueConfig.methods[name] = method;
    }
    protected bootVue():void
    {
        this.vueConfig = {
            el:this.getContainer(),
            name:this._getName(),
            template:this._template.getContent()
        };
        var restricted:string[] = ["$addData","$addMethod","$addComputedProperty"];
        //add $Methods by defaut
        for(var p in this)
        {
            if(typeof this[p] == "function" && p.substring(0, 1)=="$" && restricted.indexOf(p)==-1)
            {
                this.$addMethod(p.substring(1), (<any>this[p]).bind(this));
            } 
        }
    }
    protected renderVue():void
    {
        window["template"] = this.template = new Vue(this.vueConfig);
    }
}