
namespace ghost.utils
{
    export class Timer
    {
        private static _timers:Timer[] = [];
        private _timeout:number = -1;
        private _isTimeout:boolean;
        private _callback:Function;
        private _delay:number;
        private _params:any[];
        private _called:number = 0;
        private _lastCall:number = -1;
        private _name:string;
        constructor(name:string, isTimeout:boolean, callback:Function, delay:number = 0, params:any[] = null)
        {
            this._name = name;
            this._isTimeout = isTimeout;
            this._callback = callback;
            this._delay = delay;
            this._params = params;
            Timer._timers.push(this);
        }
        public getName():string
        {
            return this._name;
        }
        public isInterval():boolean
        {
            return !this._isTimeout;
        }
        public isTimeout():boolean
        {
            return this._isTimeout;
        }
        public start():void
        {
            if(this._timeout == -1 || this._isTimeout)
            {
                if(this._delay < 0)
                {
                    throw new Error("Delay must be >= 0, maybe you are trying to use a disposed timer");
                }
                var _this:Timer = this;
                this._lastCall = Date.now();
                if(this._isTimeout)
                {
                    if(this._timeout != -1)
                    {
                        clearTimeout(<any>this._timeout);
                    }
                    this._timeout = <any>setTimeout(function()
                    {
                        _this._called++;
                        _this._timeout = -1;
                        _this._lastCall = Date.now();
                        _this._callback.apply(null, _this._params);

                    }, _this._delay);
                }else
                {
                    this._timeout = <any>setInterval(function()
                    {
                        _this._called++;
                        _this._lastCall = Date.now();
                        _this._callback.apply(null, _this._params);
                    }, _this._delay);
                }
            }
        }
        public reset():void
        {
            this.stop();
            if(!this._isTimeout)
                this.start();
        }
        public dispose():void
        {
            this.stop();
            this._callback = null;
            this._params = null;
            this._delay = -1;

            var index:number;
            if((index = Timer._timers.indexOf(this))!=-1)
            {
                Timer._timers.splice(index, 1);
            }
        }
        public stop():void
        {
            if(this._timeout!=-1)
            {
                if(this._isTimeout)
                {
                    clearTimeout(<any>this._timeout);
                }else
                {
                    clearInterval(<any>this._timeout);

                }
                this._timeout = -1;
            }
        }
        public isRunning():boolean
        {
            return this._timeout != <any>-1;
        }
        public getNumberOfCalls():number
        {
            return this._called;
        }
        public getTimeRemaining():number
        {
            if(this.isRunning())
            {
                return this._lastCall+this._delay - Date.now();
            }else
            {
                return Infinity;
            }
        }
        public static clearTimeout(timer:Timer):void
        {
            timer.stop();
            timer.dispose();
        }
        public static clearInterval(timer:Timer):void
        {
            timer.stop();
            timer.dispose();
        }
        public static callLater(callback:Function, instance:any = null, ...params:any[]):number
        {
            return Timer.setTimeout.apply(instance, ["callLater", callback, 0].concat(params));
        }
        public static applyLater(callback:Function,instance:any = null,  params:any[] = null):number
        {
            return Timer.setTimeout.apply(instance, ["applyLater", callback, 0].concat(params));
        }
        public static setTimeout(name:string, callback:Function, delay:number, ...params:any[]):Timer
        {
            return new Timer(name, true, callback, delay, params);
        }
        public static setInterval(name:string, callback:Function, delay:number, ...params:any[]):Timer
        {
             return new Timer(name, false, callback, delay, params);
        }
        public static getNumberTimersRunning():number
        {
            return Timer._timers.length;
        }
         public static getNumberTimeoutsRunning():number
        {
            var quantity:number = 0;
            for(var p in Timer._timers)
            {
                if(Timer._timers[p].isTimeout())
                {
                    quantity++;
                }
            }
            return quantity;
        }
        public static getNumberIntervalsRunning():number
        {
            var quantity:number = 0;
            for(var p in Timer._timers)
            {
                if(Timer._timers[p].isInterval())
                {
                    quantity++;
                }
            }
            return quantity;
        }
    }

    export interface BufferFunction extends Function
    {
        waiting:boolean;
        delay:number;
        isWaiting():void;
        cancel():void;
        pause():void;
        resume():void;
        delayed(customDelay:number, ...args):void;
        now():void;  
        getTimeRemaining():number;
    }

    /**
     * Buffer
     */
    export class Buffer
    {
        //private _timers
        public static throttle(callback:Function, delay:number):BufferFunction
        {
            var timer:any = null;
            var args:any = null;
            var time:number;
            var func:BufferFunction = <any> function () {

                args = arguments;
                clearTimeout(timer);
                func.waiting = true;
                time = Date.now();
                timer = setTimeout(function()
                {
                    callback.apply(func, args);
                }, delay);
            };

            /**
             * Cancel the throttle's function future call
             */
            function cancel()
            {
                clearTimeout(timer);
            }

            /**
             * Checks if the throttle function is waiting to be called
             * @returns {boolean}
             */
            function isWaiting() {
                return func.waiting;
            }

            function delayed(customDelay:number) {

                args = Array.prototype.slice.call(arguments, 1);
                clearTimeout(timer);
                func.waiting = true;
                time = Date.now();
                timer = setTimeout(function() {
                    callback.apply(func, args);
                }, customDelay);
            }

            /**
             * If the throttle's function is waiting, it will call it now
             */
            function now()
            {
                if (func.waiting) {
                    clearTimeout(timer);
                    func.waiting = false;
                    callback.apply(func, args);
                }
            }
            function pause():void
            {
                if(isWaiting())
                {
                    clearTimeout(timer);
                    func.waiting = false;
                }

            }
            function resume():void
            {
                func.waiting = true;
                time = Date.now();
                timer = setTimeout(function()
                {
                    callback.apply(func, args);
                }, delay);
            }
            function getTimeRemaining():number
            {
                return (!isWaiting())?0:Math.max(0, delay - (Date.now()-time));
            }
            func.waiting = false;
            func.cancel = cancel;
            func.pause = pause;
            func.getTimeRemaining = getTimeRemaining;
            func.resume = resume;
            func.isWaiting = isWaiting;
            func.delay = delay;
            func.delayed = delayed;
            func.now = now;
            return func;
        }

        public static callLater(callback:Function, ...params:any[]):number
        {
            return Buffer.setTimeout.apply(null, [callback, 0].concat(params));
        }

        public static setTimeout(callback:Function, delay:number, ...params:any[]):number
        {
            return <any>setTimeout(function()
            {
                callback.apply(null, params);
            }, delay);
        }
        public static setInterval(callback:Function, delay:number, ...params:any[]):number
        {
            return <any>setInterval(function()
            {
                callback.apply(null, params);
            }, delay);
        }

        private _listFunctions:MFunction[];
        constructor()
        {

            this._listFunctions = [];
        }
        /**
         * Indicates if the buffer is empty
         */
        public isEmpty():boolean
        {
            return this._listFunctions.length == 0;
        }

        /**
         * Number of waiting functions
         */
        public getLength():number
        {
            return this._listFunctions.length;
        }
        public add(mfunc:any):void
        {
            if(!(mfunc instanceof MFunction))
            {
                return this.addFunction.apply(this, Array.prototype.slice.apply(arguments));
            }
            this._listFunctions.push(mfunc);
        }
        public addAt(mfunc:any, index:number):void
        {
            if(!(mfunc instanceof MFunction))
            {
                return this.addFunctionAt.apply(this, Array.prototype.slice.apply(arguments));
            }
            this._listFunctions.splice(index, 0, mfunc);
        }


        public addFunction(func:any, scope?:any, ...params:any[]):MFunction
        {
            var mfunc = new MFunction();
            mfunc.setFunction(func);
            mfunc.setScope(scope);
            mfunc.setParams(Array.prototype.slice.call(arguments, 2));
            this.add(mfunc);
            return mfunc;
        }
        public addFunctionAt(index:number, func:any, scope?:any, ...params:any[]):void
        {
            var mfunc = new MFunction();
            mfunc.setFunction(func);
            mfunc.setScope(scope);
            mfunc.setParams(Array.prototype.slice.call(arguments, 3));
            this.addAt(mfunc, index);
        }
        /**
         * Clear the buffer without calling functions
         */
        public clear():void
        {
            this._listFunctions = [];
        }
        /**
         * Clear the buffer by calling all function in the right order
         */
        public callAll(scope?:any):void
        {
            while(!this.isEmpty())
            {
                this.callNext(scope);
            }
        }
        public current():MFunction
        {
            return this._listFunctions[0];
        }
        /**
         * Gets next waiting function and removes it from the buffer list
         * @return MFunction if buffer isn't empty, null otherwise
         */
        public getNext():MFunction
        {
            return this._listFunctions.shift();
        }
        /**
         * Call next function
         * @param scope {optional} thisObject
         * @return {*}
         */
        public callNext(scope?:any):any
        {
            var mfunc = this.getNext();
            return mfunc.call(scope);
        }
    }

    export class MFunction
    {
        private _function:any;
        private _params:any;
        private _scope:any;
        constructor()
        {
            
        }
        public getFunction():any
        {
            return this._function;
        }
        public setFunction(value:any):void
        {
            this._function = value;
        }
        public getParams():any
        {
            return this._params;
        }
        public setParams(value:any):void
        {
            this._params = value;
        }
        public getScope():any
        {
            return this._scope;
        }
        public setScope(value:any):void
        {
            this._scope = value;
        }
        public call(scope?:any):any
        {
            if(!scope)
            {
                scope = this._scope;
            }
            return this._function.apply(scope, this._params!=null && this._params.length>0?this._params:null);
        }
        public toString():string
        {
            return "[MFunction params=\""+this._params+"\" scope=\""+this._scope+"\" function=\""+this._function+"\"]";
        }
    }
  


}
