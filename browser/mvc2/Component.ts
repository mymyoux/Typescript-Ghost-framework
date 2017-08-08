import {Template} from "./Template";
import {CoreObject} from "ghost/core/CoreObject";
import {EventDispatcher} from "ghost/events/EventDispatcher";
import {Inst} from "./Inst";
import {Model} from "./Model";
import {Step} from "browser/performance/Step";
import {Polyglot2} from "../i18n/Polyglot2";
import {Objects} from "ghost/utils/Objects";

export class Component extends EventDispatcher
{
    protected static components:any = {};
    protected static instances:Component[] = [];
    protected static instancesVue:any[] = [];
    public static addPackage(cls:any):void
    {
        for(var p in cls)
        {
            if(cls[p] && cls[p].prototype && cls[p].prototype.getComponentName)
            {
                this.addComponent(cls[p]);
            }
        }
    }
     public static addComponent(cls:any):void
    {
        var name:string|string[] = cls.prototype.getComponentName.call(cls.prototype);
        if(typeof name == "string")
        {
            Component.components[name] = cls;
            //console.log("add component:"+name);
        }else{
            for(var n of name)
            {
                Component.components[n] = cls;
                //console.log("add component:"+n);
            }
        }
    }

    public static addVueComponent(name:string, options?:any):void
    {
        if(!Vue.component('component-'+name))
        {
            Vue.component('component-'+name, Component.load.bind(Component, name, options));
        }
    }
    public static hasComponent(name:string):boolean
    {
        return  this.components[name] != undefined || Vue.component('component-'+name) != undefined;
    }
    private static getComponentFromVue(vue:any):Component
    {
        var index:number = Component.instancesVue.indexOf(vue);
        if(index != -1)
        {
             return Component.instances[index];
        }
        debugger;
        return null;
    }
    
    public static load(name:string, options?:any):Promise<any>
    {
        return new Promise<any>((resolve, reject)=>
        {
            Inst.get(Step).register('component-'+name+'-init');
            Template.get("components/"+name.replace(/-/g,'/')).then((template:Template)=>
            {
                template.once(Template.EVENT_CHANGE, this.onTemplateUpdated, this, template, name);
                var cls:any = Component.components[name];
                if(!cls) 
                {
                     cls = Component.components[name.replace(/-/g,'')];
                     if(!cls)
                     {
                        console.warn('use default class component for '+name);
                        cls = Component;
                     }
                }
                debugger;
                var methods:string[] = [];
                var computed:string[] = [];
                var watchers:string[] = [];
                var filters:any = {};
                const restricted:string[] = ["$getProp","$addData","$addMethod","$addComputedProperty","$addModel","$getModel","$getData","$addComponent","$addFilter","$addWatcher"];
                var directives:any = {};
                //add $Methods by defaut
                for(var p in cls.prototype)
                {
                    if(typeof cls.prototype[p] == "function")
                    {
                        if(restricted.indexOf(p)!=-1)
                            continue
                        if(p.substring(0, 1)=="$")
                        {
                            if(p.substring(1, 2) == "$")
                            {
                                computed.push(p.substring(2));
                            }else{
                                methods.push(p.substring(1));
                            }

                        }else if(p.substring(0, 1)=="W")
                        {
                            if(p.substring(1, 2)=="W")
                            {
                                var object:any =  cls.prototype[p]();
                                watchers.push({name:object.name?object.name:p.substring(2),...object});
                            }else{
                                watchers.push(p.substring(1));
                            }
                        }else if(p.substring(0, 1)=="F")
                        {
                            filters[p.substring(1)] = cls.prototype[p];
                            
                        }else if(p.substring(0, 1)=="D")
                        {
                            directives[p.substring(1)] = cls.prototype[p]();//.push(p.substring(1));
                        }
                    } 
                }

                var props:any = options && options.props?options.props:cls.prototype.props();

               var componentDefinition:any = {
                  
                    props:props,
                    methods:methods.reduce(function(previous:any, method:string):any
                    {   
                        previous[method] = function(...data:any[])
                        {
                            //console.log("comp-call-"+method+":"+this._uid+" "+name);
                            var component:Component = Component.getComponentFromVue(this);
                            if(!component)
                                return;
                            return component["$"+method](...data);
                        };
                        return previous;
                    }, {}),
                    computed:computed.reduce(function(previous:any, method:string):any
                    {   
                        previous[method] = function(...data:any[])
                        {
                            var component:Component = Component.getComponentFromVue(this);
                            if(!component)
                                return;
                            return component["$$"+method]().apply(this, data);
                        };
                        return previous;
                    }, {}),
                    watch:watchers.reduce(function(previous:any, method:any):any
                    {   
                        if(typeof method != "string")
                        {
                            previous[method.name] = method;
                        }else
                        previous[method] = function(...data:any[])
                        {
                            var component:Component = Component.getComponentFromVue(this);
                            if(!component)
                                return;
                            return component["W"+method](...data);
                        };
                        return previous;
                    }, {}),
                     filters:filters,
                    directives:directives,
                    beforeCreate:function()
                    {
                        //console.log("comp-before-create:"+this._uid+" "+name);
                        (new cls(this)).boot();
                    },
                    // beforeMount:function()
                    // {
                    //     var component:Component = Component.getComponentFromVue(this);
                    //     if(!component)
                    //         return;
                    //     component.beforeMounted();
                    // },
                    mounted:function()
                    {
                        var component:Component = Component.getComponentFromVue(this);
                        if(!component)
                            return;
                        //console.log("comp-mounted");
                        component.beforeMounted();
                        component.mounted();
                    },
                    beforeDestroy:function()
                    {
                        //console.log("comp-before-destroyed:"+this._uid+" "+name);
                        var index:number = Component.instancesVue.indexOf(this);
                        if(index != -1)
                        {
                            Component.instances[index].unbindEvents();
                            Component.instances[index].dispose();
                            Component.instances.splice(index, 1);
                            Component.instancesVue.splice(index, 1);
                        }else{
                            debugger;
                        }
                    },
                     destroyed:function()
                    {
                        //console.log("comp-destroyed:"+this._uid+" "+name);
                    },
                    data:function()
                    {
                        var component:Component = Component.getComponentFromVue(this);
                        if(!component)
                            return null;
                        var object:any = component.data();
                        if(object.__ob__)
                        {
                            delete object.__ob__;
                            console.warn("Vue observer already existed on object", this,component, object);
                        }
                        return object;
                    },
                };
                Object.defineProperty(componentDefinition, "template",
                {
                    get:function()
                    {
                        //console.log("comp-get-template:"+name);
                        return template.getContent()
                    },
                      enumerable: true,
                    configurable: true
                });
                resolve(componentDefinition
                );
            });
        });
    }
    private static onTemplateUpdated(template:Template, name:string):void
    {
        this.reloadComponentTemplate(name);
        for(var component of Component.instances)
        {
            if(component instanceof Component.components[name])
            {
                component.onTemplateUpdated();
            }
        }

        //this.template.$root.$emit('reload-component', this);
    }
    private static reloadComponentTemplate(name:string):void
    {
        delete Vue["options"].components["component-"+name];
        if(!Vue.component('component-'+name))
        {
            Vue.component('component-'+name, Component.load.bind(Component, name));
        }
    }
    /**
     * @see https://vuejs.org/v2/guide/components.html#Prop-Validation
     */
    
    protected parent:any;
    protected root:any;
    private _shortName:string;
    private _dataLoaded:boolean;
    private vueConfig:any;
    protected steps:string[] = ["bindVue","bindPolyglot","bootComponents"];
    protected components:Component[];
    protected _bindedEvents:any[];
    public constructor(public template:any)
    {
        super();
        this._bindedEvents = [];
        this.vueConfig = {};
        this.components = [];
        Component.instances.push(this);
        Component.instancesVue.push(this.template);
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
            if(event.liveselector)
            {
                $(event.elmt).off(event.type, event.listener, event.liveselector);
            }else
            {
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

        var elmts:any[] = $(selector).parents().addBack().toArray();
        for(var elmt of elmts)
        {
            if($(elmt).css('overflow-y') == 'auto' || $(elmt).css('overflow-y') == 'scroll')
            {
                
                return this.bindEvent(elmt, "scroll",listener);
            }
        }
    }
    protected bindEvent(selector:string, type:string, listener:any):void
    protected bindEvent(elmt:any, type:string, listener:any):void
    protected bindEvent(elmt:any, type:string, listener:any):void
    {
        this._bindedEvents.push({elmt:elmt,type:type,listener:listener});
        $(elmt).on(type, listener);
    }
    protected bindLiveEvent(selector:string, type:string, liveselector:any, listener:any):void
    protected bindLiveEvent(elmt:any, type:string, liveselector:any, listener:any):void
    protected bindLiveEvent(elmt:any, type:string, liveselector:any, listener:any):void
    {
        if(!elmt)
        {
            elmt = this.template.$el;
        }
        this._bindedEvents.push({elmt:elmt,type:type,liveselector:liveselector,listener:listener});
        $(elmt).on(type, liveselector, listener);
    }
    public $trad(key:string, options?:any):any
    {   
        var prefix:string = this.root.getTradKey();
        if(prefix)
        {
            key = prefix+"."+key;
        }
        return Polyglot2.instance().t(key, options);
    }
    public boot():void
    {
        this._nextStep(this.steps.shift());
    }
    private onTemplateUpdated():void
    {
        if(this.template && this.template.$root)
            this.template.$root.$emit('updated-component', this);
    }
    private _nextStep(step:string):void
    {
        if(!step)
        {
            return this.activate();
        }
        var result:Promise<any> = this[step]();
        if(!result)
            return this._nextStep(this.steps.shift());
        result.then(()=>
        {
            this._nextStep(this.steps.shift());
        }, (error:any)=>
        {
            debugger;
            console.error("activation error, step="+step, error);
        });
    }
    private data():any
    {
        this._dataLoaded = true;
        if(!this.vueConfig.data)
            return {}
        return this.vueConfig.data;
    }
    public props():any
    {
        return null;
    }
    private beforeMounted():void
    {
        this.template.$parent.onNewComponent(this);//$emit('new-component', this);
    }
    private mounted():void
    {
        this.bindEvents();
        //this.template.$parent.$emit('new-component', this);
        if(this["onMounted"])
            this["onMounted"]();
    }
    public setParent(parent:any):void
    {
        this.parent = parent;
    }
    public setRoot(root:any):void
    {
        this.root = root;
    }
    public $test()
    {
        return 45;
    }
    /**
     * Emit event to parent. Will try to call $onEvent method on parent before and fallback
     * to using this.template.$parent.$emit(event) method
     * @param name event's name
     * @param data optional data
     */
    protected emit(name:string, ...data:any[]):void
    {
        if(this.parent)
        {
            name = "$on"+name.substring(0, 1).toUpperCase()+name.substring(1);
            if(this.parent[name])
            {
                this.parent[name](...data);
                return;
            }
            console.log(name+" not found on parent - emit default event", this.parent);
        }
        this.template.$parent.$emit(name, this);
    }
    /**
     * Emit event to Root parent. Will try to call $onEvent method on root before and fallback
     * to using this.template.$root.$emit(event) method
     * @param name event's name
     * @param data optional data
     */
    protected remit(name:string, ...data:any[]):void
    {
        if(this.parent)
        {
            var parent:any = this.parent;
            while(parent instanceof Component)
            {
                parent = parent.parent;
            }
            if(parent)
            {
                name = "$on"+name.substring(0, 1).toUpperCase()+name.substring(1);
                if(parent[name])
                {
                    parent[name](...data);
                    return;
                }
                //console.log(name+" not found on root - emit default event", parent);
            }
        }
        this.template.$root.$emit(name, this);
    }
    protected $addData(name:string, value:any):void
    {
        if(!this._dataLoaded)
        {
            if(!this.vueConfig.data)
            {
                this.vueConfig.data = {};
            }
            this.vueConfig.data[name] = value;
            return;
        }
        if (this.template)
            this.template.$set(this.template, name, value);
    }
    protected $getData(name:string):any
    {
        if(!this._dataLoaded) 
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
    protected $getProp(name:string):any
    {
        if (this.template && this.template.$options && this.template.$options.propsData[name]!==undefined)
            return this.template.$options.propsData[name];
        
        console.warn('prop ' + name + ' not exist on template', this.template);

        return null;
    }    
    protected $addComputedProperty(name:string, computed:Function):void
    {
        throw new Error("you can't use component#$addComputedProperty you must use $$method syntax instead");
    }
    protected $addWatcher(name:string, bind:Function):void
    {
        throw new Error("you can't use component#$addWatcher you must use Wmethod syntax instead");
    }
    protected $addComponent(name:string):void
    {
        if(!Vue.component('component-'+name))
        {
            Vue.component('component-'+name, Component.load.bind(Component, name));
        }
    }
    public $proxy(method:string, ...params):void
    {
        if(this["$"+method])
        {
            return this["$"+method](...params);
        }else
        {
            if(this.parent && this.parent.$proxy)
            {
                this.parent.$proxy(method, ...params);
            }else{
                var transfert:any[] = [method].concat(params);
                    this.emit("proxy", ...transfert);

            }
        }
    }
     public $rproxy(method:string, ...params):void
    {
        if(this["$"+method])
        {
            return this["$"+method](...params);
        }else
        {
             if(this.root && this.root.$proxy)
            {
                this.root.$proxy(method, ...params);
            }else
            {
                var transfert:any[] = [method].concat(params);
                this.remit("proxy", ...transfert);

            }
        }
    }
    protected onModelChanged(name:string, model:any):void
    {
        this.$addData(name, model);
    }
    protected bindVue():void
    {
        
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
       // this.template.$on('new-component',this.onNewComponent.bind(this));
        this.template.$on('proxy',this.$proxy.bind(this));
    }
    protected $onNewComponent(component:Component):void
    {
        component.setParent(this);
        component.setRoot(this.root);
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
    protected activate():void
    {

    }
    
    public getComponentName():string|string[]
    {
        if(!this._shortName)
        {
            var name:string = this.getClassName();
            name =  name.replace('Component', '').toLowerCase();
            if(typeof this == "function")
                return name;
            this._shortName = name;
        }
        return this._shortName;
    }
    public dispose():void
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
        //console.log("[component] dispose:", this);
        if(this.parent)
        {
            this.parent.removeComponent(this);
            this.parent = null;
            this.template = null;
        }
        this.root = null;
    }
}