///<module="ghost/events"/>
///<module="ghost/core"/>
namespace ghost.debug {
    /**
     * Error Logger
     */
    export class ErrorLogger extends ghost.events.EventDispatcher{
		public static EVENT_ERROR: string = "error";
		private static _instance: ErrorLogger;
		public static instance():ErrorLogger
		{
			if(!ErrorLogger._instance)
			{
				ErrorLogger._instance = new ErrorLogger();
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
			window.onerror = this.onError.bind(this);
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
