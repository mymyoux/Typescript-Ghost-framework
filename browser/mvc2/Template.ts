import {LocalForage} from "browser/data/Forage";
import {API2} from "browser/api/API2";
import {Auth} from "./Auth";
export class Template
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
            template.load().then(resolve, reject);
        });
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
    protected content:string;
    protected version:number;
    public constructor(public name:string)
    {

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
        this.content = data.template;
        this.version = data.version;
    }
    public getContent():string
    {
        return this.content;
    }
}