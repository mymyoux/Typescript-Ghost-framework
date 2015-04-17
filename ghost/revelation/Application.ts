///<file="Server"/>
///<file="RouteController"/>
///<module="framework/ghost/core"/>
///<module="framework/ghost/utils"/>
///<module="framework/ghost/db"/>
module ghost.revelation
{
	export class Application extends ghost.core.CoreObject
	{

		private _server:Server;
		private _io:any;
		private _http:any;
		private static methods:string[] = ["get","post"];
		private controllers:RouteController[];
		public db:ghost.db.mongo.MongoDB;
		public constructor()
		{ 
			super();
			console.log("Application test");
			this._http = require("express").Router();
			this.controllers = [];
			this.initDatabase();
			/*this._http.use(function()
			{
				console.log("ALL");
				console.log(arguments);
			});*/
		//	this._server = new Server(); 
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
		public get name():string
		{
			var name:string =  this.getClassName();
			name = name.replace(/Application/ig, "");
			return name.substring(0, 1).toLowerCase()+name.substring(1);
		}
		public get server():Server
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

		}
		public setServer(server:Server):void
		{
			this._server = server;
			this._io = this._server.io.of(this.name);
			this._server.use("/" + this.name, this._http);
			console.log("set new application:"+this.name);
		}
		public addRouteController(controller:RouteController):void
		{
			var name:string;
			var length:number;
			controller.setApplication(this);
			for(var p in controller.constructor.prototype)
			{
				for(var m in Application.methods)
				{
					m = Application.methods[m];
					length = m.length;
					if(ghost.utils.Strings.startsWith(p, m))
					{
							name = p.substring(length, length+1).toLowerCase()+p.substring(length+1);
							if(name == "index")
							{
								this._http[m]("/", controller.constructor.prototype[p].bind(controller));
							}
							this._http[m]("/"+name, controller.constructor.prototype[p].bind(controller));
							console.log(m+":/"+name);
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
					var route_str:string = "/"+route.getRoute();
					this._http[method](route_str, func.bind(controller));
					console.log(method+":"+route_str);
				}

			}

			this.controllers.push(controller);
		}

	}
	export interface IRoute
	{
		url?:string;
		callback?:Function;
		action?:string;
	}
}