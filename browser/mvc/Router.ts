///<module="navigation"/>
namespace ghost.mvc {
    /**
     * Router
     */
	import Navigation = ghost.browser.navigation.Navigation;
	import Strings = ghost.utils.Strings;
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
		public constructor() {
			super();
			Router._instance = this;
			this.staticRoutes = {};
			this.regExpRoutes = {};
			this.irouteRoutes = {};
			this.priorities = [];
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
		public goto(url: string, params: any = null): void {
			var result:any;
			for (var priority of this.priorities) {
				if (this.staticRoutes[priority]) {
					if (this.staticRoutes[priority][url]) {
						if (!this.staticRoutes[priority][url].callback) {
							console.warn("route without callback", url);
							return;
						}
						result = this.staticRoutes[priority][url].callback(this.staticRoutes[priority][url], url);
						if(result !== false)
						{
							if(typeof result == "string")
							{
								console.warn("route: " + url + " needs login");
								//new url
								return this.goto(result);
							}
							//end = route found 
							console.log("route: "+url + " found");
							window.location.href = "#!"+url;
							return;
						}
						window.location.href = "#!" + result;  
						console.warn("route: "+url+" ignored a callback");
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
										return this.goto(result);
									}
									//end = route found 
									console.log("route_seg: " + url + " found");
									window.location.href = "#!" + url;
									return;
								}
								window.location.href = "#!" + result;
								console.warn("route_seg: " + url + " ignored a callback");
							}
						}
					}
				}

			}
			console.warn("route:" + url + " not found");
		}
		public register(route: string | RegExp | IRoute, callback: Function, priority: number = null): void {
			
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
			//			ghost.events.Eventer.trigger(Navigation.EVENT_PAGE_CHANGED, this.onRouteChange, this);
		}
		protected onhref(jqueryEvent: any, event: any): void {
			var href: string = jqueryEvent.target.getAttribute("href").substring(1);
			if(href)
			this.goto(href);

		}

		protected onRouteChange(): void {
			debugger;
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
