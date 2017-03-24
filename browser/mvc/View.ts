/**
 * Created by jeremy.dubois on 07/11/14.
 */
///<file="ControllerView.ts"/>
///<lib="ractive"/>
///
namespace ghost.browser.mvc
{
    export class View extends ghost.core.CoreObject
    {
        protected _controller:ControllerView;
        public _models:Model[] = [];
        public _collections:Collection<any>[] = [];
        public template:Ractive;
        protected options:IRactiveOptions;
        private _name:string;
        protected $container:JQuery;
        private first:boolean = true;
        /**
         * View is initialized
         * @type {boolean}
         * @private
         */
        private _initialized:boolean = false;

        public constructor()
        {
            super();
        }
        public name():string
        {
            if(!this._name)
            {
                this._name = this.getClassName().replace(/view/gi,"");
                this._name = this._name.substring(0,1).toLocaleLowerCase()+this._name.substring(1);
            }
            return this._name;
        }
        public setController(controller:ControllerView):void
        {
            this._controller = controller;
        }
        public initialize(callback?:Function):void
        {
            if(this._initialized)
            {
                if(callback)
                {
                    callback();
                }
                return; 
            }
            if(!this.template)
            {
                var template:string = this.getTemplate();
                if(!template)
                {
                    console.warn("no template for view:", this);
                    return;
                }
                 $.ajax(template,
                    {
                        type:"GET"
                    }
                ).done((result)=> {
                    this.options = 
                    {
                        template:result.template.content,

                    }; 
                    if(callback)
                    {
                        callback();
                    }

                })
                .fail((error)=> {
                    console.error("error", error);
                    setTimeout(()=>
                    {
                        this.initialize(callback);
                    },500);
                });
            }




        }
        public ready():void 
        {
          //  this.render();
        }
        public render():any
        {
            var container:any = this.getContainer();
            if(container)
            {
                var data:any = this.getInitialData() || {};
                var models:any = this.getBindedModels();
                if(models)
                {
                    for(var p in models)
                    {
                        data[p] = models[p];
                    }
                }else
                {
                    this._models.forEach(function(model:Model)
                    {
                        data[model.name()] = model.toObject();
                    });
                    this._collections.forEach(function(collection:Collection<any>)
                    {
                        data[collection.name()] = collection.toObject();
                    });
                }
                data.trans = ghost.browser.i18n.Polyglot.instance().t.bind(ghost.browser.i18n.Polyglot.instance());
                var binded:any = this.getBindedFunctions();
                for(var p in binded)
                {
                    data[p] = binded[p];
                }
                //not sure
               for(var p in binded)
                {
                     this.options[p] = binded[p];
                }
                this.options.data = data;

                this.options.el = container;

               
                /*if(listener)
                {
                    for(var p in listener)
                    {
                          this.options[p] = listener[p];
                    }
              
                }*/
                //console.warn("Ractive options", this.options);

                this.template = new Ractive(this.options);

                 var listener:any = this.getBindedEventListeners();
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

        /**
         * Template's name
         * @returns {string}
         */
        public getTemplate():string
        {
            return null;
        }
        public getContainer():any
        {
            if(this.$container && this.$container.length)
            {
                return this.$container.get(0);
            }
            console.log("get container",this._controller.name(), this.name());
            var $scope = $("[data-scope='"+this._controller.scoping()+"']");
            if($scope.length)
            {
                var $child = $scope.children("[data-name='"+this._controller.name()+"']");
                if($child.length)
                {
                    var $container = $child.find("[data-view='"+this.name()+"']");
                    if($container.length)
                    {
                        this.$container = $container;
                        return $container.get(0);
                    }
                    console.warn("no container found for "+this.name()+" global scope container used", this);
                    return $child.get(0);
                }
            }
        }
        /**
         * Initial data to set to the template
         * @return {any} [description]
         */
        protected getInitialData():any
        {
            return {};
        }  
        /**
         * List of functions to bind key/function
         * @return {any} [description]
         */
        protected getBindedFunctions():any
        {
            return null;
        }
        /**
         * List of functions to bind key/function as event listener
         * @return {any} [description]
         */
        protected getBindedEventListeners():any
        {
            return null;
        }
         /**
         * List of models/collections to bind to the template
         * @return {any} [description]
         */
        protected getBindedModels():any
        {
            return null;
        }
         /**
         * Gets Model
         * @param  {string} name Model's name or Model's classname
         * @return {Model}        Model
         */
        public getModel(name:string):Model
        /**
         * Gets Model
         * @param  {number} index Model's index
         * @return {Model}        Model
         */
        public getModel(index:number):Model
        public getModel(value:any):Model
        {
            if(typeof value == "string")
            {
                for(var p in this._models)
                {
                    if(this._models[p].name() == value || this._models[p].getClassName() == value)
                    {
                        return this._models[p];
                    }
                }
            }
            else
            {
                return this._models[value];
            }
        }
         /**
         * Gets Collection
         * @param  {string} name Collection's name or Collection's classname
         * @return {Model}        Collection
         */
        public getCollection(name:string):Collection<any>;
        /**
         * Gets Collection
         * @param  {number} index Collection's index
         * @return {Model}        Collection
         */
        public getCollection(index:number):Collection<any>;
        public getCollection(value:any):Collection<any>
        {
            if(typeof value == "string")
            {
                for(var p in this._collections)
                {
                    if(this._collections[p].name() == value || this._collections[p].getClassName() == value)
                    {
                        return this._collections[p];
                    }
                }
            }
            else
            {
                return this._collections[value];
            }
        }
        public addModels(models:Model[]):void
        {

            ///TODO:temp
            for(var p in this._models)
            {
                this.addModel(this._models[p]);
            }
        }
        public addModel(model:Model):void
        {
            if(this._models.indexOf(model) == -1)
            {
                this._models.push(model);
                model.on(Model.EVENT_CHANGED, this._onModelChange, this, model);
            }
        }
        public removeModel(model:Model):void
        {
            var index:number;
            if((index = this._models.indexOf(model))!=-1)
            {
                this._models.splice(index, 1);
                model.off(Model.EVENT_CHANGED, this._onModelChange, this);
            }
        }
        public addCollection(collection:Collection<any>):void
        {
            if(this._collections.indexOf(collection) == -1)
            {
                this._collections.push(collection);
                collection.on(Collection.EVENT_CHANGED, this._onCollectionChange, this, collection);
            }
        }
        protected _onCollectionChange(model:Model[], collection:Collection<any> )
        {
          //  console.log("Collection changed", collection, arguments);
            if(this.template)
            {
                this.template.set(collection.name(), collection.toObject());
            }
        }
        protected _onModelChange(keys:string[], model:Model):void
        {
         //   console.log("Model changed", model, arguments);
            if(this.template)
            {
                this.template.set(model.name(), model.toObject()); 
            }
        }
        public _preactivate():void
        {
            this.activate();
            if(this.first)
            {
                this.first = false;
                this.firstActivate();
            }
        }
        public _predisactivate():void
        {
            if(this.template)
            {
                var listener:any = this.getBindedEventListeners();
                if(listener)
                {
                    for(var p in listener)
                    {
                        this.template.off(p, listener[p]);
                        
                    }
                }
            }
            this.disactivate();
        }
        public firstActivate():void
        {
            
        }
        public activate():void
        {
            //to override
            this.render();
        }

        public disactivate():void
        {
            //to override

        }
        protected getRootURL():string
        {
            return ghost.browser.mvc.Application.getRootURL();
        }

    }
}
