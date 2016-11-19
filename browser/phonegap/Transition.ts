///<lib="jquery"/>
///<module="navigation"/>
namespace ghost.phonegap
{
    
    
    
    /**
     * Css helper for prefixed properties
     */
    
    if(ghost.core.Hardware.isWebsite() || ghost.core.Hardware.isIOS() || ghost.core.Hardware.isAndroid())
    {

        /**
         * @param $element Element to cssize
         * @param name name of property
         * @value Value of property
         * @return JQuery element or css value
         */
        var css:Function = function($element:JQuery, name:string, value?:any):any 
        {
            if(value)
                return $element.css("-webkit-"+name, value);
            else
                return $element.css("-webkit-"+name);
        }
    }
    else
    if(ghost.core.Hardware.isWindowsPhone())
    {
        /**
         * @param $element Element to cssize
         * @param name name of property
         * @value Value of property
         * @return JQuery element or css value
         */
        var css:Function = function ($element:JQuery, name:string, value?:any):any
        {
            if(value)
                return $element.css("-ms-"+name, value);
            else
                return $element.css("-ms-"+name);
        }
    }else
    {
        /**
         * @param $element Element to cssize
         * @param name name of property
         * @value Value of property
         * @return void
         */
        var css:Function = function($element:JQuery, name:string, value?:any):void
        {
            throw(new Error(ghost.core.Hardware.getOS()+" is not supported"));
        }
    }
    /**
     * Transition helper
     * @type {Transition}
     */
    export class Transition
    {
        
        public static stringToNumber(value:string, size:number):number
        {
            var index:number;
            var nValue:number;
            if((index = value.indexOf("%"))!=-1)
            {
    
                nValue = parseFloat(value.substring(0, index));
                nValue = size*nValue/100;
            }else
            {
                if((index = value.indexOf("px"))!=-1)
                {
                    nValue = parseFloat(value.substring(0, index));
                }
            }
            return nValue;
        }
        /**
         * Translates an element by x,y,z offset
         * @param $element Element to translate
         * @param duration duration of the translation
         * @param animation. Animation type. default : linear
         * @param x x pixels to translate
         * @param y y pixels to translate
         * @param z z pixels to translate
         * @param callback function called when the translation is ended
         */
        public static translate($element:JQuery, duration:number, animation?:string, x?:number, y?:number, callback?:()=>void);
        public static translate($element:JQuery, duration:number, animation?:string, x?:string, y?:string, callback?:()=>void);
        public static translate($element:JQuery, duration:number, animation?:string, x?:number, y?:string, callback?:()=>void);
        public static translate($element:JQuery, duration:number, animation?:string, x?:string, y?:number, callback?:()=>void);
        public static translate($element:JQuery, duration:number, animation?:string, x?:number, y?:number, z?:number, callback?:()=>void);
        public static translate($element:JQuery, duration:number, animation?:string, x?:string, y?:number, z?:number, callback?:()=>void);
        public static translate($element:JQuery, duration:number, animation?:string, x?:string, y?:string, z?:number, callback?:()=>void);
        public static translate($element:JQuery, duration:number, animation?:string, x?:string, y?:string, z?:string, callback?:()=>void);
        public static translate($element:JQuery, duration:number, animation?:string, x?:number, y?:string, z?:string, callback?:()=>void);
        public static translate($element:JQuery, duration:number, animation?:string, x?:number, y?:number, z?:string, callback?:()=>void);
        public static translate($element:JQuery, duration:number, animation?:string, x?:string, y?:number, z?:string, callback?:()=>void);
        public static translate($element:JQuery, duration:number, animation?:string, x?:number, y?:string, z?:number, callback?:()=>void);
        public static translate($element:JQuery, duration:number, animation?:string, x?:any, y?:any, z?:any, callback?:()=>void)
        {
            if(!$element)
            {
                return;
            }
            if(typeof z == "function")
            {
                callback = z;
                z = 0;
            }
            if(!animation)
            {
                animation = "linear";
            }
    
            if(typeof x == "string")
                x = Transition.stringToNumber(x, $element.parent().width());
            if(typeof y == "string")
                y = Transition.stringToNumber(y, $element.parent().height());
    
    
            var value = css($element, "transform");
            x = x == undefined ? 0:x;
            y = y == undefined ? 0:y;
            z = z == undefined ? 0:z;
            if(!value && value != "none")
            {
                value = "translate3d("+x+", "+y+", "+z+")";
            }else
            {
                value  = new window['WebKitCSSMatrix'](value);
                value = value.translate(x, y);
            }
    
           // console.log("Transition["+animation+"] #"+$element.attr("id")+" ("+x+";"+y+") in "+duration+" => "+value.toString(), LOG_FLAG);
            css($element, "transition", "all "+duration+"ms "+animation+" 0");
    
             css($element, "transform", value.toString());
            if(callback)
            {
                /*
                 $element.one('webkitViewTransitionEnd', function(e) {
                 callback();
                 });*/
                setTimeout(callback, duration);
            }
        }
        /**
         * Translates an element to x,y,z position
         * @param $element Element to translate
         * @param duration duration of the translation
         * @param animation. Animation type. default : linear
         * @param x x position to translate to
         * @param y y position to translate to
         * @param z z position to translate to
         * @param callback function called when the translation is ended
         */
        public static translateTo($element:JQuery, duration:number, animation?:string, x?:number, y?:number, callback?:()=>void);
        public static translateTo($element:JQuery, duration:number, animation?:string, x?:string, y?:string, callback?:()=>void);
        public static translateTo($element:JQuery, duration:number, animation?:string, x?:number, y?:string, callback?:()=>void);
        public static translateTo($element:JQuery, duration:number, animation?:string, x?:string, y?:number, callback?:()=>void);
        public static translateTo($element:JQuery, duration:number, animation?:string, x?:number, y?:number, z?:number, callback?:()=>void);
        public static translateTo($element:JQuery, duration:number, animation?:string, x?:string, y?:number, z?:number, callback?:()=>void);
        public static translateTo($element:JQuery, duration:number, animation?:string, x?:string, y?:string, z?:number, callback?:()=>void);
        public static translateTo($element:JQuery, duration:number, animation?:string, x?:string, y?:string, z?:string, callback?:()=>void);
        public static translateTo($element:JQuery, duration:number, animation?:string, x?:number, y?:string, z?:string, callback?:()=>void);
        public static translateTo($element:JQuery, duration:number, animation?:string, x?:number, y?:number, z?:string, callback?:()=>void);
        public static translateTo($element:JQuery, duration:number, animation?:string, x?:string, y?:number, z?:string, callback?:()=>void);
        public static translateTo($element:JQuery, duration:number, animation?:string, x?:number, y?:string, z?:number, callback?:()=>void);
        public static translateTo($element:JQuery, duration:number, animation?:string, x?:any, y?:any, z?:any, callback?:()=>void)
        {
            if(!$element)
            {
                return;
            }
            if(typeof z == "function")
            {
                callback = z;
                z = 0;
            }
            if(!animation)
            {
                animation = "linear";
            }
    

            if(typeof x == "string")
                x = Transition.stringToNumber(x, $element.parent().width()/*gup.hardware.Hardware.getScreenWidth*/);
            if(typeof y == "string")
                y = Transition.stringToNumber(y, $element.parent().height()/*gup.hardware.Hardware.getScreenHeight*/);
    
            x = x == undefined ? 0:x;
            y = y == undefined ? 0:y;
            z = z == undefined ? 0:z;
    
            //console.warn("("+x+";"+y+")");
          //  console.log("Transition["+animation+"] to #"+$element.attr("id")+" ("+x+";"+y+") in "+duration, LOG_FLAG);
            css($element, "transition", "all "+duration+"ms "+animation+" 0");
            css($element, "transform", "translate3D("+x+"px,"+y+"px,"+z+"px)");
    
    
            if(callback)
            {
                /*
                $element.one('webkitViewTransitionEnd', function(e) {
                    callback();
                });*/
                setTimeout(callback, duration);
            }
    
        }
    }
    export interface IViewTransitionOptions
    {
        delete:boolean;
        hide:boolean;
        reverse:boolean;
        duration:number;
        animation:string;
        mode?:string;
        direction?:string;
        scale?:number;
    }
    export class ViewTransition extends ghost.events.EventDispatcher
    {
        /**
         * Css function
         * @type {Function}
         */
        //TODO:css
       // ViewTransition.prototype.css = css;
        /**
         * Event thrown when a transition is starting
         * @type {string}
         */
        public static START_TRANSITION:string = "START_TRANSITION";
        /**
         * Event thrown when a transition is ended
         * @type {string}
         */
        public static END_TRANSITION:string = "END_TRANSITION";
        /**
         * Transition using linear function
         * @type {string}
         */
        public static ANIMATION_LINEAR:string = "linear";
        /**
         * Transition using ease function
         * @type {string}
         */
        public static ANIMATION_EASE:string = "ease";
        /**
         * Transition using ease in function
         * @type {string}
         */
        public static ANIMATION_EASE_IN:string = "ease-in";
        /**
         * Transition using ease out function
         * @type {string}
         */
        public static ANIMATION_EASE_OUT:string = "ease-out";
        /**
         * Transition using ease in out function
         * @type {string}
         */
        public static ANIMATION_EASE_IN_OUT:string = "ease-in-out";
        /**
         * Transition using custom bezier function.<b>Not yet implemented ! </b>
         * @type {string}
         */
        public static ANIMATION_CUSTOM:string = "cubic-bezier";
    
        /**
         * @protected
         */
        public _to:any;
        /**
         * @protected
         */
        public _from:any;
        /**
         * @protected
         */
        public _options:IViewTransitionOptions;
        /**
         * @protected
         */
        public _transitioning:boolean;
        /**
         * @protected
         */
        public _callback:any;
        /**
         * Constructor
         * @private
         */
        constructor()
        {
            super();
            this._to = null;
            this._from = null;
            this._transitioning = false;
            //default options
            this._options =
            {
                delete:false,
                hide:true,
                reverse:false,
                duration:200,
                animation:ViewTransition.ANIMATION_LINEAR
            };
    
        }
        public reverse(value?:boolean):boolean
        {
            if(value != undefined)
            {
                this._options.reverse = value;
            }
            return this._options.reverse;
        }
    
    
        /**
         * Links to visual elements to the transition
         * @param from Element that will be bring on the view area
         * @param to Element that will be move out the view area
         * @param options custom options. Default :
         *  (
         *       if true, will delete <b>to</b> element at the end of the transition.
         *       delete:false,
         *       if true, will hide <b>to</b> element at the end of the transition. (ignored if delete is set to true)
         *       hide:true,
         *       if true, the animation will be played backward.
         *       reverse:false,
         *       duration of the animation (ms)
         *       duration:2000,
         *       type of transition's animation
         *       animation:ViewTransition.ANIMATION_LINEAR
         *   )
         */
        public link(from, to, options)
        {
            if(!from)
            {
                throw(new Error("You must give a view to show"));
                return;
            }
    
            this._from = from;
            this._to  = to;
            this.setOptions(options);
        }
        /**
         * Sets options of the transition
         * @param options Options object
         */
        public setOptions(options)
        {
            for(var p in options)
            {
                this._options[p] = options[p];
            }
            this._setDefaultOptions(this._options);
        }
        /**
         * <b>to override</b> Function's called to set/use specific transition options
         * @param options Options
         * @protected
         */
        public _setDefaultOptions(options)
        {
    
        }
        /**
         * Starts the transition
         */
        public start(callback)
        {
            this._transitioning = true;
    
            //if no from elmt=> no transition
            if(this._from)
            {
                this._startViewTransition(callback);
            }else
            {
                this._endViewTransition(callback);
            }
        }
        /**
         * Executes the transition.
         * Called in order : #_beforeTransition(), #_transition(), #_afterTransition(), #_endViewTransition()
         * @private
         */
        private _startViewTransition(callback)
        {
            var _self = this;
            if (!this._from)
            {
    
            } else
            {
                _self.trigger(ViewTransition.START_TRANSITION);
                this._beforeTransition(function ()
                {
                    _self._transition(_self._callback = function()
                    {
                        if(_self._callback._cancelled !== true)
                        {
                            _self._afterTransition();
                            _self._endViewTransition(callback);
                        }
                    })
                });
            }
        }
        /**
         * Called before transition
         * @protected
         */
        public _beforeTransition(callback:()=>void):void
        {
            if(callback)
            {
                callback();
            }
        }
        /**
         * Called for transition
         * @protected
         */
        public _transition(callback:()=>void):void
        {
            if(callback)
            {
                callback();
            }
        }
        /**
         * Called right after transition. (to end the transition) hide/delete etc
         * @protected
         */
        public _afterTransition():void
        {
    
        }
        /**
         * @protected
         */
        public _stop(skipToEnd:boolean, callback:()=>void):void
        {
        }
        /**
         * Called at the end of the process
         * @private
         */
        private _endViewTransition(callback)
        {
            if(this._to)
            {
                  if(this._options.delete)
                  {
                      this._to.remove();
                  }else
                  if(this._options.hide)
                  {
                      this._to.hide();
                  }
            }
            this.trigger(ViewTransition.END_TRANSITION);
            if(callback)
            {
                callback();
            }
    
            this._transitioning = false;
        }
        /**
         * clones the current ViewTransition instance. Will preserve properties and type
         * @returns {ViewTransition}
         */
        public clone()
        {
            //TODO:check this
            //var clone = gup.getClassByName(this.__className);
            var cstr:any = this["constructor"];
            var clone = new cstr();
            clone.setOptions(this._options);
            return clone;
        }
        /**
         * Stops current transition.<b>Not currently correctly managed</b>
         * @param skipToEnd set state to the normal final state
         * @param callback callback's function
         */
        public stop(skipToEnd, callback)
        {
            this._stop(skipToEnd, callback);
        }
    }
    /**
     * Slide transition
     * @type {SlideViewTransition}
     */
    export class SlideViewTransition extends ViewTransition
    {
        /**
         * Down direction
         * @type {number}
         */
        public static DIRECTION_DOWN = "down";
        /**
         * Up direction
         * @type {number}
         */
        public static DIRECTION_UP = "up";
        /**
         * Left direction
         * @type {number}
         */
        public static DIRECTION_LEFT = "left";
        /**
         * Right direction
         * @type {number}
         */
        public static DIRECTION_RIGHT = "right";
        /**
         * Push Mode. the <b>to</b> element will be pushed by the <b>from</b>.
         * @type {string}
         */
        public static MODE_PUSH = "push";
        /**
         * Cover Mode. the <b>to</b> element will be covered by the <b>from</b>.
         * @type {string}
         */
        public static MODE_COVER = "cover";
        /**
         * Uncover Mode. the <b>to</b> element will uncover the <b>from</b>.
         * @type {string}
         */
        public static MODE_UNCOVER = "uncover";
        /**
         * @inheritDoc
         * Additional options :
         * {
         *    direction of the animation
         *    direction:SlideViewTransition.DIRECTION_LEFT,
         *    mode of slide transition
         *    mode:SlideViewTransition.MODE_PUSH,
         *    number. scale of the animation (from 0 to 1). if set to 1, the <b>from</b> element will entirely take the place of the <b>to</b>, 0 elements will not move
         *    scale:1
         * }
         */
        public _setDefaultOptions(options)
        {
           // alert(JSON.stringify(options));
            if(options.direction == undefined)
            {
                options.direction = SlideViewTransition.DIRECTION_LEFT;
            }
            if(options.mode == undefined)
            {
                options.mode = SlideViewTransition.MODE_PUSH;
            }
            if(options.scale == undefined)
            {
    
                options.scale = 1;
            }
        }
        /**
         * @inheritDoc
         */
        public _beforeTransition(callback)
        {
    
            //console.log("TYPEOF from (before transition): "+(typeof this._from));
            var x:any = 0, y:any= 0, scale:number = this._options.mode == SlideViewTransition.MODE_UNCOVER ?100-this._options.scale*100:100;
            if(this._options.mode == SlideViewTransition.MODE_PUSH)
            {
              //  scale = this._options.scale*100;
            }
         //   this._options.direction = SlideViewTransition.DIRECTION_DOWN;
            switch(this._options.direction)
            {
                case SlideViewTransition.DIRECTION_UP:
                    y = scale;
                    break;
                case SlideViewTransition.DIRECTION_DOWN:
                    y = -scale;
                    break;
                case SlideViewTransition.DIRECTION_LEFT:
                    x = scale;
                    break;
                case SlideViewTransition.DIRECTION_RIGHT:
                    x = -scale;
                    break;
            }
    
            if(!this._options.reverse)
            {
                //x = -x;
                //y = -y;
                x = this._getStartX();
                y = this._getStartY();
            }else
            {
                x = this._getEndX();
                y = this._getEndY();
            }
            x = x+"%";
            y = y+"%";
            
            this._from.css("z-index", (this._options.mode == SlideViewTransition.MODE_PUSH ||  this._options.mode == SlideViewTransition.MODE_COVER)?1:0);
            if(this._to)
            {
                this._to.css("z-index", (this._options.mode == SlideViewTransition.MODE_UNCOVER)?1:0);
            }
         ///   console.log(this._from);
            Transition.translateTo(this._from, 0, ViewTransition.ANIMATION_LINEAR, x, y, callback);
            this._from.show();
        }
    
        private _getStartX()
        {
            var scale = this._options.mode == SlideViewTransition.MODE_UNCOVER ?100-this._options.scale*100:100;
    
            switch(this._options.direction)
            {
                case SlideViewTransition.DIRECTION_UP:
                    return 0;
                    break;
                case SlideViewTransition.DIRECTION_DOWN:
                    return 0;
                    break;
                case SlideViewTransition.DIRECTION_LEFT:
                    return scale;
                    break;
                case SlideViewTransition.DIRECTION_RIGHT:
                    return -scale;
                    break;
            }
        }
        private _getStartY()
        {
            var scale = this._options.mode == SlideViewTransition.MODE_UNCOVER ?100-this._options.scale*100:100;
    
            switch(this._options.direction)
            {
                case SlideViewTransition.DIRECTION_UP:
                    return scale;
                    break;
                case SlideViewTransition.DIRECTION_DOWN:
                    return -scale;
                    break;
                case SlideViewTransition.DIRECTION_LEFT:
                    return 0;
                    break;
                case SlideViewTransition.DIRECTION_RIGHT:
                    return 0;
                    break;
            }
        }
        private _getEndX()
        {
            var scale = this._options.scale*100;
    
            switch(this._options.direction)
            {
                case SlideViewTransition.DIRECTION_UP:
                    return 0;
                    break;
                case SlideViewTransition.DIRECTION_DOWN:
                    return 0;
                    break;
                case SlideViewTransition.DIRECTION_LEFT:
                    return -scale;
                    break;
                case SlideViewTransition.DIRECTION_RIGHT:
                    return scale;
                    break;
            }
        }
        private _getEndY()
        {
            var scale = this._options.scale*100;
    
            switch(this._options.direction)
            {
                case SlideViewTransition.DIRECTION_UP:
                    return -scale;
                    break;
                case SlideViewTransition.DIRECTION_DOWN:
                    return scale;
                    break;
                case SlideViewTransition.DIRECTION_LEFT:
                    return 0;
                    break;
                case SlideViewTransition.DIRECTION_RIGHT:
                    return 0;
                    break;
            }
        }
        /**
         * @inheritDoc
         */
        public _transition(callback)
        {
    
            var x = 0, y=0, scale = this._options.scale*100;
    
         //   Transition.translateTo(this._from, this._duration, x, y, callback);
    
            switch(this._options.direction)
            {
                case SlideViewTransition.DIRECTION_UP:
                    y = -scale;
                    break;
                case SlideViewTransition.DIRECTION_DOWN:
                    y = scale;
                    break;
                case SlideViewTransition.DIRECTION_LEFT:
                    x = -scale;
                    break;
                case SlideViewTransition.DIRECTION_RIGHT:
    
                    x = scale;
                    break;
            }
            if(this._options.reverse)
            {
                //x = -x;
                //y = -y;
                x = this._getStartX();
                y = this._getStartY();
            }else
            {
                x = this._getEndX();
                y = this._getEndY();
            }
        /*    if(this._options.reverse)
            {
                x = -x;
                y = -y;
            }*/
    
            /*
            x = x+"%";
            y = y+"%";
    */
    
    
    
            if(this._options.mode == SlideViewTransition.MODE_PUSH ||  this._options.mode == SlideViewTransition.MODE_COVER)
            {
    
                //TODO:à corriger pke ne doit pas marcher dans tous les cas
               // alert(x+"=>"+this._options.direction);
                Transition.translateTo(this._from, this._options.duration, this._options.animation,
               /* x */     (x==0?0:x<0?100+x:-100+x)+"%",
               /* y */     (y==0?0:y<0?100+y:-100+y)+"%",
                    callback);
              // Transition.translateTo(this._from, this._options.duration, this._options.animation, (-100+x)+"%", 0, callback);
             //   Transition.translate(this._from, this._options.duration, this._options.animation, x, y, callback);
            }
            if((this._options.mode == SlideViewTransition.MODE_PUSH ||  this._options.mode == SlideViewTransition.MODE_UNCOVER) && this._to)
            {
            //    alert(x+":"+y);
                Transition.translateTo(this._to, this._options.duration, this._options.animation, x+"%", y+"%");
            }
    
    
        }
        /**
         * @inheritDoc
         */
        public _afterTransition()
        {
    
        }
        /**
         * Stops the current transition
         * @param skipToEnd if true will set position as it would be if the transition ended normally
         * @param callback callback's function
         * @protected
         */
        public _stop(skipToEnd, callback)
        {
            if(this._transitioning)
            {
                if(this._callback)
                {
                    //alert(this._callback);
                    this._callback._cancelled = true;
                }
                this._transitioning = false;
                if(skipToEnd)
                {
                    var x:any = 0, y:any=0, scale:number = this._options.scale*100;
                    //   Transition.translateTo(this._from, this._duration, x, y, callback);
                    switch(this._options.direction)
                    {
                        case SlideViewTransition.DIRECTION_UP:
                            y = -scale;
                            break;
                        case SlideViewTransition.DIRECTION_DOWN:
                            y = scale;
                            break;
                        case SlideViewTransition.DIRECTION_LEFT:
                            x = -scale;
                            break;
                        case SlideViewTransition.DIRECTION_RIGHT:
                            x = scale;
                            break;
                    }
                    if(this._options.reverse)
                    {
                        x = -x;
                        y = -y;
                    }
                    x = x+"%";
                    y = y+"%";
                    if(this._options.mode == SlideViewTransition.MODE_PUSH ||  this._options.mode == SlideViewTransition.MODE_COVER)
                    {
                        Transition.translateTo(this._from, 0, ViewTransition.ANIMATION_LINEAR, 0, 0, 1);
                        //   Transition.translate(this._from, this._options.duration, this._options.animation, x, y, callback);
                    }
                    if((this._options.mode == SlideViewTransition.MODE_PUSH ||  this._options.mode == SlideViewTransition.MODE_UNCOVER) && this._to)
                        Transition.translateTo(this._to, 0, ViewTransition.ANIMATION_LINEAR, x, y, 1);
                    this._callback();
                    this._callback._cancelled = true;
                }else
                {
                    Transition.translateTo(this._to, 0, ViewTransition.ANIMATION_LINEAR, this._to.position().left, this._to.position().top);
                   
                    Transition.translateTo(this._from, 0, ViewTransition.ANIMATION_LINEAR, this._from.position().left, this._from.position().top, callback);
                }
            }
        }
    }
    export class NoViewTransition extends ViewTransition {

    }
    /**
     * Manages transition view based
     * @type {*}
     */
    export class TransitionManager extends ghost.events.EventDispatcher
    {
         /**
         * Event triggered when a view is pushed
         * @type {string}
         */
        public static VIEW_PUSHED = "view_pushed";
        /**
         * Event triggered when a view is replaced
         * @type {string}
         */
        public static VIEW_REPLACED = "view_replaced";
        /**
         * Event triggered when a view is changing
         * @type {string}
         */
        public static VIEW_CHANGING = "view_changing";
        /**
         * Event triggered when a view is changed
         * @type {string}
         */
        public static VIEW_CHANGED = "view_changed";
        /**
         * Event triggered when a view is popped
         * @type {string}
         */
        public static VIEW_POPPED = "view_popped";
    
        private _history:any[];
        private _historyTransition:any[];
        private _currentView:any;
        private _defaultTransition:ViewTransition;
        private _noTransition:ViewTransition;
        private _$root:JQuery;
        /**
         * Constructor
         * @param root root object
         * @private
         */
        constructor(root)
        {
            super();
            this._history = [];
            this._historyTransition = [];
            this._currentView = null;
            this._defaultTransition = new SlideViewTransition();
            this._defaultTransition.setOptions({duration:200});
            this._noTransition = new NoViewTransition();
            this._noTransition.setOptions({duration:0});
            debugger;
            this._link(root);
    
    
        }
        /**
         * Gets root object
         * @returns {JqueryObject}
         */
        public $getRoot()
        {
            return this._$root;
        }
        /**
         * Sets Default transition used when no transition is specified
         * @param transition {ViewTransition}
         */
        public setDefaultTransition(transition)
        {
            this._defaultTransition = transition;
        }
        /**
         * Gets default transition used when no transition is specified
         * @returns {ViewTransition}
         */
        public getDefaultTransition()
        {
            return this._defaultTransition;
        }
        /**
         * Links the root to the transition manager
         * @param $root
         * @private
         */
        private _link($root:JQuery);
        private _link($root:string);
        private _link($root?:any)
        {
            if(typeof $root == "string")
            {
                $root = $($root);
                this._$root = $root;
            }
            if($root)
            {
                var name = $root.attr("name");
                if(!name)
                {
                    name = $root.attr("id");
                }
                if(name)
                    ghost.events.Eventer.on(ghost.events.Eventer.PAGE_CHANGED+":"+name, this._onPageChanged, this);
                //$root.children().height($root.height());
                //$root.children().height("100%");
                if(ghost.hasClass("ghost.browser.navigation.Navigation"))
                {
                    var childname = null;
                    var $first;
                    if($root.attr("first"))
                    {
                        var first = $root.attr("first");
                        $first = $("#"+first, $root);
                        if($first.get(0)==null)
                        {
                            $first = $("[name='"+first+"']", this._$root);
                        }
    
                        if($first.get(0)!=null)
                        {
                            childname = first;
                        }
                    }else
                    {
                        $first = $root.find(">:first-child");
                        if($first.get(0))
                        {
                            childname = $first.attr("id");
                            if(!childname)
                            {
                                childname = $first.attr("name");
                            }
                        }
                    }
                    $root.children().hide();
                    if($first)
                    {
                        $first.show();
                    }
                    if(childname)
                    {
                        ghost.getClassByName("ghost.browser.navigation.Navigation").pushPage(name,childname);
                    }
                }
    
            }
        }
        /**
         * Called when a page has changed
         * @param type type of change
         * @param previous previous page
         * @param next next page
         * @private
         */
        private _onPageChanged(scope:string,type, previous, next)
        {
            console.log("PAGE CHANGED", next);
            //we can use Navigation properties because this event is
            switch(type)
            {
                case ghost.browser.navigation.Navigation.PUSH:
                    this.pushView("#"+next);
                    break;
                case ghost.browser.navigation.Navigation.POP:
                    this.popView();
                    break;
                case ghost.browser.navigation.Navigation.REPLACE:
                    this.replaceView("#"+next);
                    break;
            }
        }
        /**
         * Pushes view
         * @param view new view
         * @param transition transition. Default #getDefaultTransition()
         */
        public pushView(view:string, transition?:ViewTransition):void
        {
            if(this._currentView!=view)
            {
                this._history.push(view);
                if(!transition)
                {
                    transition = this._defaultTransition.clone();
                    transition.reverse(false);
                }
                this._historyTransition.push(transition);
                var old = this._currentView;
                this._currentView = view;
                this.trigger(TransitionManager.VIEW_PUSHED);
               // alert("options:"+JSON.stringify(transition._options));
               // alert(old);
                this._startTransition(transition, this._currentView, old);
            }
        }
        /**
         * Starts transition
         * @param transition
         * @param from element to transition
         * @param to element to reach
         * @private
         */
        private _startTransition(transition, from, to)
        {
    
            this.trigger(TransitionManager.VIEW_CHANGING);
            var _self = this;
    
    
            if(typeof from == "string")
            {
                from = $(from);
            }
            if(typeof to == "string")
            {
                to = $(to);
            }

            if(!to)
            {
                transition = this._noTransition;
            }
            transition.link(from, to);

            transition.start(function()
            {
                _self.trigger(TransitionManager.VIEW_CHANGED);
            });
        }
        /**
         * Replaces the current view by another
         * @param view new view
         * @param transition transition. default : #getDefaultTransition()
         */
        public replaceView(view:string, transition?:ViewTransition):void
        {
            this.trigger(TransitionManager.VIEW_REPLACED);
            this.popView();
            this.pushView(view, transition);
        }
        /**
         * Pops the current view
         * @param transition Transition to pop. Default : reverse of the transition used to push
         */
        public popView(transition?:ViewTransition):void
        {
            if(this._history.length>1)
            {
                this._history.pop();
                var view = this._history.length>0?this._history[this._history.length-1]:null;
                if(!transition)
                {
                    transition = this._historyTransition[this._historyTransition.length-1];
                    if(transition)
                    {
    
                        transition.reverse(!transition.reverse());
                    }else
                    {
                        transition = this._defaultTransition;
                        transition.reverse(true);
                    }
                }
                this._historyTransition.pop();
                var old = this._currentView;
                this._currentView = view;
                this.trigger(TransitionManager.VIEW_POPPED);
                this._startTransition(transition, this._currentView, old);
            }
        }
        /**
         * Stops the current transition.
         * @param skipToEnd If true will finish the current transition but in no time
         * @param callback {optional} callback
         */
        public stop(skipToEnd, callback)
        {
            if(this._historyTransition.length>0)
            {
                 this._historyTransition[this._historyTransition.length-1].stop(skipToEnd, callback);
            }
        }
        /**
         * Gets current visible view
         * @returns {*}
         */
        public getCurrentView()
        {
            return this._currentView;
        }
    }
}
