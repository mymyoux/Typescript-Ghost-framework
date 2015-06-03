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
            var $list:JQuery = $(form).find("[data-field],[data-list]");
            if($(form).attr("data-field") || $(form).attr("data-list"))
            {
                $list = $list.addBack();
            }
            var fields:Field[] = <Field[]>$list.toArray().map((element:any):Field=>
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

        protected onChange(value:string, input:Field, index:number, name?:string):void
        {
            debugger;
            if(!name && typeof index == "string")
            {
                name = <any>index;
                index = null;
            }
            this.trigger(Form.EVENT_CHANGE+":"+name, name, value);
            console.log(Form.EVENT_CHANGE+":"+name, name, value);
            if(!this.autosave)
            {
                return;
            }
            if(this.promises[name])
            {
                this.promises[name].cancel();
            }
            debugger;
            var action:string = this.getAction();
            var data:any;
            if(index != null)
            {
                data = {};
                data[name] = value;
                data.index = index;
            }else
            {
                data = this.toObject(name);
            }
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
        private getObjectID(data:any):string
        {
            if(data.id)
            {
                return data.id;
            }
            for(var p in data)
            {
                if(p.substring(0, 3) == "id_")
                {
                    return data[p];
                }
            }
        }
        public onAdd(newItem:ItemField, name:string, list:ListField, itemfield?:ItemField):void
        {
            this.trigger(Form.EVENT_ADD_ITEM, name, list);
            if(!this.autosave)
            {
                return;
            }
            if(this.promises[name])
            {
                this.promises[name].cancel();
            }
            debugger;
            var action:string = this.getAction();
            var data:any = {
                name:name};//this.toObject(name);
            data.action = "add";
            if(itemfield)
            {
                data.item =
                {
                    name:itemfield.name,
                    id:this.getObjectID(itemfield.data)
                };
            }
            var ajax:any = ghost.io.ajax({
                url:action,
                data:data,
                retry:ghost.io.RETRY_INFINITE,
                method:"POST"
            }).
                then((result:any):void=>
                {
                    delete this.promises[name];
                    if(result.id != undefined)
                    {
                        newItem.setID(result.id);
                    }

                }, (error:any):void=>
                {
                    delete this.promises[name];
                    log.error(error);
                });
            this.promises[name] = ajax;
        }
        public onRemove(name:string, list:ListField, itemfield?:ItemField):void
        {
            this.trigger(Form.EVENT_REMOVE_ITEM, name, list);
            if(!this.autosave)
            {
                return;
            }
            if(this.promises[name])
            {
                this.promises[name].cancel();
            }
            debugger;
            var action:string = this.getAction();
            var data:any = {
                name:name};//this.toObject(name);
            data.action = "remove";
            if(itemfield)
            {
                data.item =
                {
                    name:itemfield.name,
                    id:this.getObjectID(itemfield.data)
                };
            }
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
        protected data_saved:any;
        protected validators:Validator[];
        protected onChangeBinded:any;
        protected onChangeThrottle:ghost.utils.BufferFunction;

        public constructor( public name:string, public data:any, public element:any, protected _setInitialData:boolean, protected form:Form)
        {
            super();
            if(!this.data)
            {
                this.data = {};
            }
            try
            {

                this.data_saved = ghost.utils.Objects.clone(this.data, "data", true);
            }catch(error)
            {
                debugger;
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
            {

                this.$input.on("change", this.onChangeBinded);

            }
        }
        public onChange(event:any):void
        {

        /*    if( this.data[this.name]  != this.getValue())
            {
                this.data[this.name] = this.getValue();
                this.onChangeThrottle();
            }*/
            this.data[this.name] = this.getValue();
            console.log(this.name, this.data[this.name], this.data_saved[this.name]);
            if(!ghost.utils.Objects.deepEquals(this.data_saved[this.name],this.data[this.name]))
            {
                debugger;
                this.data_saved[this.name] = ghost.utils.Objects.clone(this.data[this.name], null, true);

                this.onChangeThrottle();
            }


            //dispatch event change for item

        //    this.trigger(Field.EVENT_CHANGE, this.data,
        }
        protected triggerChange():void
        {
            this.trigger(Field.EVENT_CHANGE, this.data[this.name], this);
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
        /**
         * Item list
         */
        private items:Field[];
        /**
         * Max items
         */
        private max:number;
        /**
         * Min shown items
         */
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
        public onChange(data:any, itemField?:ItemField):void
        {
           // this.onChangeThrottle(data, itemField);
            this.triggerChange(data, itemField);
        }
        protected triggerChange (data?:any, itemField?:ItemField) {
            debugger;
            this.trigger(Field.EVENT_CHANGE, data, itemField.getItemIndex());
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

            while(this.length()<this.min)
            {
                this.add(false);
            }
            this.checkMinStatus();
            this.checkMaxStatus();
        }
        protected length():number
        {
            return this.data[this.name]?this.data[this.name].length:0;
        }
        /**
         * Check if the list has reach the maximum number of items
         */
        protected checkMaxStatus():void
        {
            if(this.isMaxReached())
            {
                $(this.element).addClass("max_reached");
            }else
            {
                if(this.max != -1)
                {
                    $(this.element).removeClass("max_reached");
                }
            }
        }
        protected checkMinStatus():void
        {
            if(this.isMinReached())
            {
                $(this.element).addClass("min_reached");
            }else
            {
                if(this.max != -1)
                {
                    $(this.element).removeClass("min_reached");
                }
            }
        }
        protected isMaxReached():boolean
        {
            return this.max!=-1 && this.length() >= this.max;
        }
        protected isMinReached():boolean
        {
            return this.min!=-1 && this.length() <= this.min;
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
            if(this.isMaxReached())
            {
                return;
            }
            if(!this.data[this.name] || !this.data[this.name].push)
            {
                this.data[this.name] =  [];
            }
            debugger;

            //this.data[this.name].push({name:"test", tags:[]});

            var index:number = this.addData();

            var $last:JQuery = this.getListItem("[data-item]", this.element).last();//$(this.element).find("[data-item]").last();
            var item = this.addItem(index, $last);
            this.trigger(ListField.EVENT_ADD, item);
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
            this.checkMaxStatus();
            this.checkMinStatus();
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
        protected addItem(index:number, item:any):ItemField
        {
            var lastItem:any = this.getListItem("[data-item]").eq(index);

            var itemField:ItemField = new ItemField(this.name, this.data[this.name][index], lastItem, this._setInitialData, this.form);
            itemField.on(Field.EVENT_CHANGE, this.onChange, this, itemField);
            this.items.push(itemField);
            return itemField;
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
            if(this.isMinReached())
            {
                //no remove
                return;
            }
            var $item:JQuery = $(element).parents("[data-item]");
            var i:number = parseInt($item.attr("data-item"), 10);
            if(!isNaN(i))
            {
                this.data[this.name].splice(i, 1);
            }

            this.trigger(ListField.EVENT_REMOVE);
            this.getListItem("[data-item]", this.element).find("[data-focus]").focus();
            this.checkMinStatus();
            this.checkMaxStatus();
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
        private id_name:string;
        private change_timeout:number = -1;
        public constructor(name:string, data:any, element:any, _setInitialData:boolean, form:Form)
        {
            super(name, data, element, _setInitialData, form);
            this.fields = [];
        }
        public getID():string
        {
            return this.data[this.id_name];
        }
        public hasID():boolean
        {
            return this.getID() != null;
        }
        public setID(id:string):void
        {
            this.data[this.id_name] = id;
        }
        public getItemIndex():number
        {
            return parseInt($(this.element).attr("data-item"), 10);
        }
        protected triggerChange () {
            this.trigger(Field.EVENT_CHANGE, this.data);
        }
        public init():void
        {
            Form.prototype.retrieveFields.call(this, this.element, this.name);
            this.fields.forEach(function(item:Field):void
            {
                item.on(Field.EVENT_CHANGE, this.onChange, this);
            }, this);
            this.id_name = $(this.element).attr("data-id-name")?$(this.element).attr("data-id-name"):"id";
        }
        protected onAdd(newItem:ItemField, name:string, list:ListField):void
        {
            this.form.onAdd(newItem, name, list, this);
        }
        protected onRemove(name:string, list:ListField):void
        {
            if(this.change_timeout != -1)
            {
                clearTimeout(this.change_timeout);
            }
            this.form.onRemove(name, list, this);
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
        public onChange(event:any):void
        {

            /*    if( this.data[this.name]  != this.getValue())
             {
             this.data[this.name] = this.getValue();
             this.onChangeThrottle();
             }*/
            this.data[this.name] = this.getValue();
            if(!ghost.utils.Objects.deepEquals(this.data_saved[this.name],this.data[this.name]))
            {
                debugger;
                this.data_saved[this.name] = ghost.utils.Objects.clone(this.data[this.name], null, true);
                this.delayChange();
            }
        }
        private delayChange():void
        {
            if(this.change_timeout != -1)
            {
                clearTimeout(this.change_timeout);
            }
            if(this.hasID())
            {
                this.change_timeout = -1;
                this.onChangeThrottle();
            }else
            {
                this.change_timeout = setTimeout(this.delayChange.bind(this), 500);
            }
        }
    }
    export class InputTextField extends Field
    {
        public static selector:string = "input[type='text']";
        /*public constructor( public name:string, protected data:any, public element:any, protected _setInitialData:boolean, protected form:Form)
        {
            super(name, data, element, _setInitialData, form);
        }*/
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
    export class InputFileField extends Field
    {
        public static selector:string = "[data-type='picture']";
        private inputFile:HTMLInputElement;
        private preview:HTMLImageElement;
        protected init():void
        {
            super.init();
            if(!$(this.element).find("input[type='file']").length)
            {
                $(this.element).append('<input type="file" name="'+$(this.element).attr("data-field")+'">');
            }
            this.inputFile = $(this.element).find("input[type='file']").get(0);
            this.preview = $(this.element).find("[data-preview]").get(0);
       //     this.validators.push(new TextValidator());
        }
        protected bindEvents():void
        {
            super.bindEvents();
            if(this.$input)
            {
                this.$input.on("change", (event)=>
                {
                    ghost.browser.io.FileAPI.loadFile(this.inputFile).
                        then((event:ProgressEvent):void=>
                        {
                            if(!event)
                            {
                                //empty file
                                if(this.preview)
                                {
                                    this.preview.src = null;
                                    this.$input.removeClass("preview");
                                }
                            }
                              var file:FileReader = <FileReader>event.currentTarget;
                              if(this.preview)
                              {
                                  this.preview.src = file.result;
                                  this.$input.addClass("preview");
                              }
                            ghost.io.ajax(
                                {
                                    url:"/candidate/models/cv",
                                    method:"POST",
                                    data:{picture:file.result}
                                }).then(function(data:any):void
                                {
                                    debugger;
                                }, function(error:any):void
                                {
                                    debugger;
                                });

                        }, (error:any):void=>
                        {
                            if(this.preview)
                            {
                                this.preview.src = null;
                                this.$input.removeClass("preview");
                            }
                        });
                });
                //this.$input.on("keyup", this.onChangeBinded);
                this.$input.on("click", (event)=>
                {
                    if($(event.target).get(0) === this.inputFile)
                    {
                        return;
                    }
                    $(this.inputFile).trigger("click");
                });
            }
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

