//convert
 /* ghost.events.EventDispatcher */
import {EventDispatcher} from "ghost/events/EventDispatcher";
///<module="events"/>
///<module="debug"/>

//convert-files
import {NavigationEvent} from "./NavigationEvent";
//convert-files
import {IPage} from "./IPage";


    
    //convert-import
import {Navigation} from "browser/navigation/Navigation";
    
    ///<reference path="typings/globals/socket.io-client/index.d.ts"/>;
    
    ///<reference path="typings/globals/node/index.d.ts"/>;
    //   export var Navigation:Navigation;
    /**
     * Global navigation system. Manages navigation history
     * @type {Navigation}
     */
    //convert-import
import {Eventer} from "ghost/events/Eventer";
  
    /**
    * NavigationScope. Manages navigation history for one scope
    * @type {NavigationScope}
    */
    export class NavigationScope extends EventDispatcher {
        /**
         * @private
         */
        private _key: string;
        private _history: IPage[];
        private _current: IPage;
        private _event: NavigationEvent;

        /**
         * Constructor
         * @param key scope's key
         * @private
         */
        constructor(key: string, navigation: Navigation) {
            super();
            //log.hide();
            this._key = key;
            this._history = [];
            this._current = null;
            this._event = new NavigationEvent();
        }

        public size(): number {
            return this._history.length;
        }

        /**
         * Get scope's key
         * @returns {string}
         */
        public getKey(): string {
            return this._key;
        }

        /**
         * Has current controller any parameters
         * @returns {boolean}
         */
        public hasParameters(): boolean {
            if (this._current) {
                if (this._current.params && this._current.params.length) {
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
        private _isCancelled(type: string, previous: string, next: string, params?: any): boolean {
            this._event._uncancel();
            this._event.params = params;
            this._event.previous = previous;
            this._event.next = next;
            this.trigger(previous + ":" + next, type, previous, next, this._event);
            if (!this._event.isCancelled()) {
                this.trigger("from:" + previous, type, previous, next, this._event);
                if (!this._event.isCancelled()) {
                    this.trigger("to:" + next, type, previous, next, this._event);
                    if (this._event.isCancelled()) {

                        //log.warn("cancelled third ["+previous+"/"+next+"]");
                    }
                } else {

                    //log.warn("cancelled second ["+previous+"/"+next+"]");
                }
            } else {
                //log.warn("cancelled first ["+previous+"/"+next+"]");
            }
            return this._event.isCancelled();
        }
        /**
         * Bind a callback function to a page change. The callback will be invocked whenever a page change to toElement
         * @param toElement page's label where the change is going to
         * @param callback callback's function. function(change type, previous page, next page, event)
         * @param context {optional} c
         */
        public to(toElement: string, callback: Function, context: any = null): void {
            return this.on("to:" + toElement, callback, context);
        }
        /**
         * Bind a callback function to a page change. The callback will be invocked <b>once</b> whenever a page change to toElement
         * @param toElement page's label where the change is going to
         * @param callback callback's function. function(change type, previous page, next page, event)
         * @param context {optional} Context for the callback
         */
        public toOnce(toElement: string, callback: Function, context: any = null): void {
            return this.once("to:" + toElement, callback, context);
        }
        /**
         * Unbind a callback function to a page change
         * @param toElement page's label where the change is going to
         * @param callback callback's function. function(change type, previous page, next page, event)
         * @param context {optional} Context for the callback
         */
        public toOff(toElement: string, callback: Function, context: any = null): void {
            return this.off("to:" + toElement, callback, context);
        }
        /**
         * Bind a callback function to a page change. The callback will be invocked whenever a page change from fromElement to toElement
         * @param fromElement page's label from where the change is going
         * @param toElement page's label where the change is going to
         * @param callback callback's function. function(change type, previous page, next page, event)
         * @param context {optional} Context for the callback
         */
        public listen(fromElement: string, toElement: string, callback: Function, context: any = null): void {
            return this.on(fromElement + ":" + toElement, callback, context);
        }
        /**
         * Bind a callback function to a page change. The callback will be invocked <b>once</b> whenever a page change from fromElement to toElement
         * @param fromElement page's label from where the change is going
         * @param toElement page's label where the change is going to
         * @param callback callback's function. function(change type, previous page, next page, event)
         * @param context {optional} Context for the callback
         */
        public listenOnce(fromElement: string, toElement: string, callback: Function, context: any = null): void {
            return this.once(fromElement + ":" + toElement, callback, context);
        }
        /**
         * Unbind a callback function to a page change
         * @param fromElement page's label from where the change is going
         * @param toElement page's label where the change is going to
         * @param callback callback's function. function(change type, previous page, next page, event)
         * @param context {optional} Context for the callback
         */
        public listenOff(fromElement: string, toElement: string, callback: Function, context: any = null): void {
            return this.off(fromElement + ":" + toElement, callback, context);
        }
        /**
         * Bind a callback function to a page change. The callback will be invocked whenever a page change from fromElement to another
         * @param fromElement page's label from where the change is going
         * @param callback callback's function. function(change type, previous page, next page, event)
         * @param context {optional} Context for the callback
         */
        public from(fromElement: string, callback: (type: string, previous, next) => void, context?: any): void {
            return this.on("from:" + fromElement, callback, context);
        }
        /**
         * Bind a callback function to a page change. The callback will be invocked <b>once</b> whenever a page change from fromElement to another
         * @param fromElement page's label from where the change is going
         * @param callback callback's function. function(change type, previous page, next page, event)
         * @param context {optional} Context for the callback
         */
        public fromOnce(fromElement: string, callback: Function, context?: any): void {
            return this.once("from:" + fromElement, callback, context);
        }
        /**
         * Unbind a callback function to a page change
         * @param fromElement page's label from where the change is going
         * @param callback callback's function. function(change type, previous page, next page, event)
         * @param context {optional} Context for the callback
         */
        public fromOff(fromElement: string, callback: Function, context?: any): void {
            return this.off("from:" + fromElement, callback, context);
        }
        /**
         * Gets current page's label
         * @returns {IPage}
         */
        public getCurrentPage(): IPage {
            return this._current;
        }
        /**
         * Gets page's index. if -1 will return the last one (=current)
         * @returns {IPage}
         */
        public getPage(index: number): IPage {
            if (index < 0) {
                index = this._history.length + index;
            }
            return <IPage>this._history[index];
        }
        private _areEquals(object1: any, object2: any): boolean {
            if (object1 === object2) {
                return true;
            }
            if ((object1 == null && object2.length == 0) || (object2 == null && object1.length == 0)) {
                return true;
            }
            if (object1 == null || object2 == null) {
                return false;
            }
            if (object1.length != object2.length) {
                return false;
            }
            var len: number = object1.length;
            for (var i: number = 0; i < len; i++) {
                if (object1[i] != object2[i]) {
                    return false;
                }
            }
            return true;


        }
        /**
         * Pushes a new page
         * @param page
         */
        public pushPage(page: string, params: any = null, fromHash: boolean = false): void {

            if (!this._current || this._current.page != page || !this._areEquals(this._current.params, params)) {
                var old: string = this._current ? this._current.page : null;
                if (!this._isCancelled(Navigation.PUSH, old, page, params)) {
                    var ipage: IPage =
                        {
                            page: page,
                            params: params
                        };
                    this._history.push(ipage);

                    this._current = ipage;
                    if (!fromHash) {
                        //log.info("not from hash:"+this._key+":"+this._current.page);
                        //TODO:add params ? 
                        Navigation.changeHash(this._key + "/" + this._current.page);
                    }
                    this._pageChange(Navigation.PUSH, old, this._current.page, params);

                } else {
                    if (!fromHash)
                        Navigation.changeHash(this._key + "/" + (this._current ? this._current.page : Navigation.instance.getDefaultPage(this._key)));
                }
            }
        }
        /**
         * Replaces current page by a new one. If there is no current page, will call #pushPage instead
         * @param page
         */
        public replacePage(page: string, params: any = null): void {
            if (this._history.length == 0) {
                this.pushPage(page);
                return;
            }
            if (!this._current || this._current.page != page || !this._areEquals(this._current.params, params)) {
                var old: string = this._current ? this._current.page : null;
                if (!this._isCancelled(Navigation.REPLACE, old, page, params)) {
                    var ipage: IPage =
                        {
                            page: page,
                            params: params
                        };
                    this._current = ipage;
                    this._history[this._history.length - 1] = ipage;
                    //
                    Navigation.changeHash(this._key + "/" + this._current.page + (params && params.length ? "/" + params.join('/') : ''));
                    this._pageChange(Navigation.REPLACE, old, this._current.page, this._current.params);
                }
            }
        }
        /**
         * Pops current page
         * @param count
         */
        public popPage(count?: number): void {
            if (count == undefined) {
                count = 1;
            }
            if (this._history.length > 0/*>1*/) {

                var old = this._current.page;
                if (this._history.length > count) {
                    this._current = this._history[this._history.length - count - 1];
                } else {
                    this._current = null;
                }


                if (!this._isCancelled(Navigation.POP, old, (this._current ? this._current.page : ""))) {
                    this._history.splice(this._history.length - count, count);
                    // this._current = this._history.length>0?this._history[this._history.length-1]:null;
                    // 
                    //TODO:add params ? 
                    Navigation.changeHash(this._key + "/" + (this._current ? this._current.page : ""));
                    this._pageChange(Navigation.POP, old, (this._current ? this._current.page : ""), (this._current ? this._current.params : ""));
                }
            } else {
                //
            }
        }
        /**
         * Pops all pages
         */
        public popAll(): void {
            this.popPage(this._history.length);
        }
        /**
         * Called during page change. Triggers events
         * @param type type of Change
         * @param previous previous page
         * @param next next page
         * @private
         */
        private _pageChange(type: string, previous: string, next: string, params: any = null): void {
            console.log("page change:" + type + " => " + previous + " next=" + next, params);
            this.trigger(Navigation.EVENT_PAGE_CHANGED, type, previous, next, params);
            Eventer.trigger(Navigation.EVENT_PAGE_CHANGED + ":" + this._key, this._key, type, previous, next, params);
        }
    }


