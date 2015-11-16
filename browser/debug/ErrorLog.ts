///<module="ghost/events"/>
///<module="ghost/core"/>
namespace ghost.debug {
    /**
     * Error Logger
     */
    export class ErrorLogger extends ghost.events.EventDispatcher{
		public static EVENT_ERROR: string = "error";
		private static _instance: ErrorLogger;
		private _initialized:boolean = false;
		public static instance():ErrorLogger
		{
			if(!ErrorLogger._instance)
			{
				ErrorLogger._instance = new ErrorLogger();
				ErrorLogger._instance.init();
			}
			return ErrorLogger._instance;
		}
		public constructor()
		{
			super();
			if (ErrorLogger._instance)
			{
				console.warn("Error Logger already exists", this, ErrorLogger._instance);
			}
			ErrorLogger._instance = this;
		}
    	public init():void
    	{
			if (!this._initialized)
			{
				this._initialized = true;
				window.onerror = this.onError.bind(this);
			}
    	}
    	public addError(error:any):void
    	public addError(message:string, error:any):void
		public addError(message: any, error?: any): void
    	{
    		try
    		{

    		
				if (error == undefined)
				{
					error = message;
					message = "";
				}


				var stackline: any = ghost.debug.Log.getStackTrace(2);
				var url:string = "";
				var line:number = 0;
				var column: number = 0;
				if(stackline)
				{
					url = stackline.file;
					line = stackline.line;
					column = stackline.column;
				}
	    		if(!(error instanceof Error))
	    		{
					
		    		try
		    		{
		    			window["___Catcherror"]();
		    		}catch(err)
		    		{
		    			error = new Error();
		    			error.stack = err.stack.split("\n").slice(2).join("\n");
		    			if(!message)
		    				message = "unknown_error";
		    		}
	    		}else
	    		{
	    			message = error.message;
	    		}
	    		
	    		this.onError(message, url, line, column, error);
	    	}catch(error)
	    	{
	    		console.error("unable to log error", message, error);
	    	}
    	}
		public onError(message: string, url: string, line: number, column: number, error: any)
		{
			var data: UncaughtError = new UncaughtError(
				{
					message: message,
					url: url,
					line: line,
					column: column,
					error: error
				});
			this.dispatch(data);

			return true;
		}
		protected dispatch(error: UncaughtError): void
		{
			this.trigger(ErrorLogger.EVENT_ERROR, error);
			console.error(error);
		}
    }
    export class UncaughtError
    {
		public options: IUncaughtError;
		public constructor(options: IUncaughtError)
		{
			this.options = options;
		}
		public toObject(add_hardware:boolean = false):any
		{
			var data: any = {};
			for(var p in this.options)
			{
				data[p] = this.options[p];
			}
			if(data.error)
			{
				data.stack = data.error.stack;
				data.name = data.error.name;
				delete data.error;
			}
			data = { error: data };
			if (add_hardware)
			{
				data.hardware = ghost.core.Hardware.toObject();
			}
			data.url = window.location.href;
			return data;
		}
		public toJSON():string
		{
			return JSON.stringify(this.toObject());
		}

    }

	export interface IUncaughtError {
		 message: string;
		 url: string;
		 line: number;
		 column: number;
		 error?: Error;

    }
}
