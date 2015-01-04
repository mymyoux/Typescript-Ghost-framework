module ghost.revelation
{
	export class Message
	{
		public application:string;
		constructor(public data:any)
		{
			console.log("DATA MESSAGE");
			console.log(data);
		}

	}
	export class ApplicationMessage extends Message
	{
		public static ASK_AUTHENTIFICATION:string = "__login";
		public static ANSWER_AUTHENTIFICATION:string = "__login";
		public static OK_ACCESS_GRANTED:string = "__ok_access_granted";
		public static NOK_ACCESS_REFUSED:string = "__ok_access_refused";
		public static ACTION_MODEL:string = "__model";


		public action:string;
		public controller:string;
		public callback:MessageCallback;
		public hasCallback:boolean;
		constructor(application:string, data:any)
		{
			super(null);
			this.data = ApplicationMessage.serialize(data);
			console.warn("DATA",this.data);
			this.application = application;
		}
		public static serialize(data:any):any
		{
			if(!data)
			{
				return data;
			}
			var result:any = {};
				
			if(data.writeExternal)
			{
				result = data.writeExternal();
			}else
			{
				for(var p in data)
				{
					if(p.substring(0, 1) != "_")
					{
						result[p] = data[p];
					}
				}
			}
			if(data.getFullClassName)
			{
				result.__className = data.getFullClassName();
			}else
			{
				result.__className = "Object";
			}
			return result;
		}
		public static deserialize(data:any):any
		{
			if(data)
			{
				console.log("ORIGINAL DATA", data);
				if(data.__className)
				{
					var result:any;
					var clss:string[] = data.__className.split(".");
					delete data.__className;
					var len:number = clss.length;
					if(len>0)
					{
						var cls:any = eval(clss[0]);
						for(var i:number = 1; i<len; i++)
						{
							console.log(cls);
							console.log(clss[i]);
							cls = cls[clss[i]];
						}
						result = new cls();
						if(result.readExternal)
						{
							console.log("READ EXTERNAL");
							result.readExternal(data);
						}else
						{
							console.log("RAW DATA");
							result._data = data;
						}
					}else
					{
						//no clss
						//throw new Error(data.__className+" not found");
						console.warn(data.__className+" not found");
						return data;
					}

					return result;
				}else
				{
					return data;
				}
			}
			return data;
		}
		public setCallback(callback:MessageCallback):void
		{
			if(callback)
			{
				this.hasCallback = true;
				this.callback = callback;
			}else
			{
				this.callback = null;
				this.hasCallback = false;
			}
		}

	}
	export class ServerMessage extends Message
	{
		public static APPLICATION_SERVER_NAME:string = "server"; 
		public static JOIN_APPLICATION:string = "join_application"; 
		public static LEAVE_APPLICATION:string = "leave_application"; 
		constructor(public action:string, data:any)
		{
			super(data);
			this.application = ServerMessage.APPLICATION_SERVER_NAME;
		}
	}
	export interface MessageCallback {
	    (message: ghost.revelation.ApplicationMessage): void;   
	}

	export interface ISerialize
	{
		readExternal(input:any):void;
		writeExternal():any;
	}
}