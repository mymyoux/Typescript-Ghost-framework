///<module="navigation"/>
namespace ghost.mvc {
    /**
     * Router
     */
	import Navigation = ghost.browser.navigation.Navigation;
	import Strings = ghost.utils.Strings;
	import Objects = ghost.utils.Objects;
	export class Router extends ghost.events.EventDispatcher {
		public static TYPE_STATIC:string = "static";
		public static TYPE_REGEXP:string = "regexp";
		public static TYPE_SEGMENT:string = "segment";
		private static REGEXP_SEGMENT: RegExp = /:([^:\/\?]+)/g;
		protected static _instance: Router;
		public static instance(): Router {
			return this._instance;
		} 
		public static hasInstance():boolean
		{
			return this._instance != null;
		}
		protected staticRoutes: any;
		protected regExpRoutes: any;
		protected irouteRoutes: any;
		protected priorities: number[];
		protected rejected: any[];
		protected history: any;
		protected current: any;
		protected listenening: boolean;
		public constructor() {
			super();
			Router._instance = this;
			this.staticRoutes = {};
			this.regExpRoutes = {};
			this.irouteRoutes = {};
			this.priorities = [];
			this.rejected = [];
			this.history = {};
			this.current = {};
			this.listenening = true;
			this.bindEvents();
		}
		public static segment(url, config:IRoute = null):IRoute{
			var route: IRoute = {
				route: url,
				type: Router.TYPE_SEGMENT
			};
			if (config)
			{ 
				for(var p in config)
				{
					route[p] = config[p];
				}
			}
			return route;
		}
		public static static(url, config:IRoute = null):IRoute{
			var route: IRoute = {
				route: url,
				type: Router.TYPE_STATIC
			};
			if (config)
			{ 
				for(var p in config)
				{
					route[p] = config[p];
				}
			}
			return route;
		}
		protected log(...data:any[]):void
		{
			console.log("route:", ...data);
		}
		public gotoLastReject(scope:string = "main"):void
		{
			this.log("goto last reject");
			if(this.rejected.length)
			{
				var last: any = this.rejected.pop();
				this.goto(last.url, last.params);
			}
		}
		public back(index:number = 1, scope:string = "main"):void
		{
			this.log("back", index);
			var route: any;
			var history: any[]  = this.history[scope];
			if(!history)
			{
				return;
			}
			index++;
			while(index-->0 && history.length)
			{
				route = history.pop();
			}
			if(route && route!==this.current) 
			{
				this.goto(route.url, route.params); 
			}
		}
		protected _reject(route: any): void
		{
			this.rejected.push(route);
		}
		protected _goto(route: any, save: boolean, scopename: string = "main"):void
		{
			//mute hash listening during manual modification
			//browser don't throw event syncly....... but in case of
			this.listenening = false;
			this.log("stop listening");
			if (save) {
				this.current[scopename] = route;
				if (!this.history[scopename])
				{
					this.history[scopename] = [];
				}
				this.history[scopename].push(route);
			}
			if(!route)
			{
				debugger;
			}
			var url: string = "#!" + route.url;
			for(var p in this.history)
			{
				if(p!=scopename && p.substring(0, 1)!="_")
				{
					url += "+" + this.history[p].url;
				}
			}
			window.location.href = url;
			this.log("set url:",  url);

			this.listenening = true;
			this.log("start listening");
		}
		protected _detectHistory(url:string, params:any):boolean|any
		{
			var history: any[];
			for(var scope in this.history)
			{
				history = this.history[scope];
				var last: any = history[history.length - 2];
				if(!last)
				{
					continue;
				}
				if(last.url == url)
				{
					if(!params && !last.params)
					{
						return {
							index: 1, scope: scope 
						};
					}
					if (Objects.deepEquals(params, last.params))
					{
						return {
							index: 1, scope: scope
						};
					}
				}
			}
			return false;
		}
		public goto(url: string, params: any = null, save:boolean = true): void {
			var historyResult: boolean | number;
			if ((historyResult = this._detectHistory(url, params)) !== false)
			{ 
				this.log("detect history : ", historyResult);
				return this.back((<any>historyResult).index, (<any>historyResult).scope);
			}
 

			if(save) 
			{
				var current: any = { url: url, params: params };
			}
			this.log("goto:" + url);
			var result:any;
			for (var priority of this.priorities) {
				if (this.staticRoutes[priority]) {
					if (this.staticRoutes[priority][url]) {
						if (!this.staticRoutes[priority][url].callback) {
							this.log("route without callback", url);
							return;
						}
						result = this.staticRoutes[priority][url].callback(this.staticRoutes[priority][url], url);
						if(result !== false)
						{
							if(typeof result == "string")
							{
								this.log("route: " + url + " needs login");
								if (save)
									this._reject(current); 
								//new url
								return this.goto(result, null, false);
							}
							//maybe handle more type - assume it's always Scope
							var scope: string;
							if(result !== true)
							{
								scope = result.name();
							}
							//end = route found 
							this.log(url + " found");
							this._goto(current, save, scope);
							return;
						}
						//window.location.href = "#!" + result;  
						this.log("route: " + url + " ignored a callback");
					}
				}
				if (this.irouteRoutes[priority]) 
				{
					for (var route of this.irouteRoutes[priority])
					{
						//quick test
						if (Strings.startsWith(url, route.starts_with))
						{
							if(route.route.test(url))
							{
								//good route
								route = this.parseParam(route, url);
								result = route.callback(route, url);
								if (result !== false) {
									if (typeof result == "string") {
										console.warn("route_seg: " + url + " needs login");
										//new url
										if (save)
											this._reject(current); 
										return this.goto(result, null, false);
									}
									var scope: string;
									if (result !== true) {
										scope = result.name();
									}
									//end = route found 
									this.log("route_seg: " + url + " found");
									this._goto(current, save, scope);
									return;
								}
								//window.location.href = "#!" + result;
								this.log("route_seg: " + url + " ignored a callback");
							}
						}
					}
				}

			}
			console.warn("route:" + url + " not found");
		}
		public register(route: string | RegExp | IRoute, callback: Function, priority: number = null): void {
			
			this.log("register", route);
			if(!route)
			{
				console.warn("you tried to register an empty route");
				debugger;
				return;
			}
			if(priority == null)
			{
				priority = 1;
				if (!(typeof route == "string") && !(route instanceof RegExp) && route.priority)
				{
					priority = route.priority;
				}
			}
			if (this.priorities.indexOf(priority) == -1)
			{
				this.priorities.push(priority);
				this.priorities.sort().reverse();
			}
			var iroute: IRoute;
			//convert to iroute
			if(typeof route == "string")
			{
				iroute = 
				{
					type:Router.TYPE_STATIC,
					route:route,
					callback:callback
				};
			}else if(route instanceof RegExp)
			{
				iroute =
				{
					type: Router.TYPE_REGEXP,
					route: route,
					callback: callback
				}; 
			}else{
				iroute = <IRoute>route;
				iroute.callback = callback;
				if(!iroute.type)
				{
					console.warn("no type for route", iroute);
					iroute.type = iroute.route instanceof RegExp?Router.TYPE_REGEXP:Router.TYPE_SEGMENT;
				}

			}
			//handle iroute
			switch (iroute.type)
			{
				case Router.TYPE_STATIC:
					if (!this.staticRoutes[priority]) {
						this.staticRoutes[priority] = {};
					}
					this.staticRoutes[priority][iroute.route] = iroute;
				break;
				case Router.TYPE_REGEXP:
					if (!this.regExpRoutes[priority]) {
						this.regExpRoutes[priority] = [];
					}
					this.staticRoutes[priority].push(iroute);
				break;
				case Router.TYPE_SEGMENT:
					if (!this.irouteRoutes[priority]) {
						this.irouteRoutes[priority] = [];
					}
					iroute = this.parseRoute(iroute);
					this.irouteRoutes[priority].push(iroute);
				break;
			}
		}
		protected parseRoute(route: IRoute): IRoute
		{
			var index: number = route.route.indexOf(":");
			if(index == -1)
			{
				index = route.route.length;
			}
			var tmp: number = route.route.indexOf("[");
			index = tmp != -1 && tmp < index ? tmp : index; 
			route.starts_with = route.route.substring(0, index);
			//convert route to regexp
			route.paramsNames = [];
			var temp: any;
			while ((temp=Router.REGEXP_SEGMENT.exec(route.route)) !== null)
			{
				route.paramsNames.push(temp[1]);
			}


			route.route  = new RegExp(route.route.replace(/((\/?):[^:\/\?]+)(\??)/g, "$2$3([^\/]+)$3").replace(/\//g, "\\/"));


			return route;
		}
		protected parseParam(route:IRoute, url:string):IRoute
		{
			var result: any = route.route.exec(url);
			route.params = {};
			for (var i = 0; i < route.paramsNames.length; i++)
			{
				route.params[route.paramsNames[i]] = result[i + 1];
			}
			return route;
		}
		protected bindEvents(): void {
			$(document).on("click", "a[href^='#']", this.onhref.bind(this));
			ghost.events.Eventer.on(ghost.events.Eventer.HASH_CHANGE, this.onHashChange, this);
			ghost.events.Eventer.on(ghost.events.Eventer.KEYBOARD_BACK_BUTTON, this.onBackButton, this);
		}
		protected onhref(jqueryEvent: any, event: any): void {
			var href: string = jqueryEvent.target.getAttribute("href").substring(1);
			if(href)
				this.goto(href);
		}
		protected onBackButton():void
		{
			debugger;
			this.back(1);
		}

		protected onHashChange(event:any): void {
			if(!this.listenening)
			{
				this.log("ignoring hash change");
				return;
			}
			var newHash:string = event.newURL.substring(event.newURL.indexOf("#")+1);
			if(newHash.substring(0, 1)=="!")
			{
				newHash = newHash.substring(1);
			}
			var oldHash: string = event.oldURL.substring(event.oldURL.indexOf("#")+1);
			if (oldHash.substring(0, 1) == "!") {
				oldHash = oldHash.substring(1);
			}
			var current: any;
			for(var p in this.current)
			{
				current = this.current[p];
				this.log("of: ", p);
				if(newHash == current.url)
				{
					this.log("ignore hash change", oldHash, newHash, current.url);
					return;
				}
			} 
			this.log("hash change", oldHash, newHash, this.current); 
			this.goto(newHash);
		}
	}
	export interface IRoute
	{
		starts_with?: string;
		type?: string;
		route?: any;//string or regexp
		callback?:Function;
		scope?: string; 
		defaults?: any;
		params?: any;
		paramsNames?: any;
		priority?: number;
	}
}
