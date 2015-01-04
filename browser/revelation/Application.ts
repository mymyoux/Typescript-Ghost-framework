///<file="Client.ts"/>
///<module="ghost/revelation"/>
///<module="ghost/events"/>
module ghost.browser.revelation
{
	export class Application
	{
		/**
		 * @protected
		 * @type {LoginHelper}
		 */
		public _loginHelper:LoginHelper;
		public static getApplication(name:string, client?:string):Application
		public static getApplication(instance:Function, client:Client):Application
		public static getApplication(name:any, client:any = null):Application
		{
			if(typeof client == "string")
			{
				client = Client.getClient(client);
			}
			if(!client)
			{	
				client = Client.getDefaultClient();
				if(!client)
				{
					throw new Error("no client declared");
				}
			}
			if(typeof name == "string")
			{
				var app:Application = client.getApplication(name);
				if(app)
				{
					return app;
				}

				return new Application(name, client);
			}else
			{
				var app:Application = client.getApplication(name);
				if(app)
				{
					return app;
				}
				return new name(client);
			}
		}

		private _buffer:ghost.revelation.Message[];
		public _senders:any;
		/**
		 * 
		 * @param {string} @protected public name [description]
		 */
		constructor(public name:string, public client:Client)
		{
			if(!name || !client)
			{
				throw new Error("Name or client can't be null");
			}
			client.addApplication(this);
			this._buffer = [];
			this._senders = {};
			this._bindEvents();
		}
		public getName():string
		{
			return this.name;
		}
		public addSender(sender:Sender):void
		{
			this._senders[sender.getName()] = sender;
		}
		public removeSender(sender:Sender):void
		{
			delete this._senders[sender.getName()];
		}
		public getLoginHelper():LoginHelper
		{
			if(this._loginHelper)
			{
				return this._loginHelper;
			}
			return new LoginHelper();
		}
		private _bindEvents():void
		{
			console.log("BIND EVENTS", this);
			this.client.on('connect', this._onClientConnect, this);
			//this.client.onMessage()
		}
		private _addToBuffer(data:ghost.revelation.Message):void
		{
			this._buffer.push(data);
		}
		private _flushBuffer():void
		{
			while(this.client.isConnected() && this._buffer.length>0)
			{

				this._write(this._buffer.shift())
			}
		}
		private _onClientConnect():void
		{
			console.log("joining "+this.name);
			this.client.socket.on(this.name, (data)=>
			{	
				this._onMessage(data);

			});
			var applicationMessage:ghost.revelation.ApplicationMessage = new ghost.revelation.ApplicationMessage(this.name, null);
			applicationMessage.setCallback((message:ghost.revelation.ApplicationMessage)=>
			{
				this._onMessage(message);
			});
			var serverMessage:ghost.revelation.ServerMessage = new ghost.revelation.ServerMessage(ghost.revelation.ServerMessage.JOIN_APPLICATION, applicationMessage);
			this._write(serverMessage);
			
		}
		public _write(data:ghost.revelation.Message):void
		{
			if(this.client.isConnected())
			{
				if(!this.client.write(<ghost.revelation.Message>data))
				{
					console.error("__write","SENT_FAILED",data);
					this._buffer.unshift(data);
				}else
				{

					console.error("__write","SENT",data);
				}
			}
			else
			{
				console.error("__write","BUFFER",data);
				this.client.connect();
				this._addToBuffer(<ghost.revelation.Message>data);
			}
		}
		public writeController(controller:string, action:string, data:any, callback:Function = null):void
		{
			
			if(!(data instanceof ghost.revelation.Message))
			{
				data = new ghost.revelation.ApplicationMessage(this.name, data); 
				data.action = action;
				data.controller = controller;
				if(callback)
				{
					data.setCallback(callback);
				}
			}
			console.warn("WRITE CONTROLLER",controller, action, data,this);
			this._write(<ghost.revelation.Message>data);
		}
		public write(action:string, data:any, callback:Function = null):void
		{
			
			if(!(data instanceof ghost.revelation.Message))
			{
				data = new ghost.revelation.ApplicationMessage(this.name, data); 
				data.action = action;
				if(callback)
				{
					data.setCallback(callback);
				}
			}
			this._write(<ghost.revelation.Message>data);
		}
		public _onMessage(message:ghost.revelation.ApplicationMessage):void
		{

			if(message.action && message.action.substring(0,2)=="__")
			{
				message.action = message.action.substring(2);
			}
			if(message.controller)
			{
				if(this._senders[message.controller])
				{
					this._senders._onMessage(message);
					return;
				}
			}
			console.log("on message", message);
			if(this[message.action+"Action"])
			{
				this[message.action+"Action"].call(this, message.data);
			}else
			{
				this.onMessage(message.action, message.data);
			}
		}
		public onMessage(action:string, data:any):void
		{
			console.log("onMessage", action, data);
		}
		public loginAction(dataLogin:any):void
		{
			console.log("LOGIN ASKED");
			if(!this._loginHelper)
			{
				this._loginHelper = this.getLoginHelper();
			}
			this._loginHelper.login((data:any)=>
			{
				console.log("login helper", data);
				this.write(ghost.revelation.ApplicationMessage.ANSWER_AUTHENTIFICATION, data, (message:ghost.revelation.ApplicationMessage)=>
				{
					switch(message.action)
					{
						case ghost.revelation.ApplicationMessage.OK_ACCESS_GRANTED:
							this.onLoggued();
						break;
						case ghost.revelation.ApplicationMessage.NOK_ACCESS_REFUSED:
							//this.loginAction(message.data);
						break;
						default:
							console.error("Login's return not understood", message);
					}
				
				});

			});

		}
		public onLoggued():void
		{
			console.log("LOGGUED");
			this._flushBuffer();
		}
	}
	
}
