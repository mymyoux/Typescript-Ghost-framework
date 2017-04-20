import {Template} from "./Template";
import {CoreObject} from "ghost/core/CoreObject";
export class Component extends CoreObject
{
    protected static components:any = {};
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
    }
    public static load(name:string):Promise<any>
    {
        
        return new Promise<any>((resolve, reject)=>
        {
            Template.get(name).then((template:Template)=>
            {
                var cls:any = Component.components[name];
                if(!cls) 
                {
                    console.warn('use default class component for '+name);
                    cls = Component;
                }
                resolve(
                {
                    template:template.getContent(),
                    mounted:function()
                    {
                        (new cls(this)).boot();
                    }
                });
            });
        });
    }
    /**
     * @see https://vuejs.org/v2/guide/components.html#Prop-Validation
     */
    protected props:any;
    protected parent:any;
    private _shortName:string;
    protected steps:string[] = ["bootParent"];
    public constructor(public vueComponent:any)
    {
        super();
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
    protected bootParent():void
    {
        this.vueComponent.$parent.$emit('new-component', this);
    }
    public setParent(parent:any):void
    {
        this.parent = parent;
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
}