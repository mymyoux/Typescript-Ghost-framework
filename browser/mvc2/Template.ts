import {LocalForage} from "browser/data/Forage";
import {API2} from "browser/api/API2";
import {Auth} from "./Auth";
import {CoreObject} from "ghost/core/CoreObject";
import {Component} from "./Component";
export class Template extends CoreObject
{
    protected static _templates:any = {};
    protected static _api:API2;
    protected static cacheEnabled:boolean = true;
    public static get(name:string):Promise<any>
    {
        return new Promise<any>((resolve, reject):void=>
        {
            if(Template._templates[name])
            {
                return  resolve(Template._templates[name]);
            }

            this.cache().getItem(name).then((data:any):void=>
            {
                var template:Template = Template._templates[name] = new Template(name);
                if(this.cacheEnabled && data)
                {
                    template.readExternal(data);
                    if(template.hasComponent())
                    {
                        template.components.map(this.addComponent.bind(this));
                    }
                    resolve(template);
                    return;
                }
                template.load().then(()=>
                {
                    if(template.hasComponent())
                    {
                        template.components.map(this.addComponent.bind(this));
                    }
                    if(this.cacheEnabled)
                        this.cache().setItem(name, template.writeExternal());
                }, reject).then(function(){resolve(template);}, reject);

            });

        });
    }
    public static sync():Promise<any>
    {
        if(!this.cacheEnabled)
        {
            return null;
        }
         var templates:any[] = [];
        return  this.cache().iterate(function(template:any):void{
            var requestTemplate:any ={url:template.name};
            requestTemplate.version = template.version
            templates.push(requestTemplate);
        }).then(()=>
        {
            if(!templates.length)
            { 
                return;
            }
            return API2.request().path('vue/get-expired').param("templates", templates);
        }).then((data:any)=>
        { 
            //no expired or no cached templates
           if(!data || !data.length)
                return; 
            
            data.forEach((name:string):void=>
            { 
                console.log('template-expired: '+name);
                this.cache().setItem(name, null);
            });
        });
    }
    public static useCache(value:boolean):void
    {
        this.cacheEnabled = value;
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
    public readExternal(data:any):void
    {
        this.template = data.template;
        this.version = data.version;
        this.components = data.components;
    }
    public writeExternal():any
    {
        return {name:this.name, template:this.template, version:this.version, components:this.components};
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