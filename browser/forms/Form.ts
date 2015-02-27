///<module="mvc"/>
///<module="framework/ghost/utils"/>
module ghost.browser.forms
{
    /**
     * Form managment
     */
    export class Form extends ghost.mvc.Model
    {
       
        /**
         * Export data into object
         */
        public toObject():any
        {
            return this.data;
        }
        public attachForm(form:any):void
        {
            var fields:Field[] = <Field[]>$(form).find("[data-field]").toArray().map((element:any):Field=>
            {
                var name:string = $(this).attr("data-field");
                var cls:any = this.getField(element);
                var field:Field;
                if(cls)
                {

                    field = new cls(name, this.data[name], element);
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
            log.info(fields);
        }
        private getField(element):any
        {
            var cls:any;
            for(var p in ghost.browser.forms)
            {
                if(ghost.utils.Strings.endsWith(p, "Field"))
                {
                    if(ghost.browser.forms[p].match && ghost.browser.forms[p].match(element))
                    {
                        return ghost.browser.forms[p];
                    }
                }
            }
           
            return cls;
        }
        public toRactive():any
        {
            return this.data;
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
    export class Field
    {
        public state:string;
        public required:boolean = false;

        protected validators:Validator[];

        public constructor( protected name:string, protected data:any, protected element:any)
        {
            this.init();
            this.bindEvents();
        }
        protected init():void
        {
            if($(this.element).attr("data-require") == "true")
            {
                this.required = true;
            }
        }
        protected bindEvents():void
        {

        }
        public getValue():any
        {
            return null;
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
    }
    export class InputTextField extends Field
    {
        public constructor(name:string, data:any, element:any)
        {
            super(name, data, element);

        }
        protected init():void
        {
            super.init();
            this.validators.push(new TextValidator());
        }
        public static match(element:any):boolean
        {
            var selector:string = "input[type='text']";
            if($(element).find(selector).addBack(selector).length)
            {
                return true;
            }
            return true;
        }
    }
}

