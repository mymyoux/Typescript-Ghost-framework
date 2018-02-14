    /**
     * Router
     */
    import {IRoute} from "./IRoute";
	import {Strings} from "ghost/utils/Strings";
	import {Objects} from "ghost/utils/Objects";
	import {EventDispatcher} from "ghost/events/EventDispatcher";
	import {Eventer} from "ghost/events/Eventer";
	export class Router extends EventDispatcher {
		public static TYPE_STATIC:string = "static";
		public static TYPE_REGEXP:string = "regexp";
		public static TYPE_SEGMENT:string = "segment";
		private static REGEXP_SEGMENT: RegExp = /:([^:\/\?\+]+)/g;
		protected static _instance: Router;
		public static instance(): any {
            if(!this._instance)
            {
				this._instance = new Router();
            }
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
		protected _lastURL:string;
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
		public static regexp(regexp, config:IRoute = null):IRoute{
			var route: IRoute = {
				route: regexp,
				type: Router.TYPE_REGEXP
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
			//console.log("route:", ...data);
		}
		public gotoLastReject(scope:string = "main"):boolean
		{
			if(this.rejected.length)
			{
				var last: any = this.rejected.pop();
			this.log("goto last reject", last);
				return this.goto(last.url, last.params);
			}
			return false;
		}
		public back(index:number = 1, scope:string = "main"):boolean
		{
			debugger;
			this.log("back", index);
			var route: any;
			var history: any[]  = this.history[scope];
			if(!history)
			{
				return false;
			}
			if(index == -1)
			{
				history.length = 0;
			}
			//index++;
			while(index-->0 && history.length)
			{
				history.pop();
				route = history[history.length-1];
				if(index == 0)
					history.pop();
			}
			if(route && route!==this.current) 
			{
				return this.goto(route.url, route.params); 
			}else
			{
			//	debugger;
			}
			this.trigger('remove_all', scope);
			return false;
		}
		public backAll(scope:string = "main"):void
		{
			this.back(-1, scope);
			setTimeout(()=>
			{
				this.setUrl(this._buildURL() );
			}, 0);
		}

		public getHistorySize(scope:string = "main") : number
		{
			return Object.keys(this.history[scope]).length;
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
			console.log("__goto "+scopename+" ",route);
			// var url: string = "#!" + route.url;
			// for(var p in this.history)
			// {
			// 	if(p!=scopename && p.substring(0, 1)!="_" && this.history[p].length)
			// 	{
			// 		url += "+"+ this.history[p][this.history[p].length-1].url;
			// 	}
			// }
			var url:string = this._lastURL = this._buildURL();
		//	window.location.href = url;
				setTimeout(() =>
				{
					this.setUrl( url );
				},0);
			this.log("set url:",  url);

			this.listenening = true;
			this.log("start listening");
		}

		protected setUrl( url : string ) : void
		{
			window.location.href = url;
		}

		protected _buildURL():string
		{
			window["u"] = this;
			var url:string = "";
			for(var p in this.history)
			{
				if(p.substring(0, 1)!="_" && this.history[p].length)
				{
					url += (url?"+":"")+ this.history[p][this.history[p].length-1].url;
				}
			}
			return window.location.pathname + window.location.search + "#!" + url;
		}
		public silentGoto(url:string, scope:string):void
		{
			if(!this.history[scope]){
				debugger;
				return;
			}
			this.history[scope].push({
				params:null,
				url:url
			});
			this._lastURL = this._buildURL();
			this.setUrl(this._lastURL);
		}

		public getHash() : string
		{
			return this._lastURL.replace(window.location.pathname + window.location.search + "#!", '');
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
		/**
		 * Set default route for a scope
		 * @param url 
		 * @param params 
		 * @param save 
		 */
		public gotoDefault(url: string, scope:string): void
		{
			console.log("GOTO DEFAULT:"+url+" :: "+scope);
			if(!this.current[scope])
			{
				this.goto(url);
			}
		}
		public goto(url: string, params: any = null, save:boolean = true): boolean {
			console.log("[bridge-non]goto:"+url, save);
			if(!url)
			{
				return false;
			}
			if(url.substring(0, 1)=="#")
			{
				url = url.substring(1);
			}
			if (url.substring(0, 1) == "!") {
				url = url.substring(1);
			}
			if(url=="back" || Strings.startsWith(url, "back/") || Strings.startsWith(url, "back-"))
			{
				var parts:string[] = url.split('/');
				var scope:string = "main";
				if(~parts[0].indexOf('-'))
				{
					scope = parts[0].split('-').slice(1).join('-');	
				}
				var fallback:string  = parts.slice(1).join('/');
				if(!this.back(1, scope))
				{
					if(fallback)
						this.goto(fallback);
				}
				return false;
			}
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
							return false;
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
							var scope: string = this.staticRoutes[priority][url].scope;
							if(result !== true && typeof result.name === 'function' && result.name())
							{
								scope = result.name();
							}
							//end = route found 
							this.log(url + " found");
							this._goto(current, save, scope);
							return true;
						}
						//window.location.href = "#!" + result;  
						this.log("route: " + url + " ignored a callback");
					}
				}
				if (this.irouteRoutes[priority]) 
				{
					for (var route of this.irouteRoutes[priority])
					{
						var starts_with : string = route.starts_with;
						
						//quick test
						if (Strings.startsWith(url, starts_with))
						{
							var test_route : boolean = route.route.test(url);
 
							if (test_route && url != starts_with && route.type === Router.TYPE_SEGMENT)
							{
								starts_with += '/';
								test_route =  Strings.startsWith(url, starts_with);
							}
						
							if (test_route)
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
									var scope: string = route.scope;
									if (result !== true && typeof result.name === 'function' && result.name()) {
										scope = result.name();
									}
									//end = route found 
									this.log("route_seg: " + url + " found");
									this._goto(current, save, scope);
									return true;
								}
								//window.location.href = "#!" + result;
								this.log("route_seg: " + url + " ignored a callback");
							}
						}
					}
				}
			}
			debugger;
			console.warn("route:" + url + " not found");
			return false;
		}
		public register(route: string | RegExp | IRoute, callback: Function): void {
			
			this.log("register", route);
			if(!route)
			{
				console.warn("you tried to register an empty route");
				debugger;
				return;
			}
			var	priority:number = 1;
            if (!(typeof route == "string") && !(route instanceof RegExp) && route.priority)
            {
                priority = route.priority;
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
			if(Strings.endsWith(route.starts_with, "/"))
			{ 
				route.starts_with = route.starts_with.substring(0, route.starts_with.length-1);
			}
			//convert route to regexp
			route.paramsNames = [];
			var temp: any;
			while ((temp=Router.REGEXP_SEGMENT.exec(route.route)) !== null)
			{
				route.paramsNames.push(temp[1]);
			}
			console.log(route.route);
			console.log("rouge regexp:"+route.route.replace(/((\/?):[^:\/\?\+]+)(\??)/g, "$2$3([^\/\+]+)$3").replace(/\//g, "\\/"));
			route.base_route 	= route.route;
			route.route  		= new RegExp(route.route.replace(/((\/?):[^:\/\?\+]+)(\??)/g, "$2$3([^\/\+]+)$3").replace(/\//g, "\\/"));


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
		public listen(): void {
            if(this.listenening)
            {
                //already listening
                return;
            }
            this.listenening = true;
			$(document).on("click", "[href^='#']", this.onhref.bind(this));
			Eventer.on(Eventer.HASH_CHANGE, this.onHashChange, this);
			Eventer.on(Eventer.KEYBOARD_BACK_BUTTON, this.onBackButton, this);
		}
		public parseInitialUrl():void
		{
			var hash:string = window.location.hash;
			if(hash.length>1)
				this.onHashChange({newURL:window.location.href, oldURL:window.location.href.substring(0, window.location.href.indexOf("#"))});
		} 

		public sameURL(jqueryEvent : any)
		{
			if (jqueryEvent && jqueryEvent.target && jqueryEvent.target.closest("[href^='#']") && jqueryEvent.currentTarget)
				return jqueryEvent.target.closest("[href^='#']").getAttribute("href") == jqueryEvent.currentTarget.getAttribute("href");
			return true;
		}
		protected onhref(jqueryEvent: any, event: any): void {

			console.log("on href:router ");
			var href: string 	= jqueryEvent.currentTarget.getAttribute("href").substring(1);
			var target : string = jqueryEvent.currentTarget.getAttribute("target");

			if (!this.sameURL(jqueryEvent))
			{
				return;
			}
			
			if (!target && (jqueryEvent.metaKey || jqueryEvent.ctrlKey))
				target = '_blank';
			
			if (target)
			{
				console.log("[router:href]" + jqueryEvent.currentTarget.getAttribute("href") + ' ' + target);
				jqueryEvent.preventDefault();
				window.open(jqueryEvent.currentTarget.getAttribute("href"), target);
				return;
			}
			
			console.log("[router:href]" + href);

			if(href)
			{
				jqueryEvent.preventDefault();
				var hrefs:string[] = href.split("+");
				for(href of hrefs)
				{
					if(href=="back" || Strings.startsWith(href, "back/") || Strings.startsWith(href, "back-"))
					{
						var parts:string[] = href.split('/');
						var scope:string;
						if(~parts[0].indexOf('-'))
						{
							scope = parts[0].split('-').slice(1).join('-');	
						}else{
							if(jqueryEvent && jqueryEvent.target)
							{
								scope = $(jqueryEvent.target).closest("[data-scope]").attr("data-scope");
							}
						}
						var fallback:string  = parts.slice(1).join('/');
						if(!this.back(1, scope))
						{
							if(fallback)
								this.goto(fallback);
						}
						continue;
					}
					this.goto(href);
				}
			}
		}
		protected onBackButton():void
		{
			this.back(1);
		}
		protected onHashChange(event:any): void {
			if(!this.listenening)
			{
				this.log("ignoring hash change");
				return;
			}
			if(this._lastURL ==window.location.pathname + window.location.search+window.location.hash)
			{
				this.log("ignoring hash change - same url");
				return;
			}
			console.log("[router:href-change]"+event.newURL);
			var newHash:string = event.newURL.substring(event.newURL.indexOf("#")+1);
			if(newHash.substring(0, 1)=="!")
			{
				newHash = newHash.substring(1);
			}
			var oldHash: string = event.oldURL.substring(event.oldURL.indexOf("#")+1);
			if (oldHash.substring(0, 1) == "!") {
				oldHash = oldHash.substring(1);
			}

			var hashes:string[] = newHash.split('+');
			var current: any;
			var hash:string;
			var i:number = 0;
			while(i<hashes.length)
			{
				hash = hashes[i];
				for(var p in this.current)
				{
					current = this.current[p];
					this.log("of: ", p);
					if(hash == current.url)
					{
						this.log("ignore hash change", oldHash, hash, current.url);
						hashes.splice(i, 1);
						continue;
					}
				} 
				i++;
			}
			for(hash of hashes)
			{
				this.log("hash change", oldHash, hash, this.current); 
				this.goto(hash);
				//setTimeout(this.goto.bind(this, hash),0);
			}
		}
	}

