//convert
 /* ghost.events.EventDispatcher
*/
import {EventDispatcher} from "ghost/events/EventDispatcher";
///<module="events"/>
//convert-files
import {NavigationScope} from "./NavigationScope";
//convert-files
import {NavigationEvent} from "./NavigationEvent";
///<module="debug"/>






///<reference path="typings/globals/socket.io-client/index.d.ts"/>;

///<reference path="typings/globals/node/index.d.ts"/>;
 //   export var Navigation:Navigation;
    /**
     * Global navigation system. Manages navigation history
     * @type {Navigation}
     */
    //convert-import
import {Eventer} from "ghost/events/Eventer";
      export class Navigation extends EventDispatcher
    { 
        /**
         * Events triggered when a page change
         * @type {string}
         */
        public static EVENT_PAGE_CHANGED:string = Eventer.PAGE_CHANGED;
        /**
         * Type of page change : Push
         * @type {string}
         */
        public static PUSH:string = "page_pushed";
        /**
         * Type of page change : Pop
         * @type {string}
         */
        public static POP:string = "page_popped";
        /**
         * Type of page change : Replace
         * @type {string} 
         */
        public static REPLACE:string = "page_replaced";
        /**
         * Events triggered when a page change
         * @type {string}
         */
        public EVENT_PAGE_CHANGED:string = Navigation.EVENT_PAGE_CHANGED;
        /**
         * Type of page change : Push
         * @type {string}
         */
        public PUSH:string = Navigation.PUSH;
        /**
         * Type of page change : Pop
         * @type {string}
         */
        public POP:string = Navigation.POP;
        /**
         * Type of page change : Replace
         * @type {string}
         */
        public REPLACE:string = Navigation.REPLACE;
        /**
         * Default scope name
         * @type {string}
         * @private
         */
        private _DEFAULT_SCOPE:string = null;//"default_scope";
        private static _DISPLAYED_SCOPE:string = "main";//"default_scope";
        /**
         * @private
         */
        private _scopes:any;
        /**
         * Key/value object for default page scope<=>page
         */
        private _defaultsPages:any;
        /**
         * Application's navigation instance
         */
        public static instance:Navigation;
        /**
         * Listening
         * @type {boolean}
         */
        private _listening:boolean = false;
        private _last:string;

        private _currentHash:string;
        protected _converseHash: boolean = false;

        public static SEPARATOR: string = '#!';
        /**
         * Constructor
         * @param ready If true, will be active as soon as possible otherwise will wait for #listen() to be call
         */
        constructor(ready:boolean = true)
        {
            super(); 
            //log.hide();
            if(Navigation.instance)
            {
                //TODO:allow this ?
                throw new Error("There is already an instance of navigation");
            } 
            Navigation.instance = this;
            this._scopes = {};
            if(this.listeningHash())
                Eventer.on(Eventer.HASH_CHANGE, this._onHashChange, this);
            //TODO:not sure
            var _self:Navigation = this;
            if(ready)
            {
                this.listen();
            }
        }
        public listeningHash():boolean
        {
            return true;
        }
        public conserveHash(value: boolean): boolean
        {
            return this._converseHash = value;
        }
        public listen():void 
        {
            Eventer.once(Eventer.$APPLICATION_READY, () =>
            {
                if(!this._listening)
                {
                    this._listening = true;
                    if(this.listeningHash())
                    {
                        this._detectScope();
                        this._onHashChange(true);
                    }
                }
            });
        }
        public static changeHash(hash:string):void
        {
            //log.info("Change hash:"+hash);
            if(hash.split("/")[0] == Navigation._DISPLAYED_SCOPE || hash.split("_")[0] == Navigation._DISPLAYED_SCOPE)
                window.location.hash = this.SEPARATOR + hash;
        }
        private _detectScope():void
        {
            var _self:Navigation = this;
            var hash:any = _self.parseHash();
            $("[data-scope]").each(function()
            {
                var $child = $(this).children("[data-name]");
                var page:string;
                var scope:string = $(this).attr("data-scope");

                if(hash[scope])
                {
                    page = hash[scope].page;
                }
                if(!page)
                {
                    if($child.length == 0)
                    {
                        page = _self.getDefaultPage(scope);
                    }else
                    {
                        page = $child.eq(0).attr("data-name");
                    }
                }
                if(page)
                {
                    _self.pushPage($(this).attr("data-scope"), page, hash[scope]?hash[scope].params:null, true/* hash[scope]?true:false*/);
                }else
                {
                    //log.warn("No child with data-name inside a data-scope element and no default page for scope["+scope+"]");
                    //log.warn(this);
                }
            });
            this._currentHash = this._buildCurrentHash();            
            this.goto( this._currentHash );
        }

        public goto( hash : string ) : void
        {
            window.location.href = window.location.pathname + hash;
        }

        public getHashByPathname( hash : string ) : string
        {
            if (hash.length === 0)
            {
                var pathnames: Array<string> = location.pathname.substr(1).split('/');

                if (pathnames.length >= 3)
                {
                    pathnames.shift(); // delete type
                    pathnames.shift(); // delete /c/
                    hash = pathnames.join('/');
                }
            }

            return hash;
        }

        public parseHash(hashToParse:string = null):any
        {
            if(!hashToParse)
            {
                hashToParse  =window.location.hash.substring(1);
            }
            var hash:any = hashToParse;
            var separator: string = Navigation.SEPARATOR.substring( 1 );

            if (separator && hash.indexOf(separator) === 0)
                hash = hash.substring(separator.length);

            hash = this.getHashByPathname( hash );

            var hashSplit:string[] = hash.split("+");
            var hashes:any = hashSplit.reduce((previous:any, big_hash:string)=>
            {
                var split:string[] = big_hash.split("/");
                var canHaveParam:boolean = true;
                if(split.length == 1)
                {
                    canHaveParam = false;
                    split = big_hash.split("_");
                }
                if(split.length == 0 || split[0] == "")
                {
                    return previous;
                }
                var scope:string, page:string;
                if(split.length == 1)
                {
                    //no _ :
                    if(!this._DEFAULT_SCOPE)
                    {
                        console.log(hash);
                        console.log(hashSplit);
                        console.warn("Uncaught Error: Navigation._DEFAULT_SCOPE not set!");
                        return previous;
                    }
                    scope = this._DEFAULT_SCOPE;
                }else
                {
                    scope = split[0];
                }
                var params:any = null;
                if(canHaveParam)
                {
                    page = split[1];
                    params = split.slice(2);
                }else
                {
                    //NOT SURE
                    page = split.slice(1).join("_");
                }
                previous[scope] = {page:page, params:params};
                return previous;
            }, {});
            return hashes;
        }

        ///pourquoi plusieurs call pour le même hash ?
         private _onHashChange(first:boolean = false):void
        {
            debugger;
            if(window.location.hash == this._currentHash)
            {
                return;
            }
            var hashes:any = this.parseHash();
            var different:boolean = false;
            var len:number;
            var ipage:IPage;
            all:for(var p in hashes)
            {
                if(!this._scopes[p] || !(ipage = this._scopes[p].getCurrentPage()) || ipage.page != hashes[p].page)
                {
                    different = true;
                    break;
                }
                len = hashes[p].params.length;
                if((len && (!ipage.params || ipage.params.length!=len)) || (!len && ipage.params && ipage.params.length))
                {
                    different = true;
                    break;
                }
                for(var q in hashes[p].params)
                {
                    if(ipage.params[q] != hashes[p].params[q])
                    {
                        different = true;
                        break all;
                    }
                }
            }
            if(!different)
            {
                if(!this._currentHash)
                {
                    this._currentHash = this._buildCurrentHash();
                }
                if (this._converseHash)
                {
                    this._currentHash = window.location.hash;
                }

                window.location.hash = this._currentHash;
                return;
            }
            var scope:string, page:string, params:any;
            for(var p in hashes)
            {
                scope = p;
                page = hashes[scope].page;
                params = hashes[scope].params;
                if(scope == Navigation._DISPLAYED_SCOPE)
                {
                    this._last = scope+"/"+page+(params && params.length?"/"+params:"");
                }
                if(first === true)
                {

                    $("#"+scope).attr("first",page);
                    this.pushPage(scope, page, params);
                }else
                {
                    if(page == "back")
                    {

                        this.popPage(scope);
                    }else
                    {
                        this.pushPage(scope, page, params, true);
                    }

                }
                console.log("end boucle", p, hashes);
            }
            this._currentHash = this._buildCurrentHash();
            if (this._converseHash) {
                this._currentHash = window.location.hash;
            }
            window.location.hash = this._currentHash;
            console.log("CURRENT", this._currentHash);
            if(this._last)
            {
               // window.location.hash = "#"+this._last;
            }
            debugger;
        }
        private _buildCurrentHash():string
        {
            var hash:string = "";
            var navigationScope:NavigationScope;
            for(var p in this._scopes)
            {
                navigationScope =  this._scopes[p];
                if(!navigationScope)
                {
                    continue;
                }
                if(!navigationScope.getCurrentPage())
                {
                    continue;
                }
                if(navigationScope.getKey().substring(0, 1) == "_")
                {
                    //hidden;
                    continue;
                }
                if(hash.length)
                {
                    hash+="+";
                }

                hash+=navigationScope.getKey()+"/"+navigationScope.getCurrentPage().page;
                if(navigationScope.hasParameters())
                {
                    hash+= "/"+navigationScope.getCurrentPage().params.join("/");
                }
            }
            return Navigation.SEPARATOR + hash;
        }
        public getDefaultPage(scope:string):string
        {
            if(this._defaultsPages)
            {
                return this._defaultsPages[scope];
            }
            return null;
        }
        /**
         * Sets default page for scopes. {scope1:pagename, scope2:pagename2, ...}
         * @param defaults
         */
        public setDefaultPages(defaults:any):void
        {
            this._defaultsPages = defaults;
        }
        /**
         * Pushes a page of a scope
         * @param scope scope's label
         * @param page page's name
         */
        public pushPage(scope:string, page:string, params:any = null, fromHash:boolean = false):void
        {
            this.getScope(scope).pushPage(page, params, fromHash);
            if(!fromHash)
            {
                this._currentHash = this._buildCurrentHash();
                this.goto( this._currentHash );        
            }
        }
        /**
         * Replaces a page of a scope
         * @param scope scope's label
         * @param page page's name
         */
        public replacePage(scope:string, page:string):void
        {
            this.getScope(scope).replacePage(page);
            this._currentHash = this._buildCurrentHash();
            this.goto( this._currentHash );
        }
        /**
         * Gets current page's name of a scope
         * @param scope scope's label
         */
        public getCurrentPage(scope:string):NavigationScope
        {
            return this.getScope(scope);
        }
        /**
         * Pops a page of a scope
         * @param scope scope's label
         * @param count number of pages to pop
         */
        public popPage(scope:string, count?:number):void
        {
            //log.warn("pop page:"+ scope);
            this.getScope(scope).popPage(count);
            this._currentHash = this._buildCurrentHash();
            this.goto( this._currentHash );
        }
        /**
         * Pops all page of a scope
         * @param {string} scope Scope's label
         */
        public popAll(scope:string):void
        {
            this.getScope(scope).popAll();
            this._currentHash = this._buildCurrentHash();
            this.goto( this._currentHash );
        }

        /**
         * Pops a page of a scope
         * @param scope scope's label
         */
        public size(scope:string) : number
        {
            return this.getScope(scope).size();
        }
        /**
         * Gets scope
         * @param name scope's label
         * @returns {NavigationScope}
         */
        public getScope(name):NavigationScope
        {

            if(!name)
            {
                if(!this._DEFAULT_SCOPE)
                {
                    throw new Error("Navigation._DEFAULT_SCOPE not set!");
                }
                name = this._DEFAULT_SCOPE;
            }
            if(!this._scopes[name])
            {
                this._scopes[name] = new NavigationScope(name, this);
            }
            return this._scopes[name];
        }
    }


    
 //   Navigation = new Navigation();
    export interface IPage
    {
        page:string;
        params:any;
    }

