import {Template} from "./Template";
import {CoreObject} from "ghost/core/CoreObject";
import {Inst} from "./Inst";
export class Component extends CoreObject
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
        var name:string = cls.prototype.getComponentName.call(cls.prototype);
        Component.components[name] = cls;
        console.log("add component:"+name);
        // if(!Vue.component('component-'+name))
        //     Vue.component('component-'+name, Component.load.bind(Component, name));
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
    public static load(name:string):Promise<any>
    {
        
        return new Promise<any>((resolve, reject)=>
        {
            Template.get(name.replace(/-/g,'/')).then((template:Template)=>
            {
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
                var methods:string[] = [];
                var computed:string[] = [];
                const restricted:string[] = ["$addData","$addMethod","$addComputedProperty","$addModel","$getModel","$getData","$addComponent"];
                //add $Methods by defaut
                for(var p in cls.prototype)
                {
                    if(typeof cls.prototype[p] == "function" && p.substring(0, 1)=="$" && restricted.indexOf(p)==-1)
                    {
                            if(p.substring(1, 2) == "$")
                            {
                                computed.push(p.substring(2));
                            }else{
                                methods.push(p.substring(1));
                            }
                        //this.$addMethod(p.substring(1), (<any>this[p]).bind(this));
                    } 
                }
                resolve(
                {
                    template:template.getContent(),
                    props:cls.prototype.props(),
                    methods:methods.reduce(function(previous:any, method:string):any
                    {   
                        previous[method] = function(...data:any[])
                        {
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
                    beforeCreate:function()
                    {
                        (new cls(this)).boot();
                    },
                    mounted:function()
                    {
                        var component:Component = Component.getComponentFromVue(this);
                        if(!component)
                            return;
                        component.mounted();
                    },
                    beforeDestroy:function()
                    {
                        var index:number = Component.instancesVue.indexOf(this);
                        if(index != -1)
                        {
                            Component.instances[index].dispose();
                            Component.instances.splice(index, 1);
                            Component.instancesVue.splice(index, 1);
                        }else{
                            debugger;
                        }
                    },
                    data:function()
                    {
                        var component:Component = Component.getComponentFromVue(this);
                        if(!component)
                            return null;
                        return component.data();
                    },
                });
            });
        });
    }
    /**
     * @see https://vuejs.org/v2/guide/components.html#Prop-Validation
     */
    
    protected parent:any;
    private _shortName:string;
    private _dataLoaded:boolean;
    private vueConfig:any;
    protected steps:string[] = ["bindVue","bootComponents"];
    protected components:Component[];
    public constructor(public template:any)
    {
        super();
        this.vueConfig = {};
        this.components = [];
        Component.instances.push(this);
        Component.instancesVue.push(this.template);
    }
    public boot():void
    {
        this._nextStep(this.steps.shift());
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
    private mounted():void
    {
        this.template.$parent.$emit('new-component', this);
        if(this["onMounted"])
            this["onMounted"]();
    }
    public setParent(parent:any):void
    {
        this.parent = parent;
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
    private emit(name:string, ...data:any[]):void
    {
        if(this.parent)
        {
            name = "$on"+name.substring(0, 1)+name.substring(1);
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
    private remit(name:string, ...data:any[]):void
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
                console.log(name+" not found on root - emit default event", parent);
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
        this.template.$set(this.template[name], name, value);
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
        model.on(model.constructor.EVENT_FORCE_CHANGE, this.onModelChanged, this, name, model);
        this.$addData(name, model);
        return model;
    }
    protected $addComputedProperty(name:string, computed:Function):void
    {
        throw new Error("you can't use component#$addComputedProperty you must use $$method syntax instead");
    }
    protected $addComponent(name:string):void
    {
        if(!Vue.component('component-'+name))
        {
            Vue.component('component-'+name, Component.load.bind(Component, name));
        }
    }
    protected onModelChanged(name:string, model:any):void
    {
        this.$addData(name, model);
    }
    protected bindVue():void
    {
        
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
    protected activate():void
    {

    }
    
    public getComponentName():String
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
        console.log("[component] dispose:", this);
        if(this.parent)
        {
            this.parent.removeComponent(this);
            this.parent = null;
            this.template = null;
        }
    }
}