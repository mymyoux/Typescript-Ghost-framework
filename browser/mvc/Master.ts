///<module="io"/>
///<file="IData"/>
///<file="Controller"/>
///<lib="es6-promise"/>
///<lib="ractive"/>
///<module="framework/ghost/promises"/>
///<module="framework/browser/debug"/>
module ghost.mvc
{
	export class Master extends Controller
	{
		/**
         * List of events
         * @type {{ACTIVATED: (ACTIVATED), DISACTIVATED: (DISACTIVATED)}}
         */
        public static EVENTS:any = Controller.EVENTS;
		private templateString:string;
		protected template:Ractive;
		private templateOptions:IRactiveOptions;
		protected _firstActivation:boolean = true;
		protected _data:any[];
		protected _activated:boolean = false;
		protected $container:JQuery;

        protected _parts:IPart[];

        protected paramsFromActivation:any;


		constructor()
		{
			super();
			this._data = [];
            this._parts = [];
		}
        public navigation():ghost.browser.navigation.Navigation
        {
            return ghost.browser.navigation.Navigation.instance;
        }

        public addData(value:IDataParts):void;
		public addData(value:IData):void;
		public addData(name:string, value:any):void
		public addData(name:any, value?:any):void
		{
            this._parts.push(null);
			if(typeof name == "string")
			{
				this._data.push(new Data(name, value));
			}else
			{
                //additional parts
                if((name.parts || name.ractive || name.name) && name.data)
                {
                    this._parts[this._parts.length-1] = name;
                    name = name.data;
                    delete this._parts[this._parts.length-1].data;
                } 
                if(typeof name == "function")
                {
                    name = ghost.mvc.Model.get(name);
                }
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
            if(data)
			 data.forEach(this.addData, this);
			this.setData();
		}
		protected setData():void
		{

		}
        public setParamaters(params:any):void
        {
            this.paramsFromActivation = params;
        }

		protected getInitialData():any[]
		{
			return null;
		}
        protected getActivationParams():any
        {
            return this.paramsFromActivation;
        }
        /**
         * Called when the controller is asked for activation
         * @protected
         */
        public _preactivate(params?:any):void
        {
            this.paramsFromActivation = params;
        	if(this._activated)
        	{
        		//already activating/ed
        		return;
        	}

        	this._activated = true;
		 	(<any>Promise).series([this.initializeFirstData.bind(this), this.initializeView.bind(this), this.initializeData.bind(this), this.isActivated.bind(this), this.firstActivation.bind(this)]).
		 	then(()=>
		 	{	
                
		 		//if could have been turn off
		 		if(this.isActivated())
		 		{
                    try
                    {
    		 			this.render();
    		 			this.activation();
                    }catch(error)
                    {
                        //disallow es6promise to catch this error
                        setTimeout(function()
                        {
                            throw error;
                        },0);
                    }
		 		}
	 		},(error)=>
	 		{
	 			console.error("Master failed during preactivation", this, error);
 			});
        }
          /**
         * Called when the controller is asked for disactivation
         * @protected
         */
        public _predisactivate():void
        {
            if(this._activated)
            {
                ghost.events.Eventer.off(ghost.events.Eventer.APPLICATION_RESUME, this.resume, this);
                ghost.events.Eventer.off(ghost.events.Eventer.APPLICATION_PAUSE, this.pause, this);
                this.disactivate();
                this.trigger(Master.EVENTS.DISACTIVATED);
                this.hideContainer();
                if(this.template)
           		 {
                    ghost.browser.i18n.Polyglot.instance().off("resolved:"+this.getTranslationTemplate(), this._onTranslationChange, this);
	                /*var listener:any = this.getBindedFunctions();
	                if(listener)
	                {
	                    for(var p in listener)
	                    {
	                        this.template.off(p, listener[p]);
	                        
	                    }
	                }*/
	                //TODO:maybe dont remove template
	                this.template.teardown();
            	}
            	this._activated = false;
            }
        }
        public isActivated():boolean
        {
        	return this._activated;
        }
        protected initializeFirstData():Promise<any>|boolean
        {
            console.log(this, this._data);
        	if(this._data.length)
        	{
        		return true;
        	}
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
        	return true;
        }
        protected initializeData():Promise<any>|boolean
        {
        	var promises:Promise<any>[] = this._data.map(function(item:any, index:number)
        	{	
                if(item.retrieveData)
                {
                    if(this._parts[index] && this._parts[index].parts)
                    {
                        return item.retrieveData(this._parts[index].parts);
                    }
        		  return item.retrieveData();
                }
                return null;
    		}, this).filter(function(item:any)
            {
                return item != null;
            });
        	return Promise.all(promises);
        }
        protected firstActivation():Promise<any>|boolean
        {
        	if(!this._firstActivation)
        	{
        		return true;	
        	}
        	this._firstActivation = false;
        	return this.ready();
        }
        protected activation():void
        {
        	this.activate();
   			this.trigger(Master.EVENTS.ACTIVATED);
            ghost.events.Eventer.on(ghost.events.Eventer.APPLICATION_RESUME, this.resume, this);
            ghost.events.Eventer.on(ghost.events.Eventer.APPLICATION_PAUSE, this.pause, this);
        }
         /**
         * Called when application is paused (mobile + maybe tab lost focus?)
         */
        protected pause():void
        {

        }
        /**
         * Called when application is resumed (mobile)
         */
        protected resume():void
        {

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
         * Called on the first activation - after all have been set but just before #activate();
         */
        protected ready():Promise<any>|boolean  
        {
            return true;
        }
		/**
         * Call when the master is activated
         */
        public activate():void
        {
            super.activate();
        }
        public getContainer():any
        {
            if(this.$container && this.$container.length)
            {
                return this.$container.get(0);
            }
            console.log("get container",this.name());
            var $scope = $("[data-scope='"+this.scoping()+"']");
            if($scope.length)
            {
                 var container:HTMLElement = $scope.children("[data-container='"+this.name()+"']").get(0);
	            if(!container)
	            {
	            	$scope.append('<div data-container="'+this.name()+'"></div>');
	            }
	            this.$container = $scope.children("[data-container='"+this.name()+"']");
	            container = this.$container.get(0);
            return container;
            }
        }
        protected showContainer():void
        {
        	if(this.$container)
        	{
        		this.$container.show();
        	}
        }
        protected hideContainer():void
        {
        	if(this.$container)
        	{
        		this.$container.hide();
        	}
        }
        protected _onModelChange(label:string, model:any, name:string):void
        {
            this.template.set(name, model.toRactive?model.toRactive():model instanceof Data?model.value:model.toObject());
        }
        protected toRactive():any
        {
            var _this:Master = this;
            return this._data.reduce(function(previous:any, item:any, index:number)
                {
                    if(!item.name || typeof item.name != "function")
                    {
                        //classical objects
                        for(var p in item)
                        {
                            previous[p] = item[p];
                        }
                    }else
                    {
                        var ractiveString:string = _this._parts[index]?_this._parts[index].ractive:undefined;
                        var name:string = _this._parts[index] && _this._parts[index].name?_this._parts[index].name:item.name();
                        if(name == "cabinetcandidate")
                        {
                            debugger;
                        }
                        //models
                        previous[name] = item.toRactive?item.toRactive(ractiveString):item instanceof Data?item.value:item.toObject();
                    }
                    return previous;
                }, {} );   
        }

        public render():void
        {
        	 var container:any = this.getContainer();
            if(container)
            {
        		this.showContainer();
                var options:any = 
                {
                	template:this.templateString
                };
                //toRactive + listener on evnetdispatcher

                this._data.forEach((item:any)=>
                {
                    if(item instanceof ghost.events.EventDispatcher)
                    {
                        item.off(ghost.mvc.Model.EVENT_CHANGE, this._onModelChange, this);
                        item.on(ghost.mvc.Model.EVENT_CHANGE, this._onModelChange, this, item, item.name());
                    }else
                    {
                        for(var p in item)
                        {
                            if(item[p] instanceof ghost.events.EventDispatcher)
                            {
                                item[p].off(ghost.mvc.Model.EVENT_CHANGE, this._onModelChange, this);
                                item[p].on(ghost.mvc.Model.EVENT_CHANGE, this._onModelChange, this, item[p], item[p].name());
                            }
                        }
                    }
                });
                var data:any = this.toRactive();
                data.trans = ghost.browser.i18n.Polyglot.instance().t.bind(ghost.browser.i18n.Polyglot.instance());
                var binded:any = this.getBindedFunctions();
                for(var p in binded)
                {
                    data[p] = binded[p];
                }
                //not sure
               	for(var p in binded)
                {
                     options[p] = binded[p];
                }
                options.data = data;

                options.el = container;


                ghost.browser.i18n.Polyglot.instance().on("resolved:"+this.getTranslationTemplate(), this._onTranslationChange, this);

                this.template = new Ractive(options);

                var listener:any = this.getBindedFunctions(); //this.getBindedEventListeners();
                if(listener)
                {
                    for(var p in listener)
                    {
                        this.template.on(p, listener[p]);
                        
                    }
                }
            }else
            {
                console.warn("no container for ", this);
            }
        }
        private getTranslationTemplate():string
        {
            return this.getTemplate().split("/").slice(1, 2).join(".").toLowerCase();
        }
        private _onTranslationChange():void
        {
            if(this.template)
            {
                this.template.update();
            }
        }
        /**
         * List of functions to bind key/function
         * @return {any} [description]
         */
        protected getBindedFunctions():any
        {
            return null;
        }
	}
    export interface IPart
    {
        data:any;
        parts?:string[];
        ractive?:string;
        name?:string;
    }
}