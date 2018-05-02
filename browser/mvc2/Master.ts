import {Router} from "./Router";
import {IRoute} from "./IRoute";
import {Template} from "./Template";
import {Inst} from "./Inst";
import {Component} from "./Component";
import {Model} from "./Model";
import {Classes} from "ghost/utils/Classes";
import {Step} from "browser/performance/Step";
import {Polyglot2} from "browser/i18n/Polyglot2";
import {Strings} from "ghost/utils/Strings";
import {Objects} from "ghost/utils/Objects";
import {Arrays} from "ghost/utils/Arrays";
export class Master 
{
    protected activationSteps:string[] = ["bootTemplate", "bootVue","bindVue","renderVue","bindEvents","bindPolyglot","bootComponents"];
    protected _template:Template;
    protected template:any;
    protected container:HTMLElement;
    protected vueConfig:any;
    protected components:Component[];
    protected params:any;
    protected _bindedEvents:any[];
    protected _route:IRoute;
    private _deactivation: boolean = false;
    private _activated: boolean = false;

    public constructor() 
    {
        this.components = [];
        this._bindedEvents = [];
    }
    /**
     * Called by MasterRouter on initilisation
     * @warning you can use this but it's not the real instance of this Master (prototype.call)
     */
    public route(masterRouter:any):IRoute
    {
        if(this._route)
            return this._route;
        if(typeof this["path"] == "function")
        {
            var path:any = this["path"]();
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
            return this._route = route;
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

        this._activated = false;
        this._deactivation = false;
    }
    public param(name:string):any
    {
        return this.params?this.params[name]:null;
    }
    public updateURL(suffix:any|any[]):void
    {
        var route:any = this._route;
        if(!Arrays.isArray(suffix))
        {
            suffix = [suffix];   
        }
        var url:string = null;
        if(route.starts_with)
        {
            url = route.starts_with;
        }
        if(!url)
        {
            debugger;
            return;
        }
        if(!Strings.endsWith(url, "/"))
        {
            url+="/";
        }
        url+=suffix.join("/");
        Router.instance().silentGoto(url, this.scope());
    }
    public handleDisactivation():void
    {
        if (this._activated)
        {
            this.unbindEvents();
            this.disactivate();
            this.dispose();
            this._activated = false;
            this._deactivation = false;
            console.warn('[Master.ts : handleDisactivation] done ' + this._getName());
        }
        else
        {
            // gracefully deactivate (wait for the controller to be activate first)
            this._deactivation = true;
            console.warn('[Master.ts : handleDisactivation] deactivation = true ' + this._getName());
            // case never activated ? Add a timer to auto deactivate ?
        }
    }
    private _nextActivationStep(step:number):void
    {
        // console.log(step + ' ' + this._getName() + '-init-' + this.activationSteps[step]);
        
        if(step>=this.activationSteps.length)
        {
            this._activated = true;
            if (this._deactivation)
            {
                // gracefully deactivate after the activation
                return this.handleDisactivation();
            }
            return this.activate();
        }
        else
        {
            if (this._deactivation) {
                return this._nextActivationStep(step + 1);
            }
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
            console.error("Error step: " +this.activationSteps[step], this);
            console.log(error);
            debugger;
            console.error("activation error, step="+step, error);
            // do we deactivate ?
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
        if(this.vueConfig && this.vueConfig.data)
        {
            for(var p in this.vueConfig.data)
            {
                if(this.vueConfig.data[p] && this.vueConfig.data[p].off){
                    this.vueConfig.data[p].off(Model.EVENT_FORCE_CHANGE, this.onModelChanged, this);
                }   
            }
        }
        Polyglot2.instance().off("resolved", this.onPolyglotResolved, this);
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
            //segment url
            var index:number;
            if((index=templatePath.indexOf(":"))!=-1)
            {
                templatePath = templatePath.substring(0, index);
                if(Strings.endsWith(templatePath, "/"))
                {
                    templatePath = templatePath.substring(0, templatePath.length-1);
                }
            }
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
    protected onTemplateUpdated():void
    {
       console.log('comp-master: old template removed');
        if(this.template)
       {
           this.template.$destroy();
           $(this.template.$el).remove();
       } 
       console.log('comp-master: new template render');
       this.container = null;
       var config:any = {
            el:this.getContainer(),
             name:this._getName(),
            template:this._template.getContent(),
       }
       if(this.vueConfig.data)
       {
           config.data = {};
           for(var p in this.vueConfig.data)
           {
               config.data[p] = this.vueConfig.data[p];
           }
       }
       if(this.vueConfig.computed)
       {
           config.computed = {};
           for(var p in this.vueConfig.computed)
           {
               config.computed[p] = this.vueConfig.computed[p];
           }
       }
       if(this.vueConfig.methods)
       {
           config.methods = {};
           for(var p in this.vueConfig.methods)
           {
               config.methods[p] = this.vueConfig.methods[p];
           }
       }
       this.vueConfig = config;
       this.renderVue();
    }
    
    protected bindVue():void
    {
        throw new Error('override this');
    }
    protected bindEvents():void
    {

    }
    protected unbindEvents():void
    {
        var event:any;
        while(this._bindedEvents.length)
        {
            event = this._bindedEvents.shift();
            if(event.parent)
            {
                $(event.parent).off(event.type, event.elmt, event.listener);
            }else{

                $(event.elmt).off(event.type, event.listener);
            }
        }
    }
    protected scroll(listener:any):void
    protected scroll(selector:string, listener:any):void
    protected scroll(selector:any, listener?:any):void
    {       
        if(!listener)
        {
            listener = selector;
            selector = this.template.$el;
        }
        if(!listener)
            throw new Error('you must specify at least a listener');

        var elmts:any[] = $(selector).parents().addBack().toArray().reverse();
        for(var elmt of elmts)
        {
            if($(elmt).css('overflow-y') == 'auto' || $(elmt).css('overflow-y') == 'scroll')
            {
                 
                return this.bindEvent(elmt, "scroll",listener);
            }
        } 
    }
    protected smartScroll(listener:any):void
    protected smartScroll(selector:string, listener:any):void
    protected smartScroll(selector:any, listener?:any):void
    {       
        var async:boolean = true;
        if(!listener)
        {
            listener = selector;
            selector = this.template.$el;
            async = false;
        }
        if(!listener)
            throw new Error('you must specify at least a listener');

       


        var scrollListener:any = function(event)
        {
            var down:boolean =(event.originalEvent.deltaY !== undefined && event.originalEvent.deltaY>0) || (event.originalEvent.wheelDeltaY !== undefined && event.originalEvent.wheelDeltaY<0) || (event.originalEvent.wheelDeltaY==undefined && event.originalEvent.wheelDelta<0);
            if(!down)
                return;
            var target:any = event.currentTarget;
            if(target.scrollHeight - target.scrollTop <= target.clientHeight*2)
            {
                //needs to load
                listener(event);
            }
        };

        if(async)
        {
            var parent:any = document.scrollingElement?document.scrollingElement:document.body;
            // parent = document.body;
            // debugger;
            this.bindEvent(selector, "wheel",scrollListener, parent)
            this.bindEvent(selector, "scroll",scrollListener, parent);

            return;
        }else{
            var elmts:any[] = $(selector).parents().addBack().toArray().reverse();
            for(var elmt of elmts)
            {
                if($(elmt).css('overflow-y') == 'auto' || $(elmt).css('overflow-y') == 'scroll')
                {
                   
                    this.bindEvent(elmt, "wheel",scrollListener)
                    return this.bindEvent(elmt, "scroll",scrollListener);
                }
            }
        }
    }
    protected bindEvent(selector:string, type:string, listener:any, parent?:any):void
    protected bindEvent(elmt:any, type:string, listener:any):void
    protected bindEvent(elmt:any, type:string, listener:any, parent:any = null):void
    {
        this._bindedEvents.push({elmt:elmt,type:type,listener:listener, parent:parent});
        if(parent)
        {
            $(parent).on(type, elmt, listener);            
        }else
        {
            $(elmt).on(type, listener);
        }
    }
    protected $addComponent(name:string, options?:any):void
    {
        if(!Vue.component('component-'+name))
        {
            Vue.component('component-'+name, Component.load.bind(Component, name, options));
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
    protected $addWatcher(name:string, bind:Function):void{
        if(!this.vueConfig.watch)
        {
            this.vueConfig.watch = {};
        }
        this.vueConfig.watch[name] = bind;
    }
    protected $addFilter(name:string, bind:Function):void
    {
        if(!this.vueConfig.filters)
        {
            this.vueConfig.filters = {};
        }
        this.vueConfig.filters[name] = bind;
    }
    protected $addData(name:string, value:any):void
    {
        if(!this.vueConfig.data)
        {
            this.vueConfig.data = {};
        }
        this.vueConfig.data[name] = value;
        if(!this.template)
        {
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
            if (typeof name === "string")
                this.$addData(name, model);
            
            console.warn('model given is null');
            return;
        }
        model = Inst.get(model);
        name = name?name:model.getModelName();
        if(model.on)
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
        console.log('bootVue:', this);
        this.disposeTemplate();
        this.vueConfig = {
            el:this.getContainer(),
            name:this._getName(),
            template:this._template.getContent()
        }; 
        const restricted:string[] = ["$addWatcher","$addData","$addMethod","$addComputedProperty","$addModel","$getModel","$getData","$addComponent","$proxy","$addFilter"];
        //add $Methods by defaut
        var properties:string[] = Objects.getAllPropertiesName(this);
        for(var p of properties)
        {
            if(typeof this[p] == "function")
            {
                if(restricted.indexOf(p)!=-1)
                {
                    continue;
                }
                if(p.substring(0, 1)=="$")
                {
                    if(p.substring(1, 2) == "$")
                    {
                        this.$addComputedProperty(p.substring(2), (<any>this[p])());
                    }else
                    {
                        this.$addMethod(p.substring(1), (<any>this[p]).bind(this));
                    }
                }else if(p.substring(0, 1) == "W")
                {
                    this.$addWatcher(p.substring(1), (<any>this[p]).bind(this));
                }else if(p.substring(0, 1) == "F")
                {
                    this.$addFilter(p.substring(1), (<any>this[p]).bind(this));
                }
            } 
        }
    }
    public $proxy(method:string, ...params):void
    {
        if(this["$"+method])
        {
            return this["$"+method](...params);
        }else
        {
            console.warn("proxy method not found:"+method);
        }
    }
    public $trad(key:string, options?:any):any
    {   
        //force update : this.template.$forceUpdate();
        return Polyglot2.instance().t(key,options);
    }
    public getTradKey():string
    {
        return this._getName().toLowerCase();
    }

    protected renderVue():void
    {
        if(this.vueConfig.__ob__)
        {
            delete this.vueConfig.__ob__;
            console.warn("Vue observer already existed on object", this, this.vueConfig);
        }
        this.template = new Vue(this.vueConfig);
        this._template.once(Template.EVENT_CHANGE,this.onTemplateUpdated.bind(this));
    }
    protected bindPolyglot():void
    {
        Polyglot2.instance().on("resolved", this.onPolyglotResolved, this);
    }
    protected onPolyglotResolved():void
    {
        if(this.template)
            this.template.$forceUpdate();
    }
    protected bootComponents():void
    {
        //this.template.$on('new-component',this.onNewComponent.bind(this));
        this.template.$on('updated-component',this.onUpdatedComponent.bind(this));
        this.template.$on('proxy',this.$proxy.bind(this));
        this.template.$on('trad', function()
        {
            debugger;
        });
    }
    private onUpdatedComponent(component:Component):void
    {
        this.onTemplateUpdated();
    }
    private $onNewComponent(component:Component):void
    {
        component.setParent(this);
        component.setRoot(this);
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
    public getComponent(componentHTML:HTMLElement):Component
    public getComponent(name:string):Component
    public getComponent(index:number):Component
    public getComponent(component:any):Component
    {
        if(typeof component == "number")
        {
            return this.components[component];
        }
        if(component instanceof HTMLElement)
        {
            for(var comp of this.components)
            {
                if(comp.template && comp.template.$el === component)
                    return comp;
            }
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
            return null;
        }
        if(typeof component == "function")
        for(var comp of this.components)
        {
            if(comp instanceof component)
                return comp;
        }
        return null;
    }
}