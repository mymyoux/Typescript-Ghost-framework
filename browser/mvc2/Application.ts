import {MasterRouter} from "./MasterRouter";
import {Template} from "./Template";
import {Auth} from "./Auth";

import {Configuration} from "ghost/data/Configuration";
import {APIExtended as API} from "browser/api/APIExtended";
import {API2} from "browser/api/API2";
import {Objects} from "ghost/utils/Objects";
export class Application
{
    protected steps:string[] = ["initAPI", "initUser","initTemplate","initRoute"];
    public constructor()
    {

    }
    protected boot():void
    {
        //you can modify steps here
    }
    public run():void
    {
        this.boot();
        this._step(this.steps.shift());
    }
    protected _step(step:string):void
    {
        if(!step)
            return this.ready();
        console.log("step:"+ step);
        var promise:Promise<any> = this[step]();
        if(!promise)
            return this._step(this.steps.shift());
        promise.then(()=>
        {
            this._step(this.steps.shift());
        }, function(error:any)
        {
            //bad initialisation
            console.error(error);
            debugger;
        });
    }
    protected loadsDataFromHTML()
    {
        var data:any;
        try
        {
            if(!$("#data").length)
            {
                data = {};
            }
            else
            data = JSON.parse($("#data").html());
        }catch(error)
        {
            console.error("Error during parsing initial DATA", error);
            return;
        }
        if(data["config"])
        {
            Configuration.merge(data["config"]);
        }
    }
    protected configureAPI():void
    {
        var name: string = window.location.pathname;
        var index:number = name.indexOf("/", 1);
        if(index!= -1)
        {
            name = name.substring(0, index);
        }
        var shortorigin: string;
        var temp: string[] = window.location.hostname.split(".");
        shortorigin = temp[temp.length - 2] + "." + temp[temp.length - 1];
        var apis: any = { "v1":API, "v2":API2 };
        var apiConfig: any = Objects.clone(Configuration.get("api"));
        var config: any;
        var api: any;
        for(var p in apiConfig)
        {
            api = apis[p];
            config = apiConfig[p];
            for(var q in config)
            {
                if (typeof config[q] != "string")
                    continue;
                config[q] = config[q].replace('%origin%', window.location.origin);
                config[q] = config[q].replace('%pathname%', name);
                config[q] = config[q].replace('%shortorigin%', shortorigin);
                config[q] = config[q].replace('%protocol%', window.location.protocol);
                config[q] = config[q].replace('%usertoken%', Auth.check()?Auth.user()["token"]:'');
                config[q] = config[q].replace('%id_user%', Auth.id());
                if(config[q] === "undefined")
                {   
                    delete config[q];
                }
            } 
            if(api.hasInstance(name))
            {
                api.instance(name).config(config);
            }else
                api.instance(config.name, new api()).config(config);
        }
    }
    protected initAPI():void
    {
        this.loadsDataFromHTML();
        this.configureAPI();
    }
    protected initUser():Promise<any>
    {
        return new Promise<any>((resolve, reject):void=>
        {
           API2.instance().path('user/me').then((data:any):void=>
           {
                Auth.setUser(data);
                this.configureAPI();
                resolve();
           }, function(error)
           {
               debugger;
               console.error(error);
               reject(error);
           });
        });
    }
    protected initTemplate():void
    {
        Template.setApi(API2.instance());
    }
    protected initRoute():void
    {
        //init routes
        //call Router.addPackage(controllers);
        //Router.listen();
        if(this["controllers"])
        {
            MasterRouter.addPackage(this["controllers"]);
            MasterRouter.listen();
        }
    }
    protected ready():void
    {

    }
}