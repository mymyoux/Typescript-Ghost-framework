//convert
 /* ghost.browser.i18n.Polyglot;*/
import {Polyglot} from "browser/i18n/Polyglot";
//convert
 /* ghost.browser.mvc.Template.*/
import {Template} from "browser/mvc/Template";
//convert
 /* ghost.browser.data.LocalForage */
import {LocalForage} from "browser/data/Forage";
//convert
 /* ghost.core.CoreObject
*/
import {CoreObject} from "ghost/core/CoreObject";
//convert
 /*(ghost.utils.Arrays.*/
import {Arrays} from "ghost/utils/Arrays";

///<module="ghost/core"/>
///<module="browser/navigation"/>
///<module="browser/i18n"/>
///<module="api"/>
//convert-files
import {Controller} from "./Controller";

    
    //convert-import
import {Navigation} from "browser/navigation/Navigation";
    //convert-import
import {APIExtended} from "browser/api/APIExtended";
    export class Application extends CoreObject
    {
        public user: any; 
        protected static _instance: Application;
        protected _navigation:Navigation;
        protected steps: string[] = ["preinit", "initUser", "init", "handleCache", "postinit", "ready"];
        protected step: number = -1;
        public static getRootURL():string
        {
            return Application._instance.getRootURL();
        }
        public static instance():Application
        {
            return Application._instance;
        }
        public getRootURL(): string   
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
        public war(): LocalForage { 
            return LocalForage.instance().warehouse("global").war(this.getUserID());
        }
        /**
         * Handle cache for the all application
         * Delete the cache if id_user has changed
         * Relaunch unsucessful requests
         */
        protected handleCache():boolean
        {  
            APIExtended.instance().initCache();//init("cache_"+this.getUserID());
            return true;
        }
        protected initUser():any|void
        {
            return null;
        }
        public getPackage():any
        {
            throw new Error("You must override this function to enable a correct usage of MVC system")
        }
        protected prerequire(callback?:Function):void
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
            return Polyglot;
        }
        public preinit():void
        {
            var pckg:any = this.getPackage();
            if (Arrays.isArray(pckg))
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
            var url:string;
            for(var p in defaultPages){
                if(!url)
                {
                    url = "#!";
                }else
                {
                    url+="+";
                }
                url+= p+"/"+defaultPages[p];
            }
            this.navigation().listen(); 
            window.location.href = url;

            Template.sync();
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
        protected navigation():Navigation
        {
            if(!this._navigation)
            { 
                this._navigation = Navigation.instance?Navigation.instance:new Navigation(false);
            }
            return this._navigation;
        }

    }
