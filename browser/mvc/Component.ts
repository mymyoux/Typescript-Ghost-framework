///<module="framework/ghost/utils"/>
namespace ghost.mvc {
	import Classes = ghost.utils.Classes;
    export class Component extends ghost.events.EventDispatcher 
    {
		protected static packages: any[] = [];
		protected static components: any = {};
		protected static _components: Component[] = [];
		protected static _instances: any[] = [];

    	public static getComponentClass(name:string):Component
    	{
    		if(Component.components[name])
    		{ 
				return Component.components[name]; 
    		}
			return Component.getComponentClassFromPackage(name);
    	}
		protected static getComponentClassFromPackage(name: string): Component {
			for (var p in Component.packages) {
				if (Component.packages[p][name]) {
					var componentClass: any = Component.packages[p][name];
					return Component.components[name] = componentClass;
				}
			}
			return null;
		}
    	public static addComponentPackage(packages:any):void
    	{
			this.packages.push(packages);
    	}
    	
    	protected static getComponentForInstance(instance:any, name:string):Component
    	{
			if (!Component._components)
			{
				Component._components = [];
				Component._instances = [];
			}
			var index: number = Component._instances.indexOf(instance);
			if(index == -1)
			{
				var componentClass: any = this.getComponentClass(name);
				var component: Component = new componentClass(instance, name);
				Component._instances.push(instance);
				Component._components.push(component);
				return component;
			}
			return Component._components[index];
    	}
    	public static loadTemplate(name:string):Promise<any>
    	{
			return Template.load(name);
    	}
		public static onConstruct(instance: any, name: string, config:any): void 
		{
			return this.getComponentForInstance(instance, name).onConstruct(config);
		}
		public static onInit(instance: any, name: string): void
		{
			return this.getComponentForInstance(instance, name).onInit();
		}
		public static onRender(instance: any, name: string): void
		{
			return this.getComponentForInstance(instance, name).onRender(); 
		}
		public static onConfig(instance: any, name: string): void
		{
			return this.getComponentForInstance(instance, name).onConfig();
		}
		public static onComplete(instance: any, name: string): void
		{
			return this.getComponentForInstance(instance, name).onComplete(); 
		}
		public static getData(instance: any, name: string): any
		{
			return this.getComponentForInstance(instance, name).getData();
		}
		public static getTemplate(instance: any, name: string): any
		{
			return this.getComponentForInstance(instance, name).getTemplate();
		}
		public static callMethod(instance:any, name:string, method:string, args:any[] = null)
		{
			var current: any = this.getComponentForInstance(instance, name);
			var config:any = current._getBindedFunctions();
			if(!config || !config[method])
			{
				console.error(method + " isn't binded on " , current);
				throw new Error(method + " isn't binded  on " + Classes.getName(current));
			}else
			{
				method = config[method];
				var func: any = method;
				if(typeof func == "string")
				{
					func = current[method];
				}  
				return func.apply(current, args);
			}
			return null;
		}
		protected static getBindedFunctions(name:string): any {
            var componentClass: any = this.getComponentClass(name);
            if(!componentClass)
            {
				return null;
            }
            return componentClass.prototype.getBindedFunctions();
        }
		public static getConfig(name:string):any
		{
			var config:any = {
				onconstruct: function(config) {
					return Component.onConstruct(this, name, config);
				},
				oninit: function() {
					return Component.onInit(this, name);
				},
				onrender: function() {
					return Component.onRender(this, name);
				},
				onconfig: function() {
					return Component.onConfig(this, name);
				},
				oncomplete: function() {
					return Component.onComplete(this, name);
				},
				data: function() {
					return Component.getData(this, name);
				},
				template: function() {
					return Component.getTemplate(this, name);
				}
			};
			var binded:any = Component.getBindedFunctions(name);
			if(binded)
				for(var p in binded)
				{
					config[p] = function() { 
						return Component.callMethod(this, name, p, Array.prototype.slice.call(arguments));
					};
				}
			return config;
		}
		protected context: any;
		public constructor(protected instance: any, protected name: string) {
			super();
		}
		protected getTemplateName():string
		{
			return "rcomponents/"+this.name.toLowerCase(); 
		}
		public onConstruct(config:any): void {

			
		}
		public onInit(): void {


			var model = this.instance.get('model');
			if(model)
			{
				if(model.item)
				{
					//not sure (for partial)
					this.context = model.item;
				}else
				{
					this.context = model;
				}
			}
			this.init();
			var binded:any = this._getBindedFunctions();
			if(binded)
			{
				var _self: any = this;
				for(var p in binded)
				{
					var method: any = binded[p];
					if(typeof method == "string")
					{
						method = this[method];
					}
					this.ron(p, method.bind(this));
				}
			}
			//debugger;
			this.instance.once("teardown", ()=>
			{
				this.disactivate();
				this.unbindEvents();
			});
		}
		protected _binded: any;
		protected _getBindedFunctions(): any {
            if (this._binded === undefined)
            {
				this._binded = this.getBindedFunctions();
            }
			return this._binded;
        }
		protected getBindedFunctions(): any {
            return null;
        }
		public onRender(): void {
			//debugger;
		}
		public onConfig(): void {
			//debugger;
		}
		public onComplete(): void {
			this.bindEvents();
			this.activate();
		}
		protected bindEvents():void
		{

		}
		protected unbindEvents(): void
		{

		}
		protected init():void
		{

		}
		protected activate():void
		{

		}
		protected disactivate():void
		{

		}
		protected ron(name:string, callback:Function):void
		{
			this.instance.on(name, callback);
		}
		protected ronce(name:string, callback:Function):void
		{
			this.instance.once(name, callback);
		}
		protected roff(name:string, callback:Function = null):void
		{
			this.instance.off(name, callback);
		}
		public getData(): any {
			//debugger;
			return null;
		}
		public getTemplate(): any {
			var template: Template = Template.getTemplate(this.getTemplateName());
			if (template) {
				if (!template.isParsed()) {
					template.parse({});
				}
				return template.parsed;
			}
			throw new Error("Component " + this.name + " integration not loaded");
			return null;
		}

    }
}
