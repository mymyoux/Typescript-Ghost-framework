namespace ghost.core
{
    /**
     * Promise helper
     */
    export class Promise
    {
        /**
         * @protected
         * Array of success listeners
         */
        public _successFunction:Function[];
        /**
         * @protected
         * Array of failure listeners
         */
        public _failureFunction:Function[];
        /**
         * @protected
         * Array of progress listeners
         */
        public _progressFunction:Function[];
        /**
         * Failure data
         */
        private _reject:any[] = null;
        /**
         * Success data
         */
        private _success:any[] = null;
        /**
         * Specified if the promise has been rejected
         */
        private _rejected:boolean = false;
        /**
         * Specified if the promise has been resolved
         */
        private _resolved:boolean = false;

        /**
         * Constructor
         */
        constructor()
        {
            this._successFunction = [];
            this._failureFunction = [];
            this._progressFunction = [];
        }

        /**
         * Gets a promise instance. You should use this method instead of calling directly the constructor.
         * @returns {ghost.core.Promise}
         */
        public static create():Promise
        {
            //TODO:Reuse Promise pool
            return new Promise();
        }
        /**
         * Rejects the promise and dispatch data to every now and future failure listeners
         * @param data Data to transmit to listeners
         */
        public reject(...data:any[]):void
        {
            if(this._resolved || this._rejected)
            {
                throw new Error("You can't call twice reject or resolve function of a promise");
            }
            this._rejected = true;
            this._reject = data;
            this._progressFunction.length = 0;
            this.dispatch();
        }
        /**
         * Resolves the promise and dispatch data to every now and future success listeners
         * @param data Data to transmit to listeners
         */
        public resolve(...data:any[]):void
        {
            if(this._resolved || this._rejected)
            {
                throw new Error("You can't call twice reject or resolve function of a promise");
            }
            this._resolved = true;
            this._success = data;
            this._progressFunction.length = 0;
            this.dispatch();
        }

        public pending(...data:any[]):void
        {
            if(this._resolved || this._rejected)
            {
                throw new Error("You can't call progress method after rejecting or resolving a promise");
            }
            for(var p in this._progressFunction)
            {
                this._progressFunction[p].apply(this, data);
            }
        }
        /**
         * @protected
         * Dispatch data to listeners
         */
        public dispatch():void
        {
            if(this._resolved)
            {
                while(this._successFunction.length>0)
                {
                    try
                    {

                        this._successFunction.shift().apply(this, this._success);
                    }catch(error)
                    {
                        this._resolved = false;
                        this._rejected = true;
                        this._reject = [error];
                        this.dispatch();
                        return;
                    }
                }
            }else
            if(this._rejected)
            {
                while(this._failureFunction.length>0)
                {
                    this._failureFunction.shift().apply(this, this._reject);
                }
            }
            this.dispose();

        }

        /**
         * Registers listeners for success and/or failure
         * @param successFunction success listener
         * @param failureFunction failure listener
         * @return Promise instance
         */
        public then(successFunction:Function = null, failureFunction:Function = null, progressFunction:Function = null ):Promise
        {
            if(successFunction)
                this._successFunction.push(successFunction);
            if(failureFunction)
                this._failureFunction.push(failureFunction);
            if(progressFunction)
            {
                if(!this._resolved && !this._rejected)
                {
                    this._progressFunction.push(progressFunction);
                }
            }
            this.dispatch();
            return this;
        }
        /**
         * Registers listener for failure
         * @param failureFunction failure listener
         * @return Promise instance
         */
        public error( failureFunction:Function):Promise
        {
            if(failureFunction)
                this._failureFunction.push(failureFunction);
            this.dispatch();
            return this;
        }
        /**
         * Registers listener for success
         * @param successFunction success listener
         * @return Promise instance
         */
        public success( successFunction:Function):Promise
        {
            if(successFunction)
                this._successFunction.push(successFunction);
            this.dispatch();
            return this;
        }
        /**
         * Registers listener for progress
         * @param progressFunction progress  listener
         * @return Promise instance
         */
        public progress( progressFunction:Function):Promise
        {
            if(progressFunction && !this._resolved && this._rejected)
                this._progressFunction.push(progressFunction);
            return this;
        }

        /**
         * Specifies if the Promise has been rejected or resolved
         * @returns {boolean} true or false
         */
        public dispatched():boolean
        {
            return this._resolved || this._rejected;
        }
        public bind(promise:Promise):void
        {
            var _self:any = this;
            promise.success(function()
            {
                    _self.resolve.apply(_self,Array.prototype.slice.call(arguments));
            }).
            progress(function()
            {
                _self.pending.apply(_self,Array.prototype.slice.call(arguments)); 
            }).
            error(function()
            {
                _self.reject.apply(_self,Array.prototype.slice.call(arguments));
            });
        }
        public dispose():void
        {
          this._successFunction = null;  
          this._failureFunction = null;  
          this._progressFunction = null;  
          this._reject = null;  
          this._success = null;  
        }
    }
}
