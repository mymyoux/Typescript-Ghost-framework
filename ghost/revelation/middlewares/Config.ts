///<file="RouteController"/>
///<file="IMiddleWare"/>
///<module="io"/>

///<lib="node"/>
namespace ghost.revelation.middlewares
{
    //tsc:uncomment
    //import Application = ghost.revelation.Application;
    var path_module = require("path");
    var fs_module = require("fs");
    export class Config implements ghost.revelation.IMiddleWare
    {
        public path:string = "config/";
        public loading:Promise<any>|boolean;
        private _files:number = 0;
        private _resolve:Function;
        public constructor()
        {
            this.loading = new Promise<any>((resolve:Function, reject:Function)=>
            {
                this._resolve = resolve;
            });
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
        public setApplication(application:Application):Promise<any>|boolean
        {
            console.log("set application config", this.loading);
            //application.route(this.method, this.path, this.onRequest.bind(this));
            this.loadConfig();
            return this.loading;
        }
        protected loadConfig():void
        {
            console.log("LOADING FILES");
            fs_module.readdir(this.path, (error:any, files:string[]):void=>
            {
                if(error)
                {
                   console.log("Error loading configuration path", this.path);
                   console.log(error);
                   return;
                }
                this._files = files?files.length:0;
                files.map(function(file:string):string
                {
                    return path_module.join(this.path, file);
                }, this).forEach(this.loadFile, this);
            });
        }
        protected loadFile(file:string):void
        {

            fs_module.readFile(file, "utf8", (error:any, data:string):void=>
            {
                var name:string = path_module.basename(file, path_module.extname(file));
                this[name] = JSON.parse(data);
                this._files--;
                if(this._files == 0)
                {
                    this.ready();
                }
            });
        }
        private ready():void
        {
            console.log("CONFIGURATION READY");
            this._resolve();
            this.loading = true;
        }
        /*protected onRequest(request:any, response:any):void
        {
            var path:string = request.url.substring(this.path.length-2  );
            if(path_module.extname(path) == "")
            {
                path =  path + ".ractive";
            }
            path = path_module.join(this.localPath,path);
            var file:ghost.io.File = new ghost.io.File(path);
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
        }*/
    }
}