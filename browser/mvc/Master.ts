//convert
 /* ghost.browser.mvc.Model.*/
import {Model} from "browser/mvc/Model";
//convert
 /* ghost.browser.i18n.Polyglot.*/
import {Polyglot} from "browser/i18n/Polyglot";
//convert
 /* ghost.browser.data.LocalForage
*/
import {LocalForage} from "browser/data/Forage";
//convert
 /* ghost.debug.ErrorLogger.*/
import {ErrorLogger} from "browser/debug/ErrorLog";
//convert
 /* ghost.events.Eventer.*/
import {Eventer} from "ghost/events/Eventer";
//convert
 /* ghost.events.EventDispatcher)*/
import {EventDispatcher} from "ghost/events/EventDispatcher";
///<module="io"/>
//convert-files
import {IData} from "./IData";
//convert-files
import {Controller} from "./Controller";
//convert-files
import {Template} from "./Template";
//convert-files
import {IDataParts} from "./IDataParts";
//convert-files
import {Data} from "./Data";
//convert-files
import {IModel} from "./IModel"; 





///<reference path="typings/globals/ractive/index.d.ts"/>;


//convert-import
import {_Promise} from "ghost/promises/_Promise";


///<module="framework/ghost/promises"/>
///<module="framework/browser/debug"/>

    
    //convert-import
import {Navigation} from "browser/navigation/Navigation";
    
    //convert-import
import {Scope} from "browser/mvc/Scope";
    
    //convert-import
import {CollectionAPI} from "browser/mvc/CollectionAPI";
    
    //convert-import
import {Component} from "browser/mvc/Component";
    export class Master extends Controller {
		/**
         * List of events
         * @type {{ACTIVATED: (ACTIVATED), DISACTIVATED: (DISACTIVATED)}}
         */
        public static EVENTS: any = Controller.EVENTS;
        // public static partials_context: any = {};
		//private templateString:string;
        protected templateData:Template;
		protected template:any;
		private templateOptions:any;
		protected _firstActivation:boolean = true;
		protected _data:any[];
		protected _activated:boolean = false;
		protected $container:JQuery;

        protected _parts:IPart[];
        protected _partsPromises:Promise<any>[];

        protected paramsFromActivation:any;

        protected _bindedEvents: IEvent[];
        protected _activationCount: number = 0;


		constructor()
		{
			super();
            
            _Promise;
			this._data = [];
            this._parts = [];
            this._partsPromises = [];
            this._bindedEvents = [];
		}
        public navigation():Navigation
        {
            return Navigation.instance;
        }
        public scope(scope: Scope = null): Scope {
            if (scope) {
                if(this._scope && this._scope != scope)
                {
                    this.$container = null;
                }
                this._scope = scope;
            }
            return this._scope;
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
                if ((name.parts || name.ractive || name.name || name.async != undefined || name.part != undefined) && name.data)
                {
                    this._parts[this._parts.length-1] = name;
                    name = name.data;
                    delete this._parts[this._parts.length-1].data;
                }
                //TODO:check this
                if(typeof name == "function")
                {
                    name = Model.get(name, true);
                    if(name && !this[name.name()])
                    {
                        this[name.name()] = name;
                    }
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

        protected cache(): LocalForage
        {
            return LocalForage.instance().war( this.name() + '_controller' );
        }

        /**
         * Override this function to enable params mapping
         * @returns Array of string
         */
        protected getParamsMapping():string[]
        {
            return null;
        }
        public setParameters(params:any):void
        {
            var mapping:string[] = this.getParamsMapping();
            if(mapping)
            {
                if(!params)
                {
                    params = [];
                }
                this.paramsFromActivation = mapping.reduce(function(result:any, data:any, index:number):any
                {
                    if(params.length>index)
                    {
                        result[mapping[index]] = params[index];
                    }
                    return result;
                }, {});
            }else
            {
                this.paramsFromActivation = params;
            }
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
            this.setParameters(params);
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
    		 			this.render().then(()=>
                        {
                            this.activation();
                            if(this.templateData)
                                this.templateData.on(Template.EVENT_EXPIRED, this._onTemplateExpired, this);
                        }, (error)=>
                        {
                            ErrorLogger.instance().addError(error);
                            throw new Error(error);
                        });

                    }catch(error)
                    {
                        console.error(error);
                        debugger;
                        //disallow es6promise to catch this error
                        setTimeout(function()
                        {
                            throw error;
                        },0);
                    }
		 		}  
                 //LOOL
	 		}).catch((error)=>
	 		{
                    debugger;
                ErrorLogger.instance().addError("master_activation_failed",error);
	 			console.error("Master failed during preactivation", this, error);

                var scope : string    = this.scoping();
                var page : string     = this.navigation().getDefaultPage( scope );

                window.setTimeout(() => {
                    Navigation.changeHash( scope + '/' + page );
                }, 0);
 			});
        }
        /**
         * Called after view is loaded (not necesseraly all data)
         */
        protected bindEvents():void
        {

        }

        protected $(object: any, events: string, handler: (eventObject: JQueryEventObject, ...args: any[]) => any): JQuery;
        protected $(object: any, events: string, selector: string, handler: (eventObject: JQueryEventObject) => any): JQuery;
        protected $(object: any, events: string, selector: string, data: any, handler: (eventObject: JQueryEventObject) => any): JQuery;
        protected $(object:any, events: { [key: string]: any; }, selector?: any, data?: any): JQuery;

        protected $(object: any, events: any, selector: any, data?: any, handler?: any): JQuery
        {
            if(typeof object == "string")
            {
                object = $(this.getContainer()).find(object);
            }
            if(!object)
            {
                object = this.getContainer();
            }
            var $result:any =  $(object).on(events, selector, data, handler);
            /*
            export interface IEvent {
                selector: string;
                useDocument?: boolean;
                useContainer: boolean;
                listener: any;
                event: string;
            }*/

            if (handler == null)
            {
                if(typeof data == "function")
                {
                    handler = data;
                    data = null;
                }else
                if (typeof selector == "function") {
                    handler = selector;
                    selector = null;
                }
            }

            var listener: IEvent =
            {
                object: object,
                events: events,
                handler:handler,
                selector:selector
            };
            this._bindedEvents.push(listener);
            return $result;
        }

        /**
         * Called when all data is loaded
         */
        protected bindAsyncEvents():void
        {

        }
        protected unbindEvents():void
        {

        }
        protected _unbindEvents(): void
        {

            var ievent: IEvent;
            while (this._bindedEvents.length)
            {
                ievent = this._bindedEvents.shift();
                if(ievent.selector)
                    $(ievent.object).off(ievent.events, ievent.selector, ievent.handler);
                else
                    $(ievent.object).off(ievent.events, ievent.handler);
            }
        }
        /**
         * Called when the controller is asked for disactivation
         * @protected
         */
        public _predisactivate():void
        {
            if(this._activated)
            {
                Eventer.off(Eventer.APPLICATION_RESUME, this.resume, this);
                Eventer.off(Eventer.APPLICATION_PAUSE, this.pause, this);
                this._data.forEach((item:any, index:number)=>
                {
                    var events:string[] = this._parts[index] &&  this._parts[index].events?this._parts[index].events:[Model.EVENT_CHANGE];
                    var event:string;
                    for(var p in events)
                    {
                        event = events[p];
                        if(item instanceof EventDispatcher)
                        {
                            item.off(event, this._onModelChange, this);
                        }else
                        {
                            for(var p in item)
                            {
                                if(item[p] instanceof EventDispatcher)
                                {
                                    item[p].off(event, this._onModelChange, this);
                                }
                            }
                        }

                    }
                });
                this.disactivate();
                this._unbindEvents();
                this.unbindEvents();
                this.trigger(Master.EVENTS.DISACTIVATED);
                this.hideContainer();
                if(this.template)
           		 {
                    Polyglot.instance().off("resolved:"+this.getTranslationTemplate(), this._onTranslationChange, this);
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
                if(this.templateData)
                {
                    this.templateData.off(Template.EVENT_EXPIRED, this._onTemplateExpired, this);
                }
                console.log("[master] Disativated ", this);
            	this._activated = false;
                this.postDisactivate();
            }
        } 
        public boot():void
        {

        }
        public handleRoute(url:string, route:any):any
        {
            return this.canActivate(route.params);
        }
        
        protected postDisactivate():void
        {

        }
        public isActivated():boolean
        {
            console.log("[master]isActivated", this, this._activated);
        	return this._activated;
        }
        protected initializeFirstData():Promise<any>|boolean
        {
            console.log("[master]initializeFirstData", this);
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
            console.log("[master]initialView-start", this);
            if(!this.scoping())
            {
                //no template - no view
                return true;
            }
            if (this.templateData)
            {
                if (!this.templateData.loaded())
                {
                    debugger;
                    this.templateData = null;
                }
            }
        	if(!this.templateData)
        	{
        		//var _self:Master = this;
        		var templateStr:string = this._getTemplate();
                if (!templateStr)
        		{
        			 console.warn("no template for master:", this);
                    return true;
        		}
                var temp = Template.getTemplate(templateStr);
               if(temp)
               {
                   this.templateData = temp;
                   console.log("already loaded:", this.name());
                    return true;
               }

        		var promise:Promise<void> = new Promise<void>((resolve, reject):void=>
        		{
                    Template.load(templateStr).then((template: Template) =>
                    {
                        this.templateData = template;
                        if(!this.templateData)
                        {
                            debugger;
                        }
                        console.log("[master]initialView-end", this);
                        console.log("loaded:", this.name());
                        resolve();
                    }, reject);
        		});

                return promise;
        	}
            console.log("[master]initialView-end");
        	return true;
        }
        protected initializeData():Promise<any>|boolean
        {
            console.log("[master]initialData-start", this);
            var params:any = this.getActivationParams();
        	var promises:Promise<any>[] = <any>this._data.map((item:any, index:number)=>
        	{
                if(item.retrieveData)
                {
                    if(this._parts[index] && this._parts[index].part === false)
                    {
                        return null;
                    }
                    if(this._parts[index] && this._parts[index].condition)
                    {
                        if(!this._parts[index].condition())
                        {
                            return null;
                        }
                    }
                    var promise:any;
                    if(this._parts[index] && this._parts[index].parts)
                    {
                        promise =  item.retrieveData(this._parts[index].parts, params);
                    }else
                    {
                        promise = item.retrieveData(null, params);
                    }
                    if(this._parts[index] && this._parts[index].async === true)
                    {
                        this._partsPromises.push(promise);
                        return true;
                    }
                    
        		  return promise;
                }
                return null;
    		}, this).filter(function(item:any)
            {
                return item != null;
            });
            if(this._partsPromises.length)
            {
                Promise.all(<any[]> this._partsPromises).then(()=>
                {
                    this.bindAsyncEvents();
                });
            }else
            {
                this.bindAsyncEvents();
            }
            console.log("[master]initialData-end-sync", this);
        	return Promise.all(promises);
        }
        protected firstActivation():Promise<any>|boolean
        {
               console.log("[master]firstactivation-start", this);
        	if(!this._firstActivation)
        	{
        		return true;
        	}
        	this._firstActivation = false;
        	return this.ready();
        }
        protected activation():void
        {
            console.log("[master]activationend-sync", this);
            this._activationCount++;
            this.bindEvents();
            if (this._activationCount>1)
                this.refresh();

        	this.activate();
   			this.trigger(Master.EVENTS.ACTIVATED);


            Eventer.on(Eventer.APPLICATION_RESUME, this.resume, this);
            Eventer.on(Eventer.APPLICATION_PAUSE, this.pause, this);
            this.postActivation();
        }
        protected refresh():void
        {
            for (var p in this._data) {
                if(this._data[p] instanceof CollectionAPI)
                {
                    this._data[p].refresh();
                }
            }
        }
        protected postActivation():void
        {
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
            var $scope = $("[data-scope='" + (this._scope?this.scope().name():this.scoping()) + "']");
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
        protected _onModelChange(/*model:any, name:string*/):void
        {
            //console.log(arguments);
            //required due to custom events
            var ractive = arguments[arguments.length - 1];
            var name = arguments[arguments.length - 2];
            var model = arguments[arguments.length - 3];
            var data:any;
            if(!model)
            {
                debugger;
            }
            if(model.toRactive)
            {
                data = model.toRactive(ractive);
            }else
            {
                if(model instanceof Data)
                {
                    data = model.value;
                }else
                {
                    if(model.toObject)
                    {

                        data = model.toObject();
                    }else
                    {
                        debugger;
                        //data = model;
                        return;
                    }
                }
            }
            this.template.set(name, data);
        }
        protected toRactive():any
        {
            var _self:Master = this;
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
                        var ractiveString:string = _self._parts[index]?_self._parts[index].ractive:undefined;
                        var name:string = _self._parts[index] && _self._parts[index].name?_self._parts[index].name:item.name();
                        //models
                        previous[name] = item.toRactive?item.toRactive(ractiveString):item instanceof Data?item.value:item.toObject();
                    }
                    return previous;
                }, {} );
        }

        public render():Promise<any>
        {


            var promise:Promise<any> = new Promise<any>((resolve:any, reject:any):void=>
            {
                if (!this.scoping()) {
                    return resolve();
                }
                if(!this.templateData) {
                   reject("no template data");
                    return;
                }
                if(this.templateData.loaded())
                {
                    this.templateRender().then(resolve, reject);
                }else
                {
                    this.templateData.retrieve().then((template:Template)=>
                    {
                        this.templateData = template;
                        this.templateRender().then(resolve, reject);
                    },function(error)
                    {
                        return reject(error);
                    });
                }
            });



            return promise;

        }
        protected templateRender():Promise<any>{
            var promise:Promise<any> = new Promise<any>((resolve:any, reject:any):void=>
            {
                var container:any = this.getContainer();
                if(container)
                {
                    this.showContainer();
                    var options:any =
                    {

                    };
                    //toRactive + listener on evnetdispatcher

                    this._data.forEach((item:any, index:number)=>
                    {
                        var events:string[] = this._parts[index] &&  this._parts[index].events?this._parts[index].events:[Model.EVENT_CHANGE];
                        var event:string;
                        for(var p in events)
                        {
                            event = events[p];
                            if(item instanceof EventDispatcher)
                            {
                                //         item.off(event, this._onModelChange, this);
                                item.on(event, this._onModelChange, this, item,this._parts[index] && this._parts[index].name?this._parts[index].name:(<any>item).name(), this._parts[index] && this._parts[index].ractive?this._parts[index].ractive:null);
                            }else
                            {
                                for(var p in item)
                                {
                                    if(item[p] instanceof EventDispatcher)
                                    {
                                        //   item[p].off(event, this._onModelChange, this);
                                        item[p].on(event, this._onModelChange, this, item[p], this._parts[index] && this._parts[index].name?this._parts[index].name:item[p].name(), this._parts[index] && this._parts[index].ractive?this._parts[index].ractive:null);
                                    }
                                }
                            }

                        }
                    });
                    var data:any = this.toRactive();
                    data.trans = Polyglot.instance().t.bind(Polyglot.instance());
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
                    //partials
                    options.data._partials = {};
                    options.data._components = {};
                    /*
                    options.data.makeContext = function(name, data)
                    {
                        var url: string = "partial/" + name;
                        var template: any = Template.getTemplate(url);
                        if (!template) {
                            return "";
                        }
                        debugger;
                       
                        return data;
                    };*/
                    options.partials  = {};
                    options.components = {};
                    /*
                    options.components.Autocomplete = function()
                    {
                        debugger;
                    };*/
                    /*
                    Ractive.extend({
                        template: function()
                        {

                        }
                    }); function()
                    {
                      return null;
                    };*/

                    options.data.makeComponent = (name, token, data) => {
                        var url: string = "rcomponents/" + name.toLowerCase(); 
                        var urlPartial: string = "rcomponents/" + token;
                        if (!(<any>Ractive).partials[url])
                        {
                            (<any>Ractive).partials[url] = ""; 
                            if (!(<any>Ractive).components[name])
                            {
                                (<any>Ractive).components[name] = Ractive.extend(Component.getConfig(name));
                            }
                            Component.loadTemplate(url).then((template:Template)=>
                            {
                                var context:string = "";
                                if(data)
                                {
                                    for(var p in data)
                                    {
                                        context+= ' '+p+'="'+data[p]+'"';
                                    }
                                }
                                //Master.partials_context[name] = context;
                                (<any>Ractive).partials[url] = '<' + name+ ' model="{{this}}/>';
                                (<any>Ractive).partials[urlPartial] = '<' + name + ' model="{{this}}"' + context + '/>';
                                this.template.set("_components." + token.toLowerCase(), true);
                                this.template.set("_components." + token.toLowerCase(), false);
                            });
                        }else{
                            var context: string = "";
                            if (data) {
                                for (var p in data) {
                                    context += ' ' + p + '="' + data[p] + '"';
                                }
                            }
                            (<any>Ractive).partials[urlPartial] = '<' + name + ' model="{{this}}"' + context + '/>';
                        }
                        return urlPartial;
                    };

                    options.data.makePartial = (name, data)=> {
                        var url: string = "partial/" + name;
                        if((<any>Ractive).partials[url])
                        {
                            return url;
                        } 
                        var template: any = Template.getTemplate(url); 
                        if (!template)
                        {
                            (<any>Ractive).partials[url] = "";
                            Template.load(url).then((template:Template) =>
                            {           
                                if(!template)
                                {
                                    return;
                                }
                                template.prepareForUse().then(()=> {
                                    if ((<any>Ractive).partials[url] !== template.parsed) {
                                        (<any>Ractive).partials[url] = template.parsed;
                                        this.template.set("_partials." + name, true);
                                        this.template.set("_partials." + name, false);
                                    }
                                    try {
                                        this.onPartial(name);
                                    } catch (error) {
                                        debugger;
                                    }
                                }, function() {
                                    debugger;
                                 });    
                            });      
                        }else
                        {
                            if (!(<any>Ractive).partials[url])
                            {
                                template.prepareForUse().then(() => {
                                    if ((<any>Ractive).partials[url] !== template.parsed)
                                    {
                                        (<any>Ractive).partials[url] = template.parsed;
                                        this.template.set("_partials." + name, true);
                                        this.template.set("_partials." + name, false);
                                    }
                                    try {
                                        this.onPartial(name);
                                    } catch (error) {
                                        debugger;
                                    }
                                }, function() {
                                    debugger;
                                });     
                            }
                            /*if (data)
                                return url + " " + JSON.stringify(data);*/
                        }
                        return url;
                    };

                    options.el = container;

                    //Polyglot.instance().on("resolved:"+this.getTranslationTemplate(), this._onTranslationChange, this);
                    Polyglot.instance().on("resolved", this._onTranslationChange, this);

                    try
                    {

                        if(!this.isActivated())
                        {
                            //disactivated during the load
                            debugger;
                            return;
                        }
                        console.log("render:", this.name());
                        if(!this.templateData)
                        {
                            debugger;
                        }


                        if (this.templateData.components)
                        {
                            var name: string;
                            for (var p in this.templateData.components)
                            {
                                name = this.templateData.components[p].name;
                                if(!options.components[name])
                                {
                                    options.components[name] = this.templateData.components[p].component;
                                }
                            }
                        }
                        //JSON.parse(JSON.stringify(this.templateData.parsed)); //Ractive["parse"](this.templateData.content, options.template);
                        //debugger;
                        console.log("TEMPLATE", options);

                        this.templateData.prepareForUse(options).then(() => {
                            if (!this.templateData.parsed) {
                                reject(new Error("no parsed data"));
                                return;
                            }
                            options.template = this.templateData.parsed;
                            this.template = new Ractive(options);
                            var listener: any = binded; //this.getBindedEventListeners();
                            if (listener) {
                                for (var p in listener) {
                                    this.template.on(p, listener[p]);

                                }
                            }
                            resolve();
                        }, reject).catch(function(error)
                        { 
                            reject(error);
                        });
                    }catch(error)
                    {
                        console.error(error);
                        reject(error);
                        debugger;
                        return;
                    }

                   
                }else
                {
                    debugger;
                    console.warn("no container for ", this);
                    reject("no container for "+this);
                }
            });
            return promise;
        }
        protected onPartial(name:string):void
        {
        }
        protected onComponent(name: string): void
        {
        }
        protected rerender():void
        {
            if(this.template)
            {
                this.template.teardown();
                this.template = null;
            }
            this.render();
        }
        private getTranslationTemplate():string
        {
            return this.getTemplate().split("/").slice(1, 2).join(".").toLowerCase();
        }
        private _onTemplateExpired():void
        {
            //debugger;
            if(this.isActivated())
            {
                this.templateData.retrieve().then((template:Template)=>
                {
                   // debugger;
                    if(this.isActivated())
                    {
                     /*   setTimeout(()=>
                        {

                            this.rerender();
                        },10000);*/
                    }
                });
            }else {
                debugger;
            }
        }
        private _onTranslationChange():void
        {
            if(this.template)
            {
                //this.template.set("t",)
                this.template.set("trans",Polyglot.instance().t.bind(Polyglot.instance()));
                //as it destroy everything it break jquery binding

                /*
                //Polyglot.instance().off("resolved:"+this.getTranslationTemplate(), this._onTranslationChange, this);
                Polyglot.instance().off("resolved", this._onTranslationChange, this);
                this._data.forEach((item:any, index:number)=>
                {
                    var events:string[] = this._parts[index] &&  this._parts[index].events?this._parts[index].events:[Model.EVENT_CHANGE];
                    var event:string;
                    for(var p in events)
                    {
                        event = events[p];
                        if(item instanceof EventDispatcher)
                        {
                            item.off(event, this._onModelChange, this);
                        }else
                        {
                            for(var p in item)
                            {
                                if(item[p] instanceof EventDispatcher)
                                {
                                    item[p].off(event, this._onModelChange, this);
                                }
                            }
                        }

                    }
                });
                this.template.teardown();
                this.template = null;
                setTimeout(()=>
                {
                    this.render();
                }, 0);
                //this.render();
                */
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

        protected fireComponents(name: string, method: string, params: any = null): void {
            var components: any[] = this.template.findAllComponents();
            if (name) {
                components = components.filter(function(component: any): boolean {
                    return component.getComponentName && component.getComponentName() === name;
                });
            }
            components.forEach(function(component: any) {
                component[method].apply(component, params);
            });

        }
	}
    export interface IPart
    {
        data:any;
        parts?:string[];
        /**
         * Load part at master initialisation
         * @type {[type]}
         */
        part?:boolean;
        ractive?:string;
        name?:string;
        events?:string[];
        condition:Function;
        //TODO:add async options
        /**
         * Data loaded asynchrone
         */
        async?:boolean;
    }
    export interface IEvent
    {
        object:any;
        events:any;
        selector:string;
        handler:any;
    }
