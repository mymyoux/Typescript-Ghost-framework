//convert
 /* ghost.browser.mvc.Model
*/
import {Model} from "browser/mvc/Model";
///<module="mvc"/>

    /**
     * Form managment
     */
    export class DynamicForm extends Model
    {
        /**
         * For each data will have a true or false value
         */
        public errors:any;
        /**
         * For each failed data will have an error message
         */
        public errorMessage:any;
        protected required:string[];
        private validated:any;

        /**
         * Constructor
         */
        public constructor()
        {
            super();
            this.errors = {};
            this.errorMessage = {};
            this.required = this.getRequired();
            this.validated = {};
        }

        /**
         * Valid the form. Will set all errors messages
         */
        public validate(name:string = null, testRequired:boolean = false):void
        {
            if(name)
            {
                var methodName:string = "valid"+name.substring(0, 1).toUpperCase()+name.substring(1);
                if(!this[methodName])
                {
                    console.warn("no validate function for "+name);
                    this.validated[name] = true;
                    return;
                }

                var result:any = this[methodName]();
                this.validated[name] = true;
                return result;
            }else
            {
                this.clearAllErrors();
                if(testRequired)
                {

                    var len:number = this.required.length;
                    for(var i:number=0; i<len; i++)
                    {
                        if(!this.data[this.required[i]] || this.data[this.required[i]].length ==0)
                        {
                            this.setError(this.required[i], "required");
                        }
                    }
                }
                var key:string;
                for(var p in this)
                {
                    if(p.substring(0,5) == "valid" && p!="validate")
                    {
                        key = p.substring(5).toLowerCase();
                        if(this.data[key] && this.data[key].length>0)
                        {
                            (<any>this[p])();
                        }
                    }
                }
                //all are validated 
                for(var q in this.data)
                {
                    this.validated[q] = true;
                }
            }
        }

        /**
         * Tests if a field is valid
         * @param name field's name
         * @param testRequired if the field is required and is empty, the method will return false
         * @returns {*}
         */
        public isValid(name:string = null, testRequired:boolean = false):boolean
        {
            if(name == null)
            {
                this.validate(null, testRequired);
                for(var p in this.errors)
                {
                    if(this.errors[p])
                    {
                        return false;
                    }
                }
                return true;
            }else
            {

                if(!this.validated[name])
                {
                    return false;
                }
                if(this.isError(name))
                {
                    return false;
                }
                if(testRequired)
                {
                    return (this.data[name] && this.data[name].length>0) || this.required.indexOf(name)==-1;
                }
                return true;
            }
        }

        /**
         * Clear an error
         * @param {string} name Removes an error
         */
        protected clearError(name:string):void
        {
            this.validated[name] = false;
            this.errors[name] = false;
        }
        protected clearAllErrors():void
        {
            this.validated = {};
            this.errors = {};
            this.errorMessage = {};
        }

        /**
         * Creates a new error message
         * @param {string} name Error's key
         * @param {string} message Error's message
         */
        protected setError(name:string, message:string):void
        {
            this.errors[name] = true;
            this.errorMessage[name] = message;
        }

        /**
         * Returns if a data is on error state
         * @param {string} name
         * @returns {boolean}
         */
        public isError(name:string):boolean
        {
            return this.errors[name] === true;
        }

        /**
         *
         * @param name
         * @returns {any}
         */
        public getError(name:string):string
        {
            return this.errorMessage[name];
        }

        /**
         * @inheritDoc
         */
        public set(key:string, value:any):void
        {
            if(!key || key.length==0)
            {
                throw new Error("Key must be defined - null given");
            }
            var methodName:string = "set"+key.substring(0,1).toUpperCase()+key.substring(1);

            if(this[methodName])
            {
                return this[methodName](value);
            }else
            {
                this.clearError(key);
                this.data[key] = value;
                if(value && value.length>0)
                    this.validate(key);
            }
            this._triggerUpdate(key);
        }

        /**
         * Same as #set() but doesn't valid data
         * @param key
         * @param value
         * @returns {any}
         */
        public setDirty(key:string, value:any):void
        {
            if(!key || key.length==0)
            {
                throw new Error("Key must be defined - null given");
            }
            var methodName:string = "set"+key.substring(0,1).toUpperCase()+key.substring(1);

            if(this[methodName])
            {
                return this[methodName](value);
            }else
            {
                this.clearError(key);
                this.data[key] = value;
                //TODO:set a variable to dirty
            }
            this._triggerUpdate(key);
        }

        /**
         * List of required fields
         */
        protected getRequired():string[]
        {
            return [];
        }

        /**
         * Export data into object
         */
        public toObject():any
        {
            return this.data;
        }
    }
