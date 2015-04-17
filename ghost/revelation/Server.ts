
///<lib="express"/>
var colors = require('colors');

colors.setTheme({
  silly: 'rainbow',
  input: 'grey',
  verbose: 'cyan',
  prompt: 'grey',
  info: 'green',
  data: 'grey',
  help: 'cyan',
  warn: 'yellow',
  debug: 'blue',
  error: 'red'
});
module ghost.revelation
{
	export class Server
	{
		private express:any;
		private http:any;
		private options:any;
		private _app:any;
		private _io:any;
		private applications:Application[];
		//public use:Function;
		constructor()
		{
			console.log("Server instance initializing");
			this.options = {
				port:5000
			};
			this.express = require("express");
			this._app = this.express();
			this.applications = [];
		}
		public use(path?:string, ...functions):void
		{
			return this._app.use.apply(this._app, Array.prototype.slice.call(arguments));
		}
		public setOptions(options:any):void
		{
			for(var p in options)
			{
				this.options[p] = options[p];
			}
		}
		public get app():any
		{
			return this._app;
		}
		public get io():any
		{
			return this._io;
		}
		public initialize():void
		{
			
			this.http = require('http').Server(this._app);
			this.http.on("error", this._onServerError.bind(this));
			this._io = require("socket.io")(this.http);
		}
		private _onServerError(error:Error):void
		{
			console.error(colors.error("An error happen"));
			console.error(colors.error(error["stack"]));
		}
		public listen():void
		{
	  		this.applications.forEach(function(application:Application)
			{
				application.start();
			}, this);
			this.http.listen(this.options.port, ()=>{
		  		console.log('listening on *:'+this.options.port);
			});
		

			
		}
		public addApplication(prefix:string, application:Application):void
		{
			application.setServer(this);
			this.applications.push(application);
		}
	}
	export interface IServerOptions
	{
		port?:number;
	}
}