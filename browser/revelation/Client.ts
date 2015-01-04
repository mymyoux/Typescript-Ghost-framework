///<lib="socketio-client"/>
///<module="ghost/revelation"/>
///<module="ghost/events"/>
module ghost.browser.revelation
{
	export class Client extends ghost.events.EventDispatcher
	{
		private static _clients:any = {};
		public static addClient(name:string, host:string, port:number):Client
		{
			if(!Client._clients[name])
			{
				Client._clients[name] = new Client(name, host, port);	
			}
			return Client._clients[name];
		}	
		public static getDefaultClient():Client
		{
			for(var p in Client._clients)
			{
				return Client._clients[p];
			}
			return null;
		}
		public static getClient(name:string):Client
		{
			return Client._clients[name];
		}
		/**
		 * Specifies if the socket is connected
		 * @type {boolean}
		 */
		private _connected:boolean;
		/**
		 * Specifies if the socket is connecting
		 * @type {boolean} 
		 */
		private _connecting:boolean;
		/**
		 * @type {any} Socket IO socket
		 */
		public socket:any;
		private _apps:any;
		public addApplication(application:Application):void
		{
			this._apps[application.getName()] = application;
		}
		public getApplication(name:string):Application
		public getApplication(name:any):Application
		{
			if(typeof name == "string")
				return this._apps[name];
			else
			{
				for(var p in this._apps)
				{
					if(this._apps[p] instanceof name)
					{
						return this._apps[p];
					}
				}
			}
			return null;
		}
		constructor(public name:string, public host:string, public port:number)
		{
			super();
			this._apps = {};
  			this._connected = false;
  			this._connecting = false;
		}
		public isConnected():boolean
		{
			return this._connected;
		}
		public connect():void
		{
			if(!this._connected && !this._connecting)
			{
				console.log("connecting");
				this._connecting = true;
				/*if(this.socket)
				{
					this.socket.removeAllListeners();
					this.socket = null;
				}*/

				if(!this.socket)
				{
					console.log("connecting to "+'http://'+this.host+':'+this.port);	
					this.socket = io.connect('http://'+this.host+':'+this.port);
					this._bindEvents();
				}else
				{
					console.log("reconnecting");
					console.log(this.socket);
					this.socket.socket.reconnect();

				}
			}
		}
		private _bindEvents():void
		{
			this.socket.on("connect",()=>
			{
				this._onConnect();
			});

			this.socket.on("connect_failed",(error:any)=>
			{
				this._onConnectError(error);
			});
			//TODO:verify for this one
			this.socket.on("error",(error:any)=>
			{
				this._onConnectError(error);
			});
			this.socket.on("disconnect",()=>
			{
				this._onDisconnect();
			});

		}
		private _onConnect():void
		{
			console.log("connected");
			this._connected = true;
			this._connecting = false;
			this.trigger("connect");
		}
		private _onConnectError(error:any):void
		{
			console.error("error",error);
			this._connected = false;
			setTimeout(()=>
			{
				this._connecting = false;
				this.connect();
			},500);
		}
		private _onDisconnect():void
		{
			console.log("Disconnected");
			this.trigger("disconnect");
			this._connected = false;
		}
		public write(data:ghost.revelation.Message):boolean
		{
			if(!this._connected)
			{
				this.connect();
			}
			if(this._connected)
			{
				console.log("write", data);
				var callback:ghost.revelation.MessageCallback;
				if(data["callback"])
				{
					callback = data["callback"];
				}else
				if(data instanceof ghost.revelation.ServerMessage)
				{
					if(data.data instanceof ghost.revelation.ApplicationMessage)
					{
						callback = data.data.callback;
					}
				}
				console.warn(data.application, data);
				this.socket.emit(data.application, data, callback);
				return true;
			}
			return false;
		}

	}
}