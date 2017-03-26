///<file="MFunction"/>
///<file="BufferFunction"/>
namespace ghost.utils
{
    

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

  


}
