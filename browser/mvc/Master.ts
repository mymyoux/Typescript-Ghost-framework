///<module="io"/>
///<file="IData"/>
///<file="Controller"/>
///<lib="es6-promise"/>
///<lib="ractive"/>
module ghost.mvc
{
	export class Master extends Controller
	{
		private templateString:string;
		private template:Ractive;
		private templateOptions:IRactiveOptions;
		private _firstActivation:boolean = true;
		private _data:any[];
		protected _activated:boolean = false;
		constructor()
		{
			super();
			this._data = [];
		}

		public addData(value:IData):void;
		public addData(name:string, value:any):void
		public addData(name:any, value?:any):void
		{
			if(typeof name == "string")
			{
				this._data.push(new Data(name, value));
			}else
			{
				this._data.push(name);
			}
		}

		public getData(name:string);
		public getData(cls:Function);
		public getData(index:number);
		public getData(asked:any):IData|IModel
		{
			if(typeof asked == "function")
			{
				for(var p in this._data)
				{
					if(this._data[p] instanceof asked)
						return this._data[p];
				}
			}else
			if(typeof asked == "string")
			{
				for(var p in this._data)
				{
					if(this._data[p].name() == asked)
					{
						if(this._data[p] instanceof Data)
							return this._data[p].value;
						else
							return this._data[p];
					}
				}
			}
			else
			{
				//index
				return this._data[asked];
			}
			return null; 
		}
		protected _setData():void
		{
			var data:any[] = this.getInitialData();
			data.forEach(this.addData, this);
			this.setData();
		}
		protected setData():void
		{

		}

		protected getInitialData():any[]
		{
			return null;
		}
        /**
         * Called when the controller is asked for activation
         * @protected
         */
        public _preactivate():void
        {
        	if(this._activated)
        	{
        		//already activating/ed
        		return;
        	}
        	this._activated = true;
		 	Promise.all(<Promise<any>[]>[this.initializeFirst(), this.initializeView(), this.initializeData()]).
		 	then(()=>
		 	{	
		 		//if could have been turn off
		 		if(this._activated)
		 		{

		 		}
	 		},function()
	 		{

 			});
        }
        protected initializeFirst():Promise<any>|boolean
        {
        	if(!this._firstActivation)
        	{
        		return true;
        	}
        	this._firstActivation = false;
			this._setData();
        	return true;
        }
        protected initializeView():Promise<any>|boolean
        {
        	if(!this.templateString)
        	{
        		var _this:Master = this;
        		var template:string = this._getTemplate();
        		if(!template)
        		{
        			 console.warn("no template for master:", this);
                    return true;
        		}
        		var promise:Promise<void> = new Promise<void>(function(resolve, reject):void
        		{
					ghost.io.ajax({url:template, retry:ghost.io.RETRY_INFINITE})
	        		.then(
        			function(result:string)
        			{	
        				_this.templateString = result;
        				resolve();
    				},
    				reject
	    			);
        		});
        		
                return promise;
        	}
        	return null;
        }
        protected initializeData():Promise<any>|boolean
        {
        	return true;
        }
        protected getRootURL():string
        {
            var pathname:string = window.location.pathname;
            var index:number = pathname.indexOf("/",1);
            if(index > -1)
            {
                pathname = pathname.substring(0, index);
            }
            return window.location.protocol+"//"+window.location.host+(pathname.length>1?pathname+"/":pathname);
        }
        /**
         * Transform #getTemplate() to the final URL template.
         * Override this function to change the URL behaviour
         * @return {string} [description]
         */
        protected _getTemplate():string
        {
        	var template:string = this.getTemplate();
        	if(!template)
        	{
        		return null;
        	}
        	if(template.substring(0, 1)!="/")
        	{
        		template = this.getRootURL()+template;
        	}
        	return template;
        }
        /**
         * Template's name/url
         * @returns {string}
         */
        public getTemplate():string
        {
            return null;
        }
        /**
         * Call when the master is activated (view is )
         */
        public activate():void
        {

        }
	}
}