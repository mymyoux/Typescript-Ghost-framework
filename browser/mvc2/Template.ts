import {LocalForage} from "browser/data/Forage";
import {API2} from "browser/api/API2";
import {Auth} from "./Auth";
import {CoreObject} from "ghost/core/CoreObject";
import {Component} from "./Component";
export class Template extends CoreObject
{
    protected static _templates:any = {};
    protected static _api:API2;
    public static get(name:string):Promise<any>
    {
        return new Promise<any>((resolve, reject):void=>
        {
            if(Template._templates[name])
            {
                return  resolve(Template._templates[name]);
            }
            var template:Template = Template._templates[name] = new Template(name);
            template.load().then(()=>
            {
                if(template.hasComponent())
                {
                    template.components.map(this.addComponent.bind(this));
                }
            }, reject).then(function(){resolve(template);}, reject);
        });
    }
    private static addComponent(name:string):void
    {
        if(!Vue.component('component-'+name))
            Vue.component('component-'+name, Component.load.bind(Component, name));
    }
    public static setApi(api:API2):void
    {
        Template._api = api;
    }
    public static api():API2
    {
        return Template._api;
    }
    protected static cache(): LocalForage 
    {
        return LocalForage.instance().war("templates2").war(Auth.check()?Auth.type():"visitor");
    }
    protected template:string;
    protected version:number;
    public components:string[];
    public constructor(public name:string)
    {
        super();
    }
    public load():Promise<any>
    {
        return new Promise<any>((resolve, reject):void=>
        {
            Template.api().path("vue/get").param('path', this.name).then((data:any)=>
            {
                this.readExternal(data);
                resolve(this);
            }, reject);
        });
    }
    protected readExternal(data:any):void
    {
        this.template = data.template;
        this.version = data.version;
        this.components = data.components;
    }
    public hasComponent():boolean
    { 
        return this.components && this.components.length!=0;
    }
    public getContent():string
    {
        return this.template;
    }
    public mounted():void
    {
        debugger;
        if(!window["k"])
        {
            window["k"] = [];
        }
        window["k"].push(this);
    }
}