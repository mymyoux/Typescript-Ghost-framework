///<module="ghost/events"/>
///<module="ghost/browser/debug"/>
///<file="Controller.ts"/>
module ghost.mvc
{
    /**
     * Scope
     */
    export class Scope extends ghost.events.EventDispatcher
    {
        /**
         * Current controller (activated)
         */
        private _currentController:Controller;
        /**
         * Scope's name
         */
        private _name:string;
        /**
         * constructor
         * @param name Scope's name
         */
        constructor(name:string)
        {
            super();
            log.hide();
            this._name = name;
            Scope._names.push(name);
            Scope._scopes.push(this);
                if(this._name && Scope.navigation())
                {
                   // ghost.events.Eventer.trigger(Navigation.EVENT_PAGE_CHANGED+":"+this._key, type, previous, next);
                   // ghost.events.Eventer.on(Scope.navigation().EVENT_PAGE_CHANGED, this._onPageChanged, this);
                    //better than using Eventer
                    Scope.navigation().getScope(this._name).on(Scope.navigation().EVENT_PAGE_CHANGED, this._onPageChanged, this);


                    var scope:any = Scope.navigation().getScope(this._name);
                    if(scope)
                    {
                        var page:string = scope.getCurrentPage();
                        if(page)
                        {
                            this._onPageChanged(page, Scope.navigation().EVENT_PAGE_CHANGED,null, page);
                        }
                        scope.on("to", function(/*event_next:string,*/ type:string, previous:string, next:string, event:ghost.browser.navigation.NavigationEvent):void
                        {
                            this.onPageChanging(type, previous, next, event);
                        },this);
                    }
                }
                log.info("New Scope : "+name);
            
        }
        private _onPageChanged(type:string, previous:string, next:string, params:any = null):void
        {
             log.info(name+" - page changed : "+this._name+" |"+type+" => " +previous+"=>"+next);
           /* if(name == this._name)
            {*/
                this.removeCurrentController();
                if(next)
                {

                    
                    var controller:Controller = Controller.getController(next);
                    if(controller)
                    {
                    log.warn("Loading : "+next);
                        this.setCurrentController(controller, params);
                    }
                }
           // }
        }

        /**
         * To override to change behaviour during a page change.
         * TODO:allow Scope's class to be set
         * @param type Event's type
         * @param previous Previous' page
         * @param next Next's page
         * @param event NavigationEvent - cancelable
         */
        protected onPageChanging(type:string, previous:string, next:string, event:ghost.browser.navigation.NavigationEvent):void
        {
            var controller:Controller = Controller.getController(next);
            if(controller)
            {
                var canActivate:string|boolean = controller.canActivate(event.params);
                if(canActivate === true)
                {
                    return;
                }
                //forbidden
                if(!canActivate)
                {
                    event.cancel();
                }else
                {
                    //forbidden + forward
                   // event.cancel();
                    if(Scope.navigation().getScope(this._name).getPage(-1) == canActivate)
                    {
                        event.cancel();
                    }else
                    {
                        setTimeout(()=>
                        {
                            Scope.navigation().getScope(this._name).pushPage(canActivate);
                        },0);
                    }
                }

            }
        }
        /**
         * Sets current controller of the scope.
         * Disactives others
         * @param name controller's name or controller instance or controller class
         * @return Controller
         */
        public setCurrentController(name:string, params?:any):Controller;
        public setCurrentController(controller:Controller, params?:any):Controller;
        public setCurrentController(controller:any, params?:any):Controller;
        public setCurrentController(controller:any, params?:any):Controller
        {


            if(typeof controller == "string")
            {
                controller = Controller.getController(controller);
            }else
            {
                if(typeof controller == "function")
                {
                    controller = Controller.getController(controller);
                }
            }
            if(!controller)
            {
                throw new Error("Controller "+controller+" not found");
            }
            else
            if(controller.scoping() != this._name && !(this._name == "" && controller.scoping()==null))
            {
                throw new Error("Controller "+controller.getClassName()+" - scope doesn't match : "+controller.scoping()+" instead of "+this._name);
            }

            if(controller.canActivate(params)===true)
            {
                log.info("Activating:");
                log.warn(controller);
                this.removeCurrentController();
                this._currentController = controller;
                this._currentController.scope(this);
                this._currentController._preactivate(params);
            }

            return this._currentController;
        }
        /**
         * Removes current controller (disactives it)
         */
        public removeCurrentController():void
        {
            log.info("remove current controller");
            if(this._currentController != null)
            {
                this._currentController._predisactivate();
                this._currentController.unscope();
                this._currentController = null;
            }
        }
        /**
         * Gets current controller
         */
        public getCurrentController():Controller
        {
            return this._currentController;
        }
        /**
         * Gets controller linked to the scope.
         * Disactives others
         * @param name controller's name or controller instance or controller class
         */
        public getController(name:string):Controller;
        public getController(controller:Controller):Controller;
        public getController(controller:any):Controller;
        public getController(controller:any):Controller
        {
            var sController:Controller = Controller.getController(controller);
            if(!sController)
            {
                throw new Error("Controller "+sController+" not found");
            }
            else
            if(sController.scoping() != this._name && !(this._name == "" && sController.scoping()==null))
            {
                throw new Error("Controller "+sController+" - scope doesn't match : "+sController.scoping()+" instead of "+this._name);
            }
            return sController;
        }
        /**
         * Tests controller linked to the scope.
         * @param name controller's name or controller instance or controller class
         */
        public hasController(name:string):boolean;
        public hasController(controller:Controller):boolean;
        public hasController(controller:any):boolean
        {
            var sController:Controller = Controller.getController(controller);
            if(!sController)
            {
                return false;
            }
            return sController.scoping() == this._name;
        }
        private static _navigation:any = undefined;
        /**
         * Array of Scopes 
         */
        private static _scopes:Scope[] = [];
        /**
         * Array of scope's name
         */
        private static _names:string[] = [];
        /**
         * Get scope by name. Create if it doesn't exist.
         * @param name controller's name or controller instance or controller class
         * @return Scope
         */
        public static getScope(name:string = ""):Scope
        {
            var index:number;
            if((index = Scope._names.indexOf(name))==-1)
            {
                index = Scope._names.length;
                if(name == "")
                {
                    new Unscope();
                }else
                {
                    new Scope(name);
                }
                    
            }
            return Scope._scopes[index];
        }
        /**
         * Gets global unamed scope
         * @return unscope
         */
        public static getGlobalScope():Unscope
        {
            return <Unscope>this.getScope();
        }
        /**
         * Tests if the scope exists
         * @param name scope's name
         * @return boolean
         */
        public static hasScope(name:string):boolean
        {
            return Scope._names.indexOf(name)!=-1;
        }
        public static navigation():any
        {
            if(Scope._navigation === undefined)
            {
                Scope._navigation = ghost.utils.Classes.get("ghost.browser.navigation.Navigation").instance;
            }
            return Scope._navigation;
        }
    }
    
    /**
     * Un-Scope. Scope without name.
     */
    export class Unscope extends Scope
    {
        /**
         * constructor
         */
        constructor()
        {
            super("");
        }
        /**
         * Sets current controller
         * @param name controller's name or controller instance or controller class
         */
        public setCurrentController(name:string):Controller;
        public setCurrentController(controller:Controller):Controller;
        public setCurrentController(controller:any):Controller
        {
            return this.addController(controller);
        }
        /**
         * Adds controller to the scope
         * @param name controller's name or controller instance or controller class
         */
        public addController(name:string):Controller;
        public addController(controller:Controller):Controller;
        public addController(controller:Function):Controller;
        public addController(controller:any):Controller;
        public addController(controller:any):Controller
        {
            var sController:Controller;
            if(typeof controller == "string")
            {
                sController = Controller.getController(controller);
            }else
            {
                if(typeof controller == "function")
                {
                    sController = Controller.getController(controller);
                }
            }
            sController._preactivate();
            return sController;
        }
    }
}