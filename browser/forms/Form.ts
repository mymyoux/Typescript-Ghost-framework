///<module="mvc"/>
///<module="framework/ghost/utils"/>
///<module="framework/browser/io"/>
///<module="framework/ghost/events"/>
module ghost.browser.forms
{
    /**
     * Form managment
     */
    export class Form extends ghost.events.EventDispatcher
    {
        /**
         * CHANGE
         * @type {string}
         */
        public static EVENT_CHANGE:string = "change";
        public static EVENT_SUBMIT:string = "submit";
        public static EVENT_CANCEL:string = "cancel";
        public static EVENT_SUBMITTED:string = "submitted";
        public static EVENT_SUBMIT_ERROR:string = "submit_error";
        protected autosave:boolean = false;
        protected action:string;
        protected $form:JQuery;
        private fields:Field[];
        protected data:any;
        protected promises:any;
        public constructor(form?:any)
        {
            super();
            this.data = {};
            this.promises = {};
            if(form)
            {
                this.attachForm(form);
            }
        }
        public setAutosave(value:boolean):void
        {
            this.autosave = value;
        }
        public getAutosave():boolean
        {
            return this.autosave;
        }
       
        /**
         * Export data into object
         */
        public toObject(name?:string):any
        {
            if(!name)
                return this.data;
            var data:any = {};
            data[name] = this.data[name];
            return data;
        }
        public attachForm(form:any):void
        {
            var fields:Field[] = <Field[]>$(form).find("[data-field]").toArray().map((element:any):Field=>
            {
                var name:string = $(element).attr("data-field");
                var cls:any = this.getField(element);
                var field:Field;
                if(cls)
                {
                    field = new cls(name, this.data, element);
                    field.on(Field.EVENT_CHANGE, this.onChange, this, name);
                }
                return field;
            }).filter(function(element:any):boolean
            {
                if(element)
                {
                    return true;
                }
                return false;
            });
            this.fields = fields;
            var $forms:JQuery = $(form).find("form").addBack("form");
            this.$form = $forms;
            this.action = $forms.attr("action");
            $forms.on("submit", (event)=>
            {
                this.submit();
                event.stopPropagation();
                return false;
            });

            $forms.on("click", "[data-action]", (event)=>
            {
                //console.log("EVENT_TARGET",$(event.currentTarget).attr("data-action"),event.target, this);
                this[$(event.currentTarget).attr("data-action")]();
                //.submit();
            });
          /*   $forms.find("[data-field='cancel']").on("click", ()=>
            {
                this.cancel();
            });*/
        }
        protected cancel():void
        {
            this.trigger(Form.EVENT_CANCEL, this.toObject());
           /* if(!this.action)
            {
                log.warn("unable to cancel the form - no action attribute found for the form");
                return;
            }
            var data:any = {};
            data.action = "cancel";
            ghost.io.ajax({
                    url:this.action,
                    data:data,
                    retry:ghost.io.RETRY_INFINITE,
                    method:"POST"
                }).
            then(function(result:any):void
            {
                log.error(result);

            }, function(error:any):void
            {
                log.error(error);
            });*/
        }
        public submit():void
        {
            this.trigger(Form.EVENT_SUBMIT, this.toObject());
            if(!this.action)
            {
                log.warn("unable to autosave the form - no action attribute found for the form");
                return;
            }
            for(var p in this.promises)
            {
                if(this.promises[p])
                    this.promises[p].cancel();
            }
            this.promises = {}; 
            var data:any = this.toObject();
            var action:string = this.getAction();
            data.action = "submit";

            ghost.io.ajax({
                    url:action,
                    data:data,
                    retry:ghost.io.RETRY_INFINITE,
                    method:"POST"
                }).
            then((result:any):void=>
            {
                this.trigger(Form.EVENT_SUBMITTED, result);

            }, (error:any):void=>
            {
                this.trigger(Form.EVENT_SUBMIT_ERROR, error);
            });
        }   
        protected getAction():string
        {
            var action:string = this.action;
            if(action.indexOf(":")!=-1)
            {
                for(var p in this.data)
                {
                    action = action.replace(":"+p, this.data[p]);
                }
            }
             /*if(action.indexOf(":")!=-1)
             {
                debugger;
             }*/
            return action; 
        }

        protected onChange(value:string, name:string):void
        {
            this.trigger(Form.EVENT_CHANGE+":"+name, name, value);
            if(!this.autosave)
            {
                return;
            }
            if(this.promises[name])
            {
                this.promises[name].cancel();
            }
            var action:string = this.getAction();
             var data:any = this.toObject(name);
             data.action = "autosave";
             var ajax:any = ghost.io.ajax({
                    url:action,
                    data:data,
                    retry:ghost.io.RETRY_INFINITE,
                    method:"POST"
                }).
            then((result:any):void=>
            {
               delete this.promises[name];

            }, (error:any):void=>
            {
               delete this.promises[name];
                log.error(error);
            });
            this.promises[name] = ajax;
        }
        private getField(element):any
        {
            var cls:any;
            for(var p in ghost.browser.forms)
            {
                if(p == "Field")
                {
                    continue;
                }
                if(ghost.utils.Strings.endsWith(p, "Field"))
                {
                    if(ghost.browser.forms[p].match)
                    {
                        if(ghost.browser.forms[p].match(element))
                        {
                            return ghost.browser.forms[p];
                        }
                    }else
                    {
                        //default match function
                        //
                    }
                }
            }
           
            return cls;
        }
        public toRactive():any
        {
            return this.toObject();
        }
        public dispose():void
        {
            if(this.$form)
            {
                this.$form.off("submit");
                this.$form.find("[data-action]").off("click");
            }
            this.fields.forEach(function(field:Field)
            {
                field.dispose();
            });
            this.off();
            this.fields = null;
        }
    }
    export class Validator
    {
        public isValid(value:any):boolean
        {
            return true;
        }
    }
    export class TextValidator extends Validator
    {
        public isValid(field:Field):boolean
        {
            return !field.required || field.getValue().length>0;
        }
    }
    export class Field extends ghost.events.EventDispatcher
    {
        /**
         * CHANGE
         * @type {string}
         */
        public static EVENT_CHANGE:string = "change";

        public state:string;
        public required:boolean = false;
        protected $input:any;
        protected inputSelector:any;

        protected validators:Validator[];
        protected onChangeBinded:any;
        protected onChangeThrottle:ghost.utils.BufferFunction;

        public constructor( protected name:string, protected data:any, protected element:any)
        {
            super();
            this.onChangeBinded = this.onChange.bind(this);
            this.onChangeThrottle = ghost.utils.Buffer.throttle(this.triggerChange.bind(this), 500);
            this.validators = [];
            this.initializeInput();
            this.init();
            this.bindEvents();
            this.setInitialValue();
        }
        public addValidator(validator:Validator):void
        {
            this.validators.push(validator);
        }
        protected initializeInput():void
        {
            if(this.constructor && this.constructor["selector"])
            {
                this.inputSelector = this.constructor["selector"];
            }
            if(this.inputSelector)
            {
                this.$input = $(this.element).find(this.inputSelector).addBack(this.inputSelector);
            }
        }
        protected init():void
        {
            if($(this.element).attr("data-require") == "true")
            {
                this.required = true;
            }
        }
        protected setInitialValue():void
        {
            this.data[this.name] = this.getValue();
        }
        protected bindEvents():void
        {
            if(this.$input)
                this.$input.on("change", this.onChangeBinded);
        }
        public onChange(event:any):void
        {
            if( this.data[this.name]  != this.getValue())
            {
                this.data[this.name] = this.getValue();
                this.onChangeThrottle();
            }
        }
        protected triggerChange():void
        {
            this.trigger(Field.EVENT_CHANGE, this.data[this.name]);
        }
        public getValue():any
        {
            return this.$input?this.$input.val():null;
        }
        public isValid():boolean
        {
            var value:any = this.getValue();
            for(var p in this.validators)
            {
                if(!this.validators[p].isValid(this))
                {
                    return false;
                }
            }
            return true;
        }
        public dispose():void
        {
            if(this.$input)
                this.$input.off("change", this.onChangeBinded);
            this.onChangeThrottle.cancel();
        }
        public static match(element:any):boolean
        {
            var selector:string = this.prototype.constructor["selector"];
            if($(element).find(selector).addBack(selector).length)
            {
                return true;
            }
            return false;
        }
    }
    export class InputTextField extends Field
    {
        public static selector:string = "input[type='text']";
        public constructor(name:string, data:any, element:any)
        {
            super(name, data, element);
    
        }
        protected init():void
        {
            super.init();
            this.validators.push(new TextValidator());
        }
        protected bindEvents():void
        {
            super.bindEvents();
            if(this.$input)
                this.$input.on("keyup", this.onChangeBinded);
        }
        public dispose():void
        {
            super.dispose();
            if(this.$input)
                this.$input.off("keyup", this.onChangeBinded);
        }/*
        public static match(element:any):boolean
        {

            var selector:string = InputTextField.selector;
            if($(element).find(selector).addBack(selector).length)
            {
                return true;
            }
            return false;
        }*/
    }

    export class InputHiddenField extends Field
    {
        public static selector:string = "input[type='hidden']";
        public constructor(name:string, data:any, element:any)
        {
            super(name, data, element);
    
        }
        protected init():void
        {
            super.init();
            //this.validators.push(new TextValidator());
        }
        /*
        public static match(element:any):boolean
        {
            var selector:string = this.prototype.constructor["selector"];
            if($(element).find(selector).addBack(selector).length)
            {
                return true;
            }
            return false;
        }*/
    }


    export class InputListField extends Field
    {
        public static selector:string = "select";
        public constructor(name:string, data:any, element:any)
        {
            super(name, data, element);
    
        }
        protected init():void
        {
            super.init();
            this.validators.push(new TextValidator());
        }
        protected bindEvents():void
        {
            super.bindEvents();
          
        }
        public dispose():void
        {
            super.dispose();
         
        }
        /*
        public static match(element:any):boolean
        {
            var selector:string = InputListField.selector;
            if($(element).find(selector).addBack(selector).length)
            {
                return true;
            }
            return false;
        }*/
    }
}

