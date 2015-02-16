///<module="events"/>
///<lib="jquery"/>
module ghost.browser.navigation
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
        /**
         * Constructor
         * @param ready If true, will be active as soon as possible otherwise will wait for #listen() to be call
         */
        constructor(ready:boolean = true)
        {
            super();
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
                    _this.pushPage($(this).attr("data-scope"), page);
                }else
                {
                    console.warn("No child with data-name inside a data-scope element and no default page for scope["+scope+"]", this);
                }
            });
        }
        private parseHash():any
        {
            var hash:any = window.location.hash.substring(1);
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
                        //debugger;
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
                    page = split.slice(1).join("_");
                }
                previous[scope] = {page:page, params:params};
                return previous;
            }, {});
            return hashes;
        }
         private _onHashChange(first:boolean = false):void
        {
            var hashes:any = this.parseHash();
            var scope:string, page:string, params:any;
            for(var p in hashes)
            {
                scope = p;
                page = hashes[scope].page;
                params = hashes[scope].params;
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
                        this.pushPage(scope, page, params);
                    }

                }

            }   
        }
        /**
         * Called when hash page changed
         * @private
         */
        private _onHashChange2(first:boolean = false):void
        {

            var index;
            var hash:any = window.location.hash;
            if((index = hash.indexOf("#"))!=-1)
            {
                hash = hash.substring(index+1);
            }
            if(hash.length>0)
            {
            //console.error("HASH=>"+hash);
               if(ghost.constants.debug && hash.substring(0, 1) == "+")
               {
                    hash = hash.substring(1);
                    hash = hash.split("+");
                    var selector;
                   for(var p in hash)
                   {
                       selector = hash[p].split("_");
                       if(selector.length == 2)
                       {
                            $("#"+selector[0]).attr("first", selector[1]);
                       }
                   }
                 //  $(selector).remove();
                 //  alert(selector);



                   scrollTo(0,0);
                   return;
               }
                var index;
                var scope:string;
                if((index = hash.indexOf("_"))==-1)
                {
                    scope = this._DEFAULT_SCOPE;
                }else
                {
                    scope = hash.substring(0,index);
                    hash = hash.substring(index+1);
                }
                if(first === true)
                {
                    $("#"+scope).attr("first",hash);
                    this.pushPage(scope, hash);
                }else
                {
                    if(hash == "back")
                    {
        
                        this.popPage(scope);
                    }else
                    {
                        this.pushPage(scope, hash);
                    }

                }
            }
        }

        private getDefaultPage(scope:string):string
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
        public pushPage(scope:string, page:string, params:any = null):void
        {
            this.getScope(scope).pushPage(page, params);
        }
        /**
         * Replaces a page of a scope
         * @param scope scope's label
         * @param page page's name
         */
        public replacePage(scope:string, page:string):void
        {
            this.getScope(scope).replacePage(page);
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
            this.getScope(scope).popPage(count);
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
            this._key = key;
            this._history = [];
            this._current = null;
            this._event = new NavigationEvent();
        }
        /**
         * Checks if the change is cancelled
         * @param type type of change
         * @param previous previous page
         * @param next next page
         * @returns {boolean}
         * @private
         */
        private _isCancelled(type:string, previous:string, next:string):boolean
        {
            this._event._uncancel();
            this.trigger(previous+":"+next, type, previous, next, this._event );
            if(!this._event.isCancelled())
            {
                this.trigger("from:"+previous, type, previous, next, this._event );
                if(!this._event.isCancelled())
                {
                    this.trigger("to:"+next, type, previous, next, this._event );
                }
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
        /**
         * Pushes a new page
         * @param page
         */
        public pushPage(page:string, params:any = null):void
        {
            if(!this._current || this._current.page != page || this._current.params !== params)
            {
                var old:string = this._current?this._current.page:null;
               if(!this._isCancelled(Navigation.PUSH, old, page))
               {
                    var ipage:IPage = 
                    {
                        page:page,
                        params: params
                    };
                   this._history.push(ipage);
    
                   this._current = ipage;
                   window.location.hash = "#"+this._key+"_"+this._current.page;
                   this._pageChange(Navigation.PUSH, old, this._current.page, params);
    
               }else
               {
                   window.location.hash = "#"+this._key+"_"+(this._current?this._current.page:"");
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
            if(!this._current || this._current.page != page || this._current.params !== params)
            {
                var old:string = this._current?this._current.page:null;
                if(!this._isCancelled(Navigation.REPLACE, old, page))
                {
                     var ipage:IPage = 
                    {
                        page:page,
                        params: params
                    };
                    this._current = ipage;
                    this._history[this._history.length-1] = ipage;
                    window.location.hash = "#"+this._key+"_"+this._current.page;
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
            if(this._history.length>1)
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
                    window.location.hash = "#"+this._key+"_"+(this._current?this._current.page:"");
                    this._pageChange(Navigation.POP, old, (this._current?this._current.page:""));
                }
            }else
            {
                //
            }
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
            this.trigger(Navigation.EVENT_PAGE_CHANGED, type, previous, next, params);
            ghost.events.Eventer.trigger(Navigation.EVENT_PAGE_CHANGED+":"+this._key, type, previous, next, params);
        }
    }
    
 //   Navigation = new Navigation();
    export interface IPage
    {
        page:string;
        params:any;
    }
    
}