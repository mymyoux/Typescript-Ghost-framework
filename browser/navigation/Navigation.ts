///<module="events"/>
///<module="debug"/>
///<lib="jquery"/>
namespace ghost.browser.navigation
{
 //   export var Navigation:Navigation;
    /**
     * Global navigation system. Manages navigation history
     * @type {Navigation}
     */
    export class Navigation extends ghost.events.EventDispatcher
    {
        /**
         * Events triggered when a page change
         * @type {string}
         */
        public static EVENT_PAGE_CHANGED:string = ghost.events.Eventer.PAGE_CHANGED;
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
            log.hide();
            if(Navigation.instance)
            {
                //TODO:allow this ?
                throw new Error("There is already an instance of navigation");
            }
            Navigation.instance = this;
            this._scopes = {};
            ghost.events.Eventer.on(ghost.events.Eventer.HASH_CHANGE, this._onHashChange, this);
            //TODO:not sure
            var _this:Navigation = this;
            if(ready)
            {
                this.listen();
            }
        }
        public conserveHash(value: boolean): boolean
        {
            return this._converseHash = value;
        }
        public listen():void
        {
            ghost.$ready(()=>
            {
                if(!this._listening)
                {
                    this._listening = true;
                    this._detectScope();
                    this._onHashChange(true);
                }
            });
        }
        public static changeHash(hash:string):void
        {
            log.info("Change hash:"+hash);
            if(hash.split("/")[0] == Navigation._DISPLAYED_SCOPE || hash.split("_")[0] == Navigation._DISPLAYED_SCOPE)
                window.location.hash = this.SEPARATOR + hash;
        }
        private _detectScope():void
        {
            var _this:Navigation = this;
            var hash:any = _this.parseHash();
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
                        page = _this.getDefaultPage(scope);
                    }else
                    {
                        page = $child.eq(0).attr("data-name");
                    }
                }
                if(page)
                {
                    _this.pushPage($(this).attr("data-scope"), page, hash[scope]?hash[scope].params:null, true/* hash[scope]?true:false*/);
                }else
                {
                    log.warn("No child with data-name inside a data-scope element and no default page for scope["+scope+"]");
                    log.warn(this);
                }
            });
            this._currentHash = this._buildCurrentHash();
            window.location.href = this._currentHash;
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

        private parseHash():any
        {
            var hash:any = window.location.hash.substring( 1 );
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
                window.location.href = this._currentHash;
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
            window.location.href = this._currentHash;
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
            log.warn("pop page:"+ scope);
            this.getScope(scope).popPage(count);
            this._currentHash = this._buildCurrentHash();
            window.location.href = this._currentHash;
        }
        /**
         * Pops all page of a scope
         * @param {string} scope Scope's label
         */
        public popAll(scope:string):void
        {
            this.getScope(scope).popAll();
            this._currentHash = this._buildCurrentHash();
            window.location.href = this._currentHash;
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


    /**
     * Navigation Event. Used to cancel current page change
     * @type {NavigationEvent}
     */
    export class NavigationEvent
    {
        /**
         * @private
         */
        private _cancelled:boolean;
        public previous:string;
        public next:string;
        public params:any;
         /**
         * Constructor
         * @private
         */
        constructor()
        {
            this._cancelled = false;
        }
        /**
         * Cancels the current change
         */
        public cancel():void
        {
            this._cancelled = true;
        }
        /**
         * Check if the change is cancelled
         * @returns {boolean}
         */
        public isCancelled():boolean
        {
            return this._cancelled;
        }
        /**
         * Reset the initial state
         * @private
         */
        public _uncancel():void
        {
            this._cancelled = false;
        }
    }
     /**
     * NavigationScope. Manages navigation history for one scope
     * @type {NavigationScope}
     */
    export class NavigationScope extends ghost.events.EventDispatcher
    {
        /**
         * @private
         */
        private _key:string;
        private _history:IPage[];
        private _current:IPage;
        private _event:NavigationEvent;

        /**
         * Constructor
         * @param key scope's key
         * @private
         */
        constructor(key:string, navigation:Navigation)
        {
            super();
            log.hide();
            this._key = key;
            this._history = [];
            this._current = null;
            this._event = new NavigationEvent();
        }

         /**
          * Get scope's key
          * @returns {string}
          */
         public getKey():string
         {
            return this._key;
         }

         /**
          * Has current controller any parameters
          * @returns {boolean}
          */
         public hasParameters():boolean
         {
             if(this._current)
             {
                 if(this._current.params && this._current.params.length)
                 {
                     return true;
                 }
             }
             return false;
         }
        /**
         * Checks if the change is cancelled
         * @param type type of change
         * @param previous previous page
         * @param next next page
         * @returns {boolean}
         * @private
         */
        private _isCancelled(type:string, previous:string, next:string, params?:any):boolean
        {
            this._event._uncancel();
            this._event.params = params;
            this._event.previous = previous;
            this._event.next = next;
            this.trigger(previous+":"+next, type, previous, next, this._event );
            if(!this._event.isCancelled())
            {
                this.trigger("from:"+previous, type, previous, next, this._event );
                if(!this._event.isCancelled())
                {
                    this.trigger("to:"+next, type, previous, next, this._event );
                    if(this._event.isCancelled())
                    {

                    log.warn("cancelled third ["+previous+"/"+next+"]");
                    }
                }else
                {

                    log.warn("cancelled second ["+previous+"/"+next+"]");
                }
            }else
            {
                log.warn("cancelled first ["+previous+"/"+next+"]");
            }
            return this._event.isCancelled();
        }
        /**
         * Bind a callback function to a page change. The callback will be invocked whenever a page change to toElement
         * @param toElement page's label where the change is going to
         * @param callback callback's function. function(change type, previous page, next page, event)
         * @param context {optional} c
         */
        public to(toElement:string, callback:Function, context:any = null):void
        {
            return this.on("to:"+toElement, callback, context);
        }
        /**
         * Bind a callback function to a page change. The callback will be invocked <b>once</b> whenever a page change to toElement
         * @param toElement page's label where the change is going to
         * @param callback callback's function. function(change type, previous page, next page, event)
         * @param context {optional} Context for the callback
         */
        public toOnce(toElement:string, callback:Function, context:any = null):void
        {
            return this.once("to:"+toElement, callback, context);
        }
        /**
         * Unbind a callback function to a page change
         * @param toElement page's label where the change is going to
         * @param callback callback's function. function(change type, previous page, next page, event)
         * @param context {optional} Context for the callback
         */
        public toOff(toElement:string, callback:Function, context:any = null):void
        {
            return this.off("to:"+toElement, callback, context);
        }
        /**
         * Bind a callback function to a page change. The callback will be invocked whenever a page change from fromElement to toElement
         * @param fromElement page's label from where the change is going
         * @param toElement page's label where the change is going to
         * @param callback callback's function. function(change type, previous page, next page, event)
         * @param context {optional} Context for the callback
         */
        public listen(fromElement:string, toElement:string, callback:Function, context:any = null):void
        {
            return this.on(fromElement+":"+toElement, callback, context);
        }
        /**
         * Bind a callback function to a page change. The callback will be invocked <b>once</b> whenever a page change from fromElement to toElement
         * @param fromElement page's label from where the change is going
         * @param toElement page's label where the change is going to
         * @param callback callback's function. function(change type, previous page, next page, event)
         * @param context {optional} Context for the callback
         */
        public listenOnce(fromElement:string, toElement:string, callback:Function, context:any = null):void
        {
            return this.once(fromElement+":"+toElement, callback, context);
        }
        /**
         * Unbind a callback function to a page change
         * @param fromElement page's label from where the change is going
         * @param toElement page's label where the change is going to
         * @param callback callback's function. function(change type, previous page, next page, event)
         * @param context {optional} Context for the callback
         */
        public listenOff(fromElement:string, toElement:string, callback:Function, context:any = null):void
        {
            return this.off(fromElement+":"+toElement, callback, context);
        }
        /**
         * Bind a callback function to a page change. The callback will be invocked whenever a page change from fromElement to another
         * @param fromElement page's label from where the change is going
         * @param callback callback's function. function(change type, previous page, next page, event)
         * @param context {optional} Context for the callback
         */
        public from(fromElement:string, callback:(type:string, previous, next)=>void, context?:any):void
        {
            return this.on("from:"+fromElement, callback, context);
        }
        /**
         * Bind a callback function to a page change. The callback will be invocked <b>once</b> whenever a page change from fromElement to another
         * @param fromElement page's label from where the change is going
         * @param callback callback's function. function(change type, previous page, next page, event)
         * @param context {optional} Context for the callback
         */
        public fromOnce(fromElement:string, callback:Function, context?:any):void
        {
            return this.once("from:"+fromElement, callback, context);
        }
        /**
         * Unbind a callback function to a page change
         * @param fromElement page's label from where the change is going
         * @param callback callback's function. function(change type, previous page, next page, event)
         * @param context {optional} Context for the callback
         */
        public fromOff(fromElement:string, callback:Function, context?:any):void
        {
            return this.off("from:"+fromElement, callback, context);
        }
        /**
         * Gets current page's label
         * @returns {IPage}
         */
        public getCurrentPage():IPage
        {
            return this._current;
        }
         /**
          * Gets page's index. if -1 will return the last one (=current)
          * @returns {IPage}
          */
         public getPage(index:number):IPage
         {
             if(index<0)
             {
                 index = this._history.length+index;
             }
             return <IPage>this._history[index];
         }
         private _areEquals(object1:any, object2:any):boolean
         {
            if(object1 === object2)
            {
                return true;
            }
            if((object1 == null && object2.length==0) || (object2 == null && object1.length==0))
            {
                return true;
            }
            if(object1 == null  || object2 == null)
            {
                return false;
            }
            if(object1.length != object2.length)
            {
                return false;
            }
            var len:number = object1.length;
            for(var i:number=0; i<len; i++)
            {
                if(object1[i] != object2[i])
                {
                    return false;
                }
            }
            return true;


         }
        /**
         * Pushes a new page
         * @param page
         */
        public pushPage(page:string, params:any = null, fromHash:boolean = false):void
        {

            if(!this._current || this._current.page != page || !this._areEquals(this._current.params,params))
            {
                var old:string = this._current?this._current.page:null;
               if(!this._isCancelled(Navigation.PUSH, old, page, params))
               {
                    var ipage:IPage =
                    {
                        page:page,
                        params: params
                    };
                   this._history.push(ipage);

                   this._current = ipage;
                   if(!fromHash)
                   {
                        //log.info("not from hash:"+this._key+":"+this._current.page);
                    Navigation.changeHash(this._key+"/"+this._current.page);
                   }
                   this._pageChange(Navigation.PUSH, old, this._current.page, params);

               }else
               {
                   if(!fromHash)
                        Navigation.changeHash(this._key+"/"+(this._current?this._current.page:Navigation.instance.getDefaultPage(this._key)));
               }
            }
        }
        /**
         * Replaces current page by a new one. If there is no current page, will call #pushPage instead
         * @param page
         */
        public replacePage(page:string, params:any = null):void
        {
            if(this._history.length == 0)
            {
                this.pushPage(page);
                return;
            }
            if(!this._current || this._current.page != page || !this._areEquals(this._current.params,params))
            {
                var old:string = this._current?this._current.page:null;
                if(!this._isCancelled(Navigation.REPLACE, old, page, params))
                {
                     var ipage:IPage =
                    {
                        page:page,
                        params: params
                    };
                    this._current = ipage;
                    this._history[this._history.length-1] = ipage;
                     Navigation.changeHash(this._key+"/"+this._current.page);
                    this._pageChange(Navigation.REPLACE, old, this._current.page);
                }
            }
        }
        /**
         * Pops current page
         * @param count
         */
        public popPage(count?:number):void
        {
            if(count == undefined)
            {
                count = 1;
            }
            if(this._history.length>0/*>1*/)
            {

                var old = this._current.page;
                if(this._history.length>count)
                {
                    this._current = this._history[this._history.length-count-1];
                }else
                {
                    this._current = null;
                }


                if(!this._isCancelled(Navigation.POP, old, (this._current?this._current.page:"")))
                {
                    this._history.splice(this._history.length-count, count);
                   // this._current = this._history.length>0?this._history[this._history.length-1]:null;
                    Navigation.changeHash(this._key+"/"+(this._current?this._current.page:""));
                    this._pageChange(Navigation.POP, old, (this._current?this._current.page:""));
                }
            }else
            {
                //
            }
        }
        /**
         * Pops all pages
         */
        public popAll():void
        {
            this.popPage(this._history.length);
        }
        /**
         * Called during page change. Triggers events
         * @param type type of Change
         * @param previous previous page
         * @param next next page
         * @private
         */
        private _pageChange(type:string, previous:string, next:string, params:any = null):void
        {
            log.info("page change:"+type+" => " +previous+ " next="+next);
            this.trigger(Navigation.EVENT_PAGE_CHANGED, type, previous, next, params);
            ghost.events.Eventer.trigger(Navigation.EVENT_PAGE_CHANGED+":"+this._key, this._key, type, previous, next, params);
        }
    }

 //   Navigation = new Navigation();
    export interface IPage
    {
        page:string;
        params:any;
    }

}
