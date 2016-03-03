
///<module="ghost/core"/>
///<module="browser/navigation"/>
///<module="browser/i18n"/>
///<module="api"/>
///<file="Controller.ts"/>
namespace ghost.mvc
{
    import APIExtended = ghost.browser.api.APIExtended;
    export class Application extends ghost.core.CoreObject
    {
        protected static _instance: Application;
        protected _navigation:ghost.browser.navigation.Navigation;
        protected steps: string[] = ["preinit", "initUser", "init", "handleCache", "postinit", "ready"];
        protected step: number = -1;
        public static getRootURL():string
        {
            return Application._instance.getRootURL();
        }
        protected getRootURL(): string   
        {
                var pathname: string = window.location.pathname;
                var index: number = pathname.indexOf("/", 1);
                if (index > -1) {
                    pathname = pathname.substring(0, index);
                }
                return window.location.protocol + "//" + window.location.host + (pathname.length > 1 ? pathname + "/" : pathname);
        }
        public constructor()
        {
            super();
            Application._instance = this;
            //initialization navigation for scope support
            this.prerequire(()=>
            {
               this._init();
            });
        }
        protected getUserID():any
        {
            throw new Error("you must override this method");
            return null;
        }
        private _init():void
        {
                 this.navigation();
                 this.nextStep();
        }
        protected nextStep():void
        {
            this.step++;
            var step: string = this.steps[this.step];
            if(step)
            {
                if (this[step])
                    console.log("step:" + step);
                var result: any = this[step]?this[step]():null;
                if(!result || !result.then)
                {
                    return this.nextStep();
                }else
                {
                    result.then(() => {
                        this.nextStep();
                    }, ()=> {
                        debugger;
                        this.nextStep();
                    });
                }
            }
        }
        public war(): ghost.browser.data.LocalForage {
            return ghost.forage.warehouse("global").war(this.getUserID());
        }
        /**
         * Handle cache for the all application
         * Delete the cache if id_user has changed
         * Relaunch unsucessful requests
         */
        protected handleCache():boolean
        {
            APIExtended.init("cache_"+this.getUserID());
            return true;
            /*var promise:Promise<any> = new Promise<any>((resolve:any, reject:any):void=>
            {
                this.war().getItem("id_user").then((id_user: any) => {
                    if(id_user == undefined || id_user == this.getUserID())
                    {
                        if(id_user == undefined)
                        {
                            this.war().setItem("id_user", this.getUserID()).then(() => {
                                APIExtended.init(this.war().name());
                                resolve();

                            }, () => {
                                debugger;
                                APIExtended.init(this.war().name());
                                resolve();
                            });
                            return;
                        }
                        //normal no reset
                        APIExtended.init(this.war().name());

                        resolve();
                    }else
                    {
                        //new id_user 
                        APIExtended.clearCache().then(() => {
                            this.war().setItem("id_user", this.getUserID()).then(() =>
                            {
                                APIExtended.init(this.war().name());
                                resolve();
                                
                            }, ()=>
                            {
                                debugger;
                                APIExtended.init(this.war().name());
                                resolve();
                            });

                        }, () => {
                            debugger;
                            APIExtended.init(this.war().name());
                            resolve();
                        });
                    }
                }, 
                () => {
                    debugger;
                    APIExtended.init(this.war().name());
                    resolve();
                });
      
            });
            return promise;*/
        }
        protected initUser():any|void
        {
            return null;
        }
        public getPackage():any
        {
            throw new Error("You must override this function to enable a correct usage of MVC system")
            return null;
        }
        private prerequire(callback?:Function):void
        {
            //initialize
            var cls:any = this.polyglot();
            new cls();
            if(callback)
            {
                callback();
            }
        }
        protected polyglot():any
        {
            return ghost.browser.i18n.Polyglot;
        }
        public preinit():void
        {
            var pckg:any = this.getPackage();
            if (ghost.utils.Arrays.isArray(pckg))
            {
                for(var p in pckg)
                {
                    Controller.addPackage(pckg[p]);
                }
            }else
            if(pckg)
                Controller.addPackage(pckg);
        }
        public postinit():any|void
        {
            var defaultPages:any = this.getDefaultPages();
            if(defaultPages)
            {
                this.navigation().setDefaultPages(defaultPages);
            }
            this.navigation().listen();

            ghost.mvc.Template.sync();
            return null;

        }
        public getDefaultPages():any
        {
            return null;
        }

        public init():any
        {

        }
        protected ready():void
        {
            //to override
        }
        protected navigation():ghost.browser.navigation.Navigation
        {
            if(!this._navigation)
            {
                this._navigation = new ghost.browser.navigation.Navigation(false);
            }
            return this._navigation;
        }

    }
}
