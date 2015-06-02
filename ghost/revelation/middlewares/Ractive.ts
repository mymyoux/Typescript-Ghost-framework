///<file="RouteController"/>
///<file="IMiddleWare"/>
///<module="io"/>
///<lib="node"/>
module ghost.revelation.middlewares
{
    var path_module = require("path");
    export class Ractive implements ghost.revelation.IMiddleWare
    {
        public path:string = "/views/*";
        public localPath:string = "public/templates";
        public method:string = "get";
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
        public setApplication(application:Application):void
        {
            application.route(this.method, this.path, this.onRequest.bind(this));
        }
        protected onRequest(request:any, response:any):void
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
        }
    }
}