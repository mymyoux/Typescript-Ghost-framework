///<file="Controller.ts"/>

///<lib="jquery"/>
///<module="browser/navigation"/>
namespace ghost.mvc
{
    /**
     * Controller with views
     */
    export class ControllerView extends Controller
    {
        /**
         * List of events
         * @type {{ACTIVATED: (ACTIVATED), DISACTIVATED: (DISACTIVATED)}}
         */
        public static EVENTS:any = Controller.EVENTS;/*
        {
            ACTIVATED:Controller.EVENTS.ACTIVATED,
            DISACTIVATED:Controller.EVENTS.DISACTIVATED
        };*/
        /**
         * List of views
         */
        public _views:View[];
        /**
         * Controller is initialzed
         * @type {boolean}
         * @private
         */
        private _initialized:boolean = false;
        /**
         * Used internally, after first activation, this boolean is set to false
         * @type {boolean}
         * @private
         */
        private _first:boolean = true;
        /**
         * Controller is currently in intializing state (some HTTP calls can be pending (template+data)
         * @type {boolean}
         * @private
         */
        private _initializing:boolean = false;
        /**
         * Controller is currently activated
         * @type {boolean}
         * @private
         */
        private _activated:boolean = false;

        /**
         * Constructor
         */
        constructor()
        {
            super();
            this._views = [];
        }

        /**
         * Called when application is paused (mobile + maybe tab lost focus?)
         */
        public pause():void
        {

        }
        /**
         * Called when application is resumed (mobile)
         */
        public resume():void
        {

        }

        /**
         * Called when the controller is asked for activation
         * @protected
         */
        public _preactivate():void
        {
            this._activated = true;
            this.initialize(()=>
            {
                //TODO:initializeModel après setModels sinon ça a pas de sens

                var first:boolean = this._first;
                if(this._first)
                {
                    this._setModels();
                    this._setCollections();
                    this._first = false;
                }
                if(!this._activated)
                {
                    //end: get disactivated before
                    return;
                }
                this.initializeModels(()=>
                {
                    //TODO:maybe load data after view to have a preload effect => put this into the first if(this._first)
                    if(first)
                    {
                        this.ready();
                        this.postReady();
                    }
                    this.activate();
                    this.trigger(ControllerView.EVENTS.ACTIVATED);
                    ghost.events.Eventer.on(ghost.events.Eventer.APPLICATION_RESUME, this.resume, this);
                    ghost.events.Eventer.on(ghost.events.Eventer.APPLICATION_PAUSE, this.pause, this);

                    var len:number = this._views.length;
                    for(var i:number=0; i<len; i++)
                    {
                        this._views[i]._preactivate();
                    }

                    this.showContainer();

                });

            });
        }
        /**
         * Called when the controller is asked for disactivation
         * @protected
         */
        public _predisactivate():void
        {
            if(this._activated && this._initialized)
            {
                ghost.events.Eventer.off(ghost.events.Eventer.APPLICATION_RESUME, this.resume, this);
                ghost.events.Eventer.off(ghost.events.Eventer.APPLICATION_PAUSE, this.pause, this);
                this.disactivate();
                this.trigger(ControllerView.EVENTS.DISACTIVATED);
                this.hideContainer();
                for(var p in this._views)
                {
                    this._views[p].disactivate();
                }
            }
            this._activated = false;
        }

        /**
         * Called on the first activation. Async
         * @param callback
         * @param times private params
         */
        private initialize(callback:Function, times:number = 0):void
        {
            //first call => initialize
            if(!this._initialized)
            {
                if(!this._initializing)
                {
                    this._initializing = true;
                    /*
                    this._views.forEach(function(view:View)
                    {

                    }, this);*/
                    this.initializeViews(()=>
                    {
                        this.initialized();
                        if(callback)
                        {
                            callback();
                        };
                    });


                    

                        /*
                    var url:string = this.getRootViewURL()+this.getViewURL();
                    if(!url)
                    {
                        this.initialized();
                    }else
                    {
                        $.ajax(url,
                        {
                            type:"GET"
                        }
                        ).done((result:any)=> {

                            this.initializeContainer(result);
                            this.initialized();


                            if(callback)
                            {
                                callback();
                            };

                        })
                        .fail((error)=> {
                            if(error.status == 404)
                            {
                                console.error("Template: "+url+" not found");
                            }else
                            {
                                console.error("Error initializing template", error)
                            }
                            setTimeout(()=>
                            {
                                this._initializing = false;
                                this.initialize(callback, times);
                            },( error.status==500?(times++):1)*500);
                        });
                    }*/
                }
            }else
            {
                if(callback)
                {
                    callback();
                };

            }
        }

        /**
         * Called right after #initialize()
         */
        private initialized():void
        {
            this._initialized = true;
            this._initializing = false;
            this.bind();
        }

        /**
         * Initialize Models AND collections
         * @param callback
         */
        private initializeModels(callback:Function):void
        {

            if(!this._models.length && !this._collections.length)
            {
                if(callback)
                    callback();
                return;
            }
            var models:IRetrievable[] = this._models.concat(<any[]>this._collections).filter(function(model:IRetrievable):boolean
            {
                return !model.isRetrieved();
            });

            var count:number = models.length;
            if(count == 0)
            {
                // no model to set up
                if(callback)
                {
                    callback();
                }
            }else
            {

                models.forEach(function(model:IRetrievable)
                {
                    model.retrieveFromServer(function():void
                    {
                        count--;
                        if(count == 0)
                        {
//                            console.log("ALL MODEL DONE");
                            if(callback)
                            {
                                callback();
                            }
                        }
                    });
                });
                //petite verif
                setTimeout(function()
                {
                    if(count)
                    {
                        console.error("Count not going to 0 : "+count);
                        debugger;
                    }
                },5000);
            }

        }

        /**
         * First part of View URL. see #getViewURL()
         * @returns {string}
         */
        public getRootViewURL():string
        {
            return "";
        }
        /**
         * URL of template to load before views loading. If null no URL will be loaded
         * @returns {string}
         */
        public getViewURL():string
        {
            return "views/"+this.scoping()+"/"+this.name();
        }

        /**
         * When a template is loaded, it will prepare HTML integration
         * @param result
         */
        private initializeContainer(result:any):void
        {
            var $html = $(result);
            $html.attr("id", this.scoping()+"_"+this.name());
            $("[data-scope='"+this.scoping()+"']").append($html);
        }

        /**
         * Show the controller's template
         */
        private showContainer():void
        {
            $("#"+this.scoping()+"_"+this.name()+"").show();
        }

        /**
         * Hide the controller's template
         */
        private hideContainer():void
        {
            $("#"+this.scoping()+"_"+this.name()+"").hide();
        }

        /**
         * Prepare View(Class)
         */
        private initializeViews(callback?:Function):void
        {
            var views:any[] = this.getInitialViews();
            if(views && views.length>0)
            {
                var count:number = views.length;
                views.map(function(view:any):View
                {
                    return view instanceof View?view:new view();
                }).forEach(function(view:View):void
                {
                    this.addView(view, function()
                    {
                        count--;
                        if(!count)
                        {
                            //all views initialized
                            if(callback)
                            {
                                callback();
                            }
                        }
                    });
                }, this);
                setTimeout(function()
                {
                    if(count)
                        console.warn("Some views["+count+"] are not loaded", this, views);
                },5000);
            }else
            {
                console.warn("No view for",this);
                if(callback)
                {
                    callback();
                }
            }
        }
        public getScope():ghost.browser.navigation.NavigationScope
        {
            return ghost.browser.navigation.Navigation.instance.getScope(this.scoping());
        }
        /**
         * Adds view to the controller
         * @param {View}     view     [description]
         * @param {Function} callback [description]
         */
        public addView(view:View, callback?:Function):void
        {
            this._views.push(view);
            view.setController(this);
            view.addModels(this._models);
            view.initialize(callback);
        }
        /**
         * Gets View
         * @param  {string} name View's name or View's classname
         * @return {View}        View
         */
        public getView(name:string):View
        /**
         * Gets View
         * @param  {number} index View's index
         * @return {View}        View
         */
        public getView(index:number):View
        public getView(value:any):View
        {
            if(typeof value == "string")
            {
                for(var p in this._views)
                {
                    if(this._views[p].name() == value || this._views[p].getClassName() == value)
                    {
                        return this._views[p];
                    }
                }
            }
            else
            {
                return this._views[value];
            }
        }
        /**
         * Adds model to the controller
         * @param model Model
         */
        public addModel(model:Model):void
        {
            super.addModel(model);
            var len:number = this._views.length;
            for(var i:number =0 ; i<len; i++)
            {
                this._views[i].addModel(model);
            }
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
         * Adds collection to the controller
         * @param collection Collection
         */
        public addCollection(collection:Collection<any>):void
        {
            super.addCollection(collection);
            var len:number = this._views.length;
            for(var i:number =0 ; i<len; i++)
            {
                this._views[i].addCollection(collection);
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
        public getCollection(value:Function):Collection<any>
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
            if(typeof value == "function")
            {
                for(var p in this._collections)
                {
                    if(this._collections[p] instanceof value)
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
        public bind():void
        {
            this.bindEvents();
        }
        public bindEvents():void
        {
        }
        protected getInitialViews():any[]
        {
            return null;
        }
        protected getInitialModels():any[]
        {
            return null;
        }
        protected getInitialCollections():any[]
        {
            return null;
        }
        private _setModels():void
        {
            var models:any[] = this.getInitialModels();
            if(models)
            {
                models = models.map(function(model:any):Model
                {
                    return model instanceof Model?model: Model.get(model);
                });
                models.forEach(this.addModel, this);
            }
            this.setModels();
        }
        protected setModels():void
        {

        }
        private _setCollections():void
        {
            var collections:any[] = this.getInitialCollections();
            if(collections)
            {
                collections = collections.map(function(collection:any):Collection<any>
                {
                    return collection instanceof Collection?collection: Collection.get(collection);
                });
                collections.forEach(this.addCollection, this);
            }
            this.setCollections();
        }
        protected setCollections():void
        {

        }
        public ready():void
        {

        }
        public postReady():void
        {
            var len:number = this._views.length;
            for(var i:number =0 ; i<len; i++)
            {
                this._views[i].ready();
            }
        }
        public activate():void
        {
            super.activate();
        }
        protected getRootURL():string
        {
            return ghost.mvc.Application.getRootURL();
        }
    }
}
