module ghost.revelation
{
	export class RouteController
	{
		protected app:Application;
		public setApplication(application:Application):void
		{
			this.app = application;
		}
		public ready():void
		{
			
		}
	}
	export class Route
	{
		public static METHOD_GET:string = "get";
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