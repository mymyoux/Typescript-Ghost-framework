import {Router} from "./Router";
import {IRoute} from "./IRoute";
import {Template} from "./Template";
import {Inst} from "./Inst";
import {Component} from "./Component";
import {Classes} from "ghost/utils/Classes";
import {Step} from "browser/performance/Step";
export class Master 
{
    protected activationSteps:string[] = ["bootTemplate", "bootVue","bindVue","renderVue","bootComponents"];
    protected _template:Template;
    protected template:any;
    protected container:HTMLElement;
    protected vueConfig:any;
    protected components:Component[];
    protected params:any;
    public constructor() 
    {
        this.components = [];
    }
    /**
     * Called by MasterRouter on initilisation
     * @warning you can use this but it's not the real instance of this Master (prototype.call)
     */
    public route(masterRouter:any):IRoute
    {
        if(typeof this["path"] == "function")
        {
            var path:string = this["path"]();
            var type:string = Router.TYPE_STATIC;
            if(typeof path == "string")
            {
                if(path.indexOf(':')!=-1)
                {
                    type = Router.TYPE_SEGMENT;
                }
            }else
            {
                if(path instanceof RegExp)
                {
                    type = Router.TYPE_REGEXP;
                }
            }
            var route:IRoute = Router[type](path);
            route.scope = this.scope();
            return route;
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
        console.log('[master] handle route: ',this);
        return true;
    }
     /**
     * Called when a route is activated
     */
    public handleActivation(url:string, route:IRoute):void
    {
        if(route.params)
        {
            this.params = route.params;
        }
        console.log('[master] handle activation: ',this);
        this._nextActivationStep(0);
    }
    public param(name:string):any
    {
        return this.params?this.params[name]:null;
    }
    public handleDisactivation():void
    {
        this.disactivate();
        this.dispose();
    }
    private _nextActivationStep(step:number):void
    {
        if(step>=this.activationSteps.length)
        {
            return this.activate();
        }
        Inst.get(Step).register(this._getName()+'-init-'+this.activationSteps[step]);
        var result:Promise<any> = this[this.activationSteps[step]]();
        if(!result)
        {
            Inst.get(Step).register(this._getName()+'-init-'+this.activationSteps[step]);
            return this._nextActivationStep(step+1);
        }
        result.then(()=>
        {
            Inst.get(Step).register(this._getName()+'-init-'+this.activationSteps[step]);
            this._nextActivationStep(step+1);
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
    protected disactivate():void
    {
        
    }
    private dispose():void
    {
        console.log("[master] dispose:", this);
        this.disposeTemplate();
    }
    protected disposeTemplate():void
    {
        if(this.template)
        {
            this.template.$destroy();
            $(this.template.$el).remove();
            this.template = null;
            this.container = null;
        }
    }
    protected bootTemplate():Promise<any>
    {
        var templatePath:string;
        if(typeof this["templatePath"] == "function")
        {
            templatePath = this["templatePath"]();
            
        }else
        if(typeof this["path"] == "function")
        {
            templatePath = this["path"]();
        }
        if(templatePath)
        {
          
            Inst.get(Step).register(this._getName()+'-load-template');
            return Template.get(templatePath).then((template:Template)=>
            {
                Inst.get(Step).register(this._getName()+'-load-template');
                this._template = template;
                // if(!this._template.hasComponent())
                // {
                //     return;
                // }
                // this._template.components.map(this.$addComponent.bind(this));
            });
        }
        return null;
    }
    protected bindVue():void
    {
        throw new Error('override this');
    }
    protected $addComponent(name:string):void
    {
        if(!Vue.component('component-'+name))
        {
            Vue.component('component-'+name, Component.load.bind(Component, name));
        }
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
        if(!model)
        {
            console.warn('model given is null');
            return;
        }
        model = Inst.get(model);
        name = name?name:model.getModelName();
        model.on(model.constructor.EVENT_FORCE_CHANGE, this.onModelChanged, this, name, model);
        this.$addData(name, model);
        return model;
    }
    protected $getModel(name:string):any
    protected $getModel(model:any):any
    protected $getModel(model:any):any
    {
        if(typeof model == "string")
            return this.$getData(model);
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
    protected onModelChanged(name:string, model:any):void
    {
        this.$addData(name, model);
    }
    protected bootVue():void
    {
        this.disposeTemplate();
        this.vueConfig = {
            el:this.getContainer(),
            name:this._getName(),
            template:this._template.getContent()
        }; 
        const restricted:string[] = ["$addData","$addMethod","$addComputedProperty","$addModel","$getModel","$getData","$addComponent"];
        //add $Methods by defaut
        for(var p in this)
        {
            if(typeof this[p] == "function" && p.substring(0, 1)=="$" && restricted.indexOf(p)==-1)
            {
                if(p.substring(1, 2) == "$")
                {
                    this.$addComputedProperty(p.substring(2), (<any>this[p])());
                }else
                {
                    this.$addMethod(p.substring(1), (<any>this[p]).bind(this));
                }
            } 
        }
    }
    protected renderVue():void
    {
        window["template"] = this.template = new Vue(this.vueConfig);
    }
    protected bootComponents():void
    {
        this.template.$on('new-component',this.onNewComponent.bind(this));
    }
    private onNewComponent(component:Component):void
    {
        component.setParent(this);
        this.components.push(component);
    }
    private removeComponent(component:Component):void
    {
        var index:number = this.components.indexOf(component);
        if(index != -1)
        {
            this.components.splice(index, 1); 
        }
    }
    public getComponent(componentClass:typeof Component):Component
    public getComponent(name:string):Component
    public getComponent(index:number):Component
    public getComponent(component:any):Component
    {
        if(typeof component == "number")
        {
            return this.components[component];
        }
        if(typeof component == "string")
        {
            for(var comp of this.components)
            {
                if(typeof component == "string" && comp.getComponentName()==component)
                {
                    return comp;
                }
                if(typeof component == "function" && comp.constructor === component)
                {
                    return comp;
                }
            }
        }
        return null;
    }
}