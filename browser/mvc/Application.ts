
///<module="ghost/core"/>
///<module="browser/navigation"/>
///<module="browser/i18n"/>
///<file="Controller.ts"/>
module ghost.mvc
{
    export class Application extends ghost.core.CoreObject
    {
        protected _navigation:ghost.browser.navigation.Navigation;
        public constructor()
        {
            super();
            //initialization navigation for scope support
           
            this.prerequire(()=>
            {
               this._init();
            });
        }
        private _init():void
        {
                 this.navigation();
                this.preinit();
                this.init();
                this.postinit();
                this.ready();
                
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
            if(pckg)
                Controller.addPackage(pckg);
        }
        public postinit():void
        {
            var defaultPages:any = this.getDefaultPages();
            if(defaultPages)
            {
                this.navigation().setDefaultPages(defaultPages);
            }
            this.navigation().listen();

            ghost.mvc.Template.sync();


        }
        public getDefaultPages():any
        {
            return null;
        }

        public init():void
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