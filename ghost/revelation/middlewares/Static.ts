
//convert-files
import {RouteController} from "../RouteController";
//convert-files
import {IMiddleWare} from "../IMiddleWare";
///<module="io"/>


    
    //convert-import
import {Application} from "ghost/revelation/Application";
    var express_module = require("express");
    export class Static implements IMiddleWare
    {
        public path:string = "/";
        public localPath:string = "public";
        public constructor()
        {

        }
        public setOptions(data:any):void
        {
            if(!data)
            {
                return;
            }
            for(var p in this)
            {
                console.log(p);
                if(this.hasOwnProperty(p))
                {
                    console.log("=>"+p, data[p]);
                    if(data[p] !== undefined)
                    {
                        console.log("==>>"+p, data[p]);
                        this[p] = data[p];
                    }
                }
            }
        }
        public setApplication(application:Application):boolean
        {
            console.log("set application static");
            console.log("USE EXPRESS:"+this.localPath);
            //application.getServer().use(express_module.static(this.localPath));
            application.route("use", this.path, express_module.static(this.localPath));
            return true;
        }
    }
