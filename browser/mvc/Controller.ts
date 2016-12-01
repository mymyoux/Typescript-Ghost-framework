///<module="ghost/events"/>
///<module="browser/data"/>

///<file="Model.ts"/>
///<file="Collection.ts"/>
///<file="Router.ts"/>
namespace ghost.mvc
{
  import Objects = ghost.utils.Objects; 
    /**
     * Controller
     */
    export class Controller extends ghost.events.EventDispatcher
    {
        public static EVENTS:any =
        {
            ACTIVATED:"acivated",
            DISACTIVATED:"disactivated"
        };
        /**
         * Controller shortname
         */
        private _name:string;
        /**
         * Scope
         */
        protected _scope:Scope;

        /**
         * @protected
         * Models
         */
        public _models:Model[];
        /**
         * Collections
         */
        public _collections:Collection<any>[];
        /**
         * Constructor
         */
        constructor()
        {
            super();
            this._models = [];
            this._collections = [];
            this.scope(Scope.getScope(this.scoping()));
            this.init();
        }
        protected init():void
        {

        }
        /**
         * Links the scope
         * @param scope Scope
         */
        public scope(scope:Scope = null):Scope
        {
            if(scope)
            {
                this._scope = scope;
            }
            return this._scope;
        }
        /**
         * Unlinks scope
         */
        public unscope():void
        {
            this._scope = null;
        }
        /**
         * Scope-linking.
         */
        public scoping():string
        {
            return "main";
        }
        /**
         * Adds model to the controller
         * @param model Model
         */
        public addModel(model:Model):void
        {
            this._models.push(model);
        }
        /**
         * Adds collection to the controller
         * @param collection Collection
         */
        public addCollection(collection:Collection<any>):void
        {
            this._collections.push(collection);
        }
        /**
         * called by scope
         */
        public _preactivate(params?:any):void
        {
            this.activate();
            this.trigger(Controller.EVENTS.ACTIVATED);
        }
        public canActivate(params?:any):any
        {
            return true;
        }
        /**
         * Actives the controller (if inside a named scope will disactivate current scope controller)
         */
        public activate():void
        {

        }
        public name():string
        {
            if(!this._name)
            {
                this._name = this.getClassName().replace(/controller/ig,"").toLowerCase();
            }
            return this._name;
        }
        public getRoutes(): IRoute[] {
          var route: string | IRoute = this.routing();
          if (route) {
            if (typeof route == "string") {
              route = { route: route, type: Router.TYPE_STATIC };
            }
            if (!route.scope) {
              var scopes: any = this.scoping();
              if (!scopes || !scopes.length) {
                scopes = "main";
              }
              if (typeof scopes == "string") {
                route.scope = scopes;
              } else {
                //array of scope
                var routes: IRoute[] = [];
                route.scope = scopes[0];
                routes.push(route);
                for (var i = 1; i < scopes.length; i++) {
                  route = Objects.clone(route);
                  (<IRoute>route).scope = scopes[i];
                  routes.push(<IRoute>route);
                }
                return routes;
              }
            }
            return [route];
          }
          var scopes: any = this.scoping();
          route = <IRoute>{
            type: Router.TYPE_STATIC,
            route: null
          };
          if (!scopes || !scopes.length) {
            scopes = "main";
          }
          if (typeof scopes == "string") {
            route.scope = scopes;
            route.route = scopes + "/" + this.name();
          } else {
            //array of scope
            var routes: IRoute[] = [];
            route.scope = scopes[0];
            route.route = scopes[0] + "/" + this.name();
            routes.push(route);
            for (var i = 1; i < scopes.length; i++) {
              route = Objects.clone(route);
              (<IRoute>route).scope = scopes[i];
              (<IRoute>route).route = scopes[i] + "/" + this.name();
              routes.push(<IRoute>route);
            }
            return routes;
          }
          return [route];
        }
        public routing(): string | IRoute {
          return this.scoping() + "/" + this.name();
        }
        public _predisactivate():void
        {
            this.disactivate();
            this.trigger(Controller.EVENTS.DISACTIVATED);
        }
        /**
         * Disactivates the controller
         */
        public disactivate():void
        {

        }
        public isReloadingControllerOnHashChange() : boolean
        {
            return true;
        }
        /**
         * Exists only to check controller type during init
         */
        private __isController():boolean
        {
            return true;
        }

        ///---- STATIC PART ----///
        /**
         * Controller's classes
         */
        private static _sControllerClass:any[] = [];
        /**
         * Controller's instances
         */
        private static _sControllerInstance:Controller[] = [];
        /**
         * Lists of controller short's names
         */
        private static _sShortname:string[] = [];
        /**
         * Lists of controllers conflict's short's names
         */
        private static _sConflictsShortnames:string[] = [];
        /**
         * List of controller's fullnames
         */
        private static _sFullname:string[] = [];
        protected static onRouteMatch(index:number, route:IRoute, url:string):boolean|string|Scope
        {
          //check if instance already exists
          if (!Controller._sControllerInstance[index])
          {
              Controller._sControllerInstance[index] = new (Controller._sControllerClass[index]);
          }
          var controller: Controller = Controller._sControllerInstance[index];
          var canActivate:any = controller.canActivate(route);
          if(canActivate === false || typeof canActivate == "string")
          {
              return canActivate;
          }
          var scope: Scope = Scope.getScope(route.scope);
          scope.setCurrentController(controller, route.params);
          console.log("on route match", index, route, url);
          return scope;
        }
        /**
         * Adds package to parse
         * @param packg Package's name or package's class
         * @param fullname package's fullname
         */
        public static addPackage(packg:any, autoloadScopes:boolean = true, fullname:string = null):void
        {
            if(typeof packg == "string")
            {
                fullname = packg;
                packg = eval(packg);
            }
            for(var p in packg)
            {
                if(/*p.indexOf("Controller") != -1 ||*/ (packg[p] && packg[p].prototype && packg[p].prototype.__isController))
                {
                  if (autoloadScopes) {
                    if (packg[p].prototype.scoping) {
                      //create scopes - enable linking to navigationscope immediatly without instanciate any controller
                      Scope.getScope(packg[p].prototype.scoping());
                    }
                  }
                  var id: number = Controller._sControllerClass.length;
                 Controller._sControllerClass.push(packg[p]);
                  Controller._sControllerInstance.push(null);
                  if(Router.hasInstance())
                  {
                     var routes: any[] = packg[p].prototype.getRoutes();
                     for(var route of routes)
                     {
                       Router.instance().register(route, Controller.onRouteMatch.bind(null, id));
                     }
                  }
                  if(true){
                  
                      Controller._sFullname.push(fullname+"."+p);
                     
                      var name:string = (packg[p].prototype.name?packg[p].prototype.name.call(packg[p].prototype): p.replace(/controller/ig,"")).toLowerCase();
                      var index:number = Controller._sShortname.indexOf(name);
                      if(index ==-1)
                          Controller._sShortname.push(name);
                      else
                      {
                          log.warn(name+" is used several times as a controller's name");
                          Controller._sShortname.splice(index, 1);
                          Controller._sConflictsShortnames.push(name);
                      }
                  }
                }
                if(typeof packg[p] =="object")
                    Controller.addPackage(packg[p], autoloadScopes, fullname+"."+p);
            }
        }
        /**
         * Gets controller instance. Creates if it doesn't exist
         * @param name controller's name (short or full), controller's instance or controller's class
         * @param Controller's instance
         */
        public static getController(controllerClass:Function):Controller;
        public static getController(name:string):Controller;
        public static getController(controller:any):Controller
        {
            var index:number;
            if(typeof controller == "string")
            {
                var name:string = controller.replace(/controller/ig,"").toLowerCase();
                if((index = Controller._sShortname.indexOf(name))==-1)
                {
                    if((index = Controller._sFullname.indexOf(name))==-1)
                    {
                     /*   function stacktrace() {
                            var err = new Error();
                            return err["stack"];
                        }*/
                        console.warn("No controller found with this name : "+name+" - you must use Controller.addPackage()");
                  //      console.warn(stacktrace());
                        return null;
                    }
                }
            }else
            {
                if((index = Controller._sControllerClass.indexOf(controller))==-1)
                {
                    if((index = Controller._sControllerInstance.indexOf(controller))==-1)
                    {
                        console.warn("No controller registered that correspond to the instance given - you must use Controller.addPackage()", controller);
                        throw new Error();
                        return null;
                    }
                    console.warn("No controller registered that correspond to the class constructor given - you must use Controller.addPackage()");
                    return null;
                }

            }
            if(!Controller._sControllerInstance[index])
            {
                Controller._sControllerInstance[index] = new (Controller._sControllerClass[index]);

            }
            return Controller._sControllerInstance[index];
        }
        /**
         * Gets controller class. Creates if it doesn't exist
         * @param name controller's name (short or full), controller's instance or controller's class
         * @param Controller's class
         */
        public static getControllerClass(controllerClass:Function):any;
        public static getControllerClass(name:string):any;
        public static getControllerClass(controller:any):any
        {
            var index:number;
            if(typeof controller == "string")
            {
                var name:string = controller.replace(/controller/ig,"").toLowerCase();
                if((index = Controller._sShortname.indexOf(name))==-1)
                {
                    if((index = Controller._sFullname.indexOf(name))==-1)
                    {
                        console.warn("No controller found with this name : "+name+" - you must use Controller.addPackage()");
                        return null;
                    }
                }
            }else
            {
                if((index = Controller._sControllerClass.indexOf(controller))==-1)
                {
                    console.warn("No controller registered that correspond to the class constructor given - you must use Controller.addPackage()");
                    return null;
                }

            }
            return Controller._sControllerClass[index];
        }
            //private _data:ghost.data.ServerIO;
            /*public get(action:string, data:any = {}, method:string = "GET", alwaysWin:boolean = true, persistant: boolean = false):ghost.mvc.Response
            {

              return ghost.mvc.ServerIO.getInstance().push(this._name, action, method, data,alwaysWin,persistant );
            }*/
            private _local:ghost.browser.data.Warehouse;
            public local():ghost.browser.data.Warehouse
            {
              if(!this._local)
              {
                  this._local = ghost.cache.warehouse(this.getClassName());
              }
              return this._local;
            }


    }
}
