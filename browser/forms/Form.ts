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
        public static EVENT_ADD_ITEM:string = "add_item";
        public static EVENT_REMOVE_ITEM:string = "remove_item";
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
        protected _setInitialData:boolean = false;
        public constructor(form?:any, data?:any)
        {
            super();
            if(!data)
            {
                data = {};
                this._setInitialData = true;
            }
            this.data = data;
            this.promises = {};
            if(form)
            {
                this.attachForm(form);
            }
        }
        public static isSubList(element:any, listName:string, testSelf:boolean = true):boolean
        {
            var $item:JQuery = $(element);
            if(testSelf && $item.is("[data-list") && $item.attr("data-list")!= listName)
            {
                return true;
            }
            if($item.parents("form,[data-list]").attr("data-list") && $item.parents("form,[data-list]").attr("data-list")!= listName)
            {
                return true;
            }
            return false;
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
        public retrieveFields(form:any, listname?:string)
        {
            if(!listname)
            {
                listname = $(form).attr("data-list");
            }
            var fields:Field[] = <Field[]>$(form).find("[data-field],[data-list]").toArray().map((element:any):Field=>
            {
                var name:string = $(element).attr("data-field");
                var list:boolean = false;
                if(!name)
                {
                     name =$(element).attr("data-list");
                    list = true;
                }
                if(($(element).attr("data-field") || $(element).attr("data-list")) && $(element).parents("form,[data-list]").attr("data-list") && $(element).parents("form,[data-list]").attr("data-list")!=listname)
                {
                    //
                    return null;
                }
                var cls:any = list?ListField:Form.getField(element);
                var field:Field;
                if(cls)
                {
                    field = new cls(name, this.data, element, this._setInitialData, this["form"]?this["form"]:this);
                    field.on(Field.EVENT_CHANGE, this.onChange, this, name);
                    if(field instanceof ListField)
                    {
                        field.on(ListField.EVENT_ADD, this.onAdd, this, name, field);
                        field.on(ListField.EVENT_REMOVE, this.onRemove, this, name, field);
                    }
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
        }
        public attachForm(form:any):void
        {
            this.retrieveFields(form);
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
                var $this:JQuery = $(event.currentTarget);
                if($this.parents("[data-list],form").attr("data-list"))
                {
                    //inside data-list
                    return;
                }
                this[$this.attr("data-action")]();
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
            var object:any = this.toObject();
            var uniqueID:number = ghost.utils.Maths.getUniqueID();
            if(object)
            {
                object.__uniqueID = uniqueID;
            }
            this.trigger(Form.EVENT_SUBMIT, object);
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
                if(result)
                {
                    result.__uniqueID = uniqueID;
                }
                this.trigger(Form.EVENT_SUBMITTED, result);

            }, (error:any):void=>
            {
                if(error)
                {
                    error.__uniqueID = uniqueID;
                }
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
        public onAdd(name:string, list:ListField):void
        {
            this.trigger(Form.EVENT_ADD_ITEM, name, list);
        }
        public onRemove(name:string, list:ListField):void
        {
            this.trigger(Form.EVENT_REMOVE_ITEM, name, list);
        }
        private static getField(element):any
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

        public constructor( protected name:string, protected data:any, public element:any, protected _setInitialData:boolean, protected form:Form)
        {
            super();
            if(!this.data)
            {
                this.data = {};
            }
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
            /*if(this.data && this.data.tags)
            {
                
            }*/
            var category:string = $(this.element).attr("data-category") ||  $(this.element).parents("form,[data-category]").attr("data-category");
            if(category)
            {
                if(!this.data[category])
                {
                    this.data[category] = {};
                }
                this.data = this.data[category];
            }
        }
        protected setInitialValue():void
        {
            if(this._setInitialData || this.data[this.name] == undefined)
            {

                this.data[this.name] = this.getValue();
            }
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
            this.form = null;
        }
        public static match(element:any):boolean
        {
            var selector:string = this.prototype.constructor["selector"];
            if(!selector)
            {
                return false;
            }
            if($(element).find(selector).addBack(selector).length)
            {
                return true;
            }
            return false;
        }
    }
    export class ListField extends Field
    {
        public static selector:string = null;//"[data-list]";
        public static EVENT_ADD:string = "add_item";
        public static EVENT_REMOVE:string = "remove_item";
        private items:Field[];
        private max:number;
        private min:number;
        /**
         * Sublist name to precreate item data
         */
        private sublist:string[];
        public constructor(name:string, data:any, element:any, _setInitialData:boolean, form:Form)
        {
            this.items = [];
            this.min = this.max = -1;
            //this.sublist = [];
            super(name, data, element, _setInitialData, form);
        }
        public onChange(event:any):void
        {
            
            this.onChangeThrottle();
        }
        public init():void
        {

            //don't count sublist
            var i:number = 0;
            $(this.element).find("[data-item]").toArray().map((item:any, index:number)=>
            {
                var $item:JQuery = $(item);
                if(this.isSubList(item))
                {
                    return null;
                }
                this.addData(i);
                this.addItem(i, item);
                i++;
                //this.items.push(new ItemField(this.name, this.data[this.name][index], item, this._setInitialData, this.form));
            });
            this.max = parseInt($(this.element).attr("data-max"), 10) || -1;
            this.min = parseInt($(this.element).attr("data-min"), 10) || -1;

            $(this.element).on("click","[data-action]", (event)=>
            {
                    if(this.isSubList(event.currentTarget))
                {
                        return;
                }
                    this[$(event.currentTarget).attr("data-action")](event.currentTarget);
            });
            this.sublist = this.getListItem("[data-list]", this.element, false).toArray().map(function(item:any):string
            {
                    return $(item).attr("data-list");
            });
            if(!this.sublist.length)
            {
                    this.sublist = null;
            }
            
            while(!this.data[this.name] || this.data[this.name].length<this.min)
            {
                this.add(false);
            }
        }
        protected setInitialValue():void
        {
            if(this._setInitialData || this.data[this.name] == undefined) {
              //  
                this.data[this.name] = [];
            }
        }
        public add(focus:boolean = true):void
        {
            if(!this.data[this.name] || !this.data[this.name].push)
            {
                this.data[this.name] =  [];
            }
            
            //this.data[this.name].push({name:"test", tags:[]});
            this.trigger(ListField.EVENT_ADD);
            var index:number = this.addData();

            var $last:JQuery = this.getListItem("[data-item]", this.element).last();//$(this.element).find("[data-item]").last();
            this.addItem(index, $last);
            //this.items.push(new ItemField(this.name, this.data[this.name][this.data[this.name].length-1], $last, this._setInitialData, this.form));
            if(focus)
            {
                var $element:JQuery = $last.find("[data-focus]");
                if(!$element.length && $last.is("[data-focus]"))
                {
                    $element = $last;
                }

                $element.focus();
            }
        }
        protected addData(index?:number):number
        {
            if(!this.data[this.name] || !this.data[this.name].push)
            {
                this.data[this.name] =  [];
            }
            if(index == undefined)
            {
                index = this.data[this.name].length;
            }

            while(this.data[this.name].length<=index)
            {
                var newItem:any = {};
                if(this.sublist)
                {
                    
                    for(var p in this.sublist)
                    {
                        newItem[this.sublist[p]] = [];
                    }
                }
                this.data[this.name].push(newItem);
            }
            return index;
        }
        protected addItem(index:number, item:any)
        {
            this.items.push(new ItemField(this.name, this.data[this.name][index], item, this._setInitialData, this.form));
        }
        protected getListItem(selector:string, root?:any, testSelf:boolean = true):JQuery
        {
            if(!root)
            {
                root = this.element;
            }
            var $root:JQuery = $(root);
            return $root.find(selector).filter((index:number, item:any):boolean=>
            {
                return !this.isSubList(item, this.name, testSelf);
            });
        }
        protected isSubList(element:any, listName?:string, testSelf:boolean = true):boolean
        {
            if(!listName)
            {
                listName = this.name;
            }
           return Form.isSubList(element, listName, testSelf);
        }
        public remove(element:HTMLElement):void
        {
            var $item:JQuery = $(element).parents("data-item");
            var i:number = parseInt($item.attr("data-item"), 10);
            if(!isNaN(i))
            {
                this.data[this.name].splice(i, 1);
            }

            this.trigger(ListField.EVENT_REMOVE);
            this.getListItem("[data-item]", this.element).find("[data-focus]").focus();
        }
        public dispose():void
        {
            if(this.items)
            {
                this.items.forEach(function(field:ItemField)
                {
                    field.dispose();
                });
                this.items = null;
            }
            this.off();
            super.dispose();
        }
    }
    export class ItemField extends Field
    {
        public static selector:string = null;// "[data-list]";
        private fields:Field[];
        public constructor(name:string, data:any, element:any, _setInitialData:boolean, form:Form)
        {
            this.fields = [];
            super(name, data, element, _setInitialData, form);
        }
        public init():void
        {
            Form.prototype.retrieveFields.call(this, this.element, this.name);
        }
        protected onAdd(name:string, list:ListField):void
        {
            this.form.onAdd(name, list);
        }
        protected onRemove(name:string, list:ListField):void
        {
            this.form.onRemove(name, list);
        }
        public dispose():void
        {
            if(this.fields)
            {
                this.fields.forEach(function(field:Field)
                {
                    field.dispose();
                });
                this.fields = null;
            }
            this.off();
            super.dispose();
        }
        public setInitialValue():void
        {
        }
    }
    export class InputTextField extends Field
    {
        public static selector:string = "input[type='text']";

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
        }
    }
    export class TextareaField extends Field
    {
        public static selector:string = "textarea";

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
        }
    }

    export class InputHiddenField extends Field
    {
        public static selector:string = "input[type='hidden']";

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

