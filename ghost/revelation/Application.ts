///<file="Server"/>
///<file="RouteController"/>
///<module="framework/ghost/core"/>
///<module="framework/ghost/utils"/>
module ghost.revelation
{
	export class Application extends ghost.core.CoreObject
	{

		private _server:Server;
		private _io:any;
		private _http:any;
		public constructor()
		{ 
			super();
			console.log("Application test");
			this._http = require("express").Router();
			/*this._http.use(function()
			{
				console.log("ALL");
				console.log(arguments);
			});*/
		//	this._server = new Server(); 
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
			console.log("route");
			var name:string;
			for(var p in controller.constructor.prototype)
			{
				if(ghost.utils.Strings.startsWith(p, "get"))
				{
					if(ghost.utils.Strings.startsWith(p, "getRoute"))
					{
						var route:Route = controller[p]();
						if(!(route instanceof Route))
						{
							throw new Error("a method getRouteXXX must return a route instance");
						}
						var func:Function = route.getCallback();
						var method:string = route.getMethod();
						var route_str:string = route.getRoute();
						this._http[method](route_str, func.bind(controller));
						console.log(method+":"+route_str);
						/*
						name = p.substring(8, 9).toLowerCase()+p.substring(4);
						this._http["get"]("/"+name, controller.constructor.prototype[p].bind(controller));
						console.log("get:"+name);*/
					}else
					{
						name = p.substring(3, 4).toLowerCase()+p.substring(4);
						this._http["get"]("/"+name, controller.constructor.prototype[p].bind(controller));
						console.log("get:"+name);
					}
				}
			}

			console.log(controller.constructor);
			//this._http[route.action](route.url, route.callback);
		}

	}
	export interface IRoute
	{
		url?:string;
		callback?:Function;
		action?:string;
	}
}