//convert
 /*:ghost.io.File */
import {File} from "ghost/io/File";
//convert-files
import {RouteController} from "../RouteController";
//convert-files
import {IMiddleWare} from "../IMiddleWare";
///<module="io"/>


    
    //convert-import
import {Application} from "ghost/revelation/Application";
    var path_module = require("path");
    export class Ractive implements IMiddleWare
    {
        public path:string = "/views/*";
        public localPath:string = "public/templates";
        public method:string = "get";
        public loading:boolean = true;
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
                if(this.hasOwnProperty(p))
                {
                    if(data[p] !== undefined)
                    {
                        this[p] = data[p];
                    }
                }
            }
        }
        public setApplication(application:Application):boolean
        {
            console.log("set application ractive");
            application.route(this.method, this.path, this.onRequest.bind(this));
            return true;
        }
        protected onRequest(request:any, response:any):void
        {
            var path:string = request.url.substring(this.path.length-2  );
            if(path_module.extname(path) == "")
            {
                path =  path + ".ractive";
            }
            path = path_module.join(this.localPath,path);
            var file:File = new File(path);
            file.read(function(success:boolean, data:any):void
            {
               if(success)
               {
                   response.send(data);
               }else
               {
                   response.sendStatus(404);
               }
            });
        }
    }
