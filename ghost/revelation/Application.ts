///<file="Server"/>
///<file="RouteController"/>
///<file="IMiddleWare"/>
///<module="framework/ghost/core"/>
///<module="framework/ghost/utils"/>
///<module="framework/ghost/db"/>
module ghost.revelation
{
	var path_module = require("path");
	export class Application extends ghost.core.CoreObject
	{

		private _server:Server;
		private _io:any;
		private _http:any;
		private static methods:string[] = ["get","post"];
		private controllers:RouteController[];
		private middlewares:IMiddleWare[];
		public db:ghost.db.mongo.MongoDB;
		public constructor()
		{ 
			super();
			console.log("Application test");
			this._http = require("express").Router();
			this.controllers = [];
			this.middlewares = [];
			this.initDatabase();
			/*this._http.use(function()
			{
				console.log("ALL");
				console.log(arguments);
			});*/
		//	this._server = new Server(); 
		}
        protected _initialize():void
        {
            var routes:any[] = this.getInitialRoutes();
            if(routes)
            {
                routes.forEach((item:any):void=>
                {
                    if(!item)
                    {
                        return;
                    }
                    var options:any;
                    if(typeof item == "function")
                    {
                        item = new item();
                    }else
                    {
                        if(item.cls)
                        {
                            options = item.options?item.options:null;
                            console.log(item);
                            item = new item.cls();
                        }
                    }
                    if(item)
                    {
                        if(item instanceof RouteController)
                        {
                            console.log("ADD ROUTE CONTROLLER" ,item.protype);
                            this.addRouteController(item);
                        }else
                        {
                            this.addMiddleWare(item, options);
                        }

                    }

                })
            }
            this.initialize();
        }
        protected initialize():void
        {

        }
		protected initDatabase():void
		{
			this.db = new ghost.db.mongo.MongoDB();
			this.db.setOptions(
			{
				url:"localhost",
				database:"test"
			});
		}
		private name():string
		{
			var name:string =  this.getClassName();
			name = name.replace(/Application/ig, "");
			return name.substring(0, 1).toLowerCase()+name.substring(1);
		}
		private server():Server
		{ 
			return this._server;
		}
		public start():void
		{
			//this._server.listen();
			console.log("Application start");
			this.controllers.forEach(function(controller:RouteController):void
			{
				controller.ready();
			}, this);
			this.ready();
		}
		public ready():void
		{
			this._server.use("/" + this.name()+"/?.*",function(request, response)
			{
				console.log("REQ");	
			});
		}
		public setServer(server:Server):void
		{
			this._server = server;
			this._io = this._server.io().of(this.name());
			this._server.use("/" + this.name(), this._http);
			console.log("set new application:"+this.name());
            this._initialize();
		}
        public getServer():Server
        {
            return this._server;
        }
		public addMiddleWare(middle:Function, options?:any):void;
		public addMiddleWare(middle:IMiddleWare, options?:any):void;
        public addMiddleWare(middle:any, options?:any):void
        {
            if(typeof middle == "function")
            {
                return this.addMiddleWare(new middle(), options);
            }
            middle.setOptions(options);
            middle.setApplication(this);
            this.middlewares.push(middle);


        }
		public addRouteController(controller:RouteController):void
		{
			var name:string;
			var length:number;
			controller.setApplication(this);
			var prefix:string = controller.prefix();
			if(!prefix)
			{
				prefix = "/";
			}
			if(prefix.substring(0, 1) != "/")
			{
				prefix = "/"+prefix;
			}
			for(var p in controller.constructor.prototype)
			{
				if(RouteController.IGNORED.indexOf(p)!=-1)
				{
					continue;
				}
				for(var m in Application.methods)
				{
					m = Application.methods[m];
					length = m.length;
					if(ghost.utils.Strings.startsWith(p, m))
					{
							name = p.substring(length, length+1).toLowerCase()+p.substring(length+1);
							if(name == "index")
							{
                                this.route(m, prefix, controller.constructor.prototype[p].bind(controller));
								//this._http[m]("/", controller.constructor.prototype[p].bind(controller));
							}
                            this.route(m, path_module.join(prefix,name), controller.constructor.prototype[p].bind(controller));
							//this._http[m]("/"+name, controller.constructor.prototype[p].bind(controller));
					}
				}
				if(ghost.utils.Strings.startsWith(p, "route"))
				{
					var route:Route = controller[p]();
					if(!(route instanceof Route))
					{
						throw new Error("a method routeXXX must return a route instance");
					}
					var func:Function = route.getCallback();
					var method:string = route.getMethod();
					var route_str:string = path_module.join(prefix, route.getRoute());
                    this.route(method, route_str, func.bind(controller));
					//this._http[method](route_str, func.bind(controller));
				}

			}

			this.controllers.push(controller);
		}
        protected getInitialRoutes():IRouteOptions[]|Function[]
        {
            return null;
        }
        public route(method:string, path:string, callback:Function):void
        {
            console.log("ADD:"+method+":/"+this.name()+path);
            this._http[method](path, callback);
        }

	}
	export interface IRoute
	{
		url?:string;
		callback?:Function;
		action?:string;
	}
    export interface IRouteOptions
    {
        cls:Function;
        options?:any;
    }
}