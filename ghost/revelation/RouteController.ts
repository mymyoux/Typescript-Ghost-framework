module ghost.revelation
{
	export class RouteController extends ghost.core.CoreObject
	{
		public static IGNORED:string[] = ["getClassName","getFullClassName","getUniqueInstance"];
		protected app:Application;
		private _name:string;
		public setApplication(application:Application):void
		{
			this.app = application;
		}
		public ready():void
		{
			
		}
		public name():string
		{
			if(!this._name)
			{
				this._name = this.getClassName().replace(/route/gi,"");
				this._name = this._name.substring(0,1).toLocaleLowerCase()+this._name.substring(1);
			}
			return this._name
		}
		public prefix():string
		{

			return this.name();
		}
	}
	export class Route
	{
		public static METHOD_GET:string = "get";
		public static METHOD_ALL:string = "all";
		private callback:(request:any, response:any)=>void;
		private method:string;
		private route:string;
		public constructor(method:string, route:string, callback:(request:any, response:any)=>void)
		{
			this.callback = callback;
			this.route = route;
			this.method = method;
		}
		public getCallback():(request:any, response:any)=>void
		{
			return this.callback;
		}
		public getMethod():string
		{
			return this.method;
		}
		public getRoute():string
		{
			return this.route;
		}
	}
}