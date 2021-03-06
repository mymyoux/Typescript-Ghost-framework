//convert
 /*(ghost.browser.mvc.Model.*/
import {Model} from "browser/mvc/Model";
//convert
 /* ghost.browser.io.FileAPI.*/
import {FileAPI} from "browser/io/FileAPI";
//convert
 /* ghost.browser.apis.GMap.*/
import {GMap} from "browser/apis/GMap";
//convert
 /* ghost.utils.Objects.*/
import {Objects} from "ghost/utils/Objects";
//convert
 /*(ghost.utils.Strings.*/
import {Strings} from "ghost/utils/Strings";
//convert
 /* ghost.utils.Maths.*/
import {Maths} from "ghost/utils/Maths";
//convert
 /* ghost.events.EventDispatcher
*/
import {EventDispatcher} from "ghost/events/EventDispatcher";
//convert
 /*(ghost.utils.Arrays.*/
import {Arrays} from "ghost/utils/Arrays";
//convert
 /* ghost.utils.Buffer.*/
import {Buffer} from "ghost/utils/Buffer";
//convert
 /*:ghost.utils.BufferFunction;*/
import {BufferFunction} from "ghost/utils/BufferFunction";
//convert
 /* ghost.utils.Classes.*/
import {Classes} from "ghost/utils/Classes";
///<module="mvc"/>
///<module="apis"/>
///<module="framework/ghost/utils"/>
///<module="framework/browser/io"/>
///<module="framework/ghost/events"/>

//Gérer le choix par autocomplete (tjs id (du model auquel on lie pas de la relation)? )
//comme ça l'id de la relation ne change pas c'est + simple
//gérer la disparition de la liste ? et là les mixins manquent :(

//verifier les images
//PHP :'(


import {ajax} from "browser/io/Ajax";

import {RETRY_INFINITE} from "browser/io/Ajax";
    var formTypes:any = {};

    export class CancelableEvent
    {
        public type:string;
        private _cancelled:boolean;
        public constructor()
        {
            this._cancelled = false;
        }
        public cancel():void
        {
            this._cancelled = true;
        }
        public cancelled():boolean
        {
            return this._cancelled;
        }
    }

    /**
     * Form management
     */
    export class Form extends EventDispatcher
    {
        public static fieldCrop:InputFileField;
        /**
         * CHANGE
         * @type {string}
         */
        public static EVENT_CHANGE:string = "change_form";
        public static EVENT_ADD_ITEM:string = "add_item";
        public static EVENT_REMOVE_ITEM:string = "remove_item";
        public static EVENT_SUBMIT:string = "submit";
        public static EVENT_CANCEL:string = "cancel";
        public static EVENT_SUBMITTED:string = "submitted";
        public static EVENT_SUBMIT_ERROR:string = "submit_error";
        private static customClasses:any[] = [];
        private static customListClasses:any[] = [];

        public static instances:Form[] = [];
        public static debug():void
        {
            console.log(Form.instances);
        }


        protected autosave:boolean = false;
        protected action:string;
        protected $form:JQuery;
        private fields:Field[];
        public data:any;
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
            Form.instances.push(this);
           // window["f"] = this;
        }

        public get$Form():JQuery
        {
            return this.$form;
        }
        public prefix():string
        {
            if(this.$form.attr("data-prefix"))
            {
                return this.$form.attr("data-prefix");
            }
            return null;
        }
        public static isSubList(element:any, listName:string, testSelf:boolean = true):boolean
        {
            var $item:JQuery = $(element);
            if(testSelf && $item.is("[data-list]") && $item.attr("data-list")!= listName)
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
            var prefix:string = this.prefix();
            if(prefix)
            {
                var tmp:any = {};
                tmp[prefix] = data;
                data = tmp;
            }
            return data;
        }
        public retrieveFields(form:any, listname?:string)
        {
            if(this.fields) {
                this.fields.forEach(function(field:Field)
                {
                    field.off();
                });
            }
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
                var cls:any = list?Form.getFieldList(element):Form.getField(element);
                var field:Field;
                if(cls)
                {
                    field = new cls(name, this.data, element, this._setInitialData, this["form"]?this["form"]:this, this);
                    field.on(Field.EVENT_CHANGE, this.onChange, this, name);
                    field.on(Field.EVENT_AUTOCOMPLETE, this.onAutocomplete, this, name);
                    if(field instanceof ListField)
                    {
                        field.on(ListField.EVENT_ADD, this.onAdd, this, name, field);
                        field.on(ListField.EVENT_REMOVE, this.onRemove, this, name, field);
                    }

                    field.initialize();
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
            if(this instanceof ItemField && (!fields || fields.length==0))
            {
                debugger;
            }
            this.fields = fields;
        }
        public getField(name:string):Field
        {
            var fields:Field[] = this.fields.filter(function(field:Field)
            {
                return field.name == name;
            }, this);
            if(!fields.length)
            {
                return null;
            }
            return fields[0];
        }
        public getFields():Field[]
        {
            return this.fields;
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
                debugger;
                this[$this.attr("data-action")](event.currentTarget);
                //.submit();
            });
            if(this.$form.attr("data-autofocus") == "false")
            {
                return;
            }
           // console.log($(form).find("[data-focus]").eq(0));
           // debugger;
           // $(form).find("[data-focus]").eq(0).focus();
            setTimeout(()=>
            {
                if (null === this.fields) return;

                var len:number = this.fields.length;
                for(var i:number=0; i < len ;i++)
                {
                    if(!this.fields[i].getValue())
                    {
                        this.fields[i].focus();
                        return;
                    }
                }
                //$(form).find("[data-field]").eq(0).focus();
            }, 0);

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
                //log.warn("unable to cancel the form - no action attribute found for the form");
                return;
            }
            var data:any = {};
            data.action = "cancel";
            ajax({
                    url:this.action,
                    data:data,
                    retry:RETRY_INFINITE,
                    method:"POST"
                }).
            then(function(result:any):void
            {
                //log.error(result);

            }, function(error:any):void
            {
                //log.error(error);
            });*/
        }

        /**
         * Return error fields or true if no error
         * @returns {string[]|boolean}
         */
        public validate():Field[]|boolean
        {
            var errors:Field[] = [];

            for(var p in this.fields){

                if(!this.fields[p].validate())
                {
                    var error:Field|Field[] = this.fields[p].getErrorFields();
                    if(error instanceof Field)
                    {
                        errors.push(error);
                    }
                    errors = errors.concat(<Field[]>error);
                }
            }

            return errors.length?errors:true;
        }
        public submit():void
        {
            var object:any = this.toObject();
            var uniqueID:number = Maths.getUniqueID();
            if(object)
            {
                object.__uniqueID = uniqueID;
            }
            if(this.$form.attr("data-validate")!= undefined)
            {
                var error:string;
                var focused:boolean = false;
                for(var p in this.fields){

                    if(!this.fields[p].validate())
                    {
                       error = this.fields[p].getError();
                        if(!error)
                        {
                            debugger;
                        }
                        console.error("An error occured when form submitted:", error, p , this.fields[p]);
                        if(!focused)
                        {
                            this.fields[p].focus();
                            focused = true;
                        }

                    }
                }
                if(error)
                {
                    return;
                }
            }
            var event:CancelableEvent = new CancelableEvent();
            event.type = Form.EVENT_SUBMIT;
            this.trigger(Form.EVENT_SUBMIT, object, event);
            if(event.cancelled())
            {
                return;
            }
            if(!this.action)
            {
                //log.warn("unable to autosave the form - no action attribute found for the form");
                return;
            }
            for(var p in this.promises)
            {
                if(this.promises[p])
                    this.promises[p].cancel();
            }
            this.promises = {};
            var data:any = this.toObject();
            if (typeof data.toObject === 'function')
            {
                var tmp:any = data.toObject();
                if(tmp)
                {
                    data = tmp;
                }
            }
            var action:string = this.getAction();
            data.action = "submit";
            console.log("SUBMIT", this, data);
            ajax({
                    url:action,
                    data:data,
                    retry:RETRY_INFINITE,
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
        public getAction():string
        {
            if(!this.action)
            {
                return null;
            }
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
        protected onAutocomplete(value:IChangeData[]):void
        {
            var name:string = "___autocomplete"+this._getDataItemName(value);
            if(this.promises[name])
            {
                this.promises[name].cancel();
            }
            var action:string = this.getAction();
            var data:any = {action:"autocomplete",
                value: this._getDataItemData(value)
            };
            var prefix:string = this.prefix();
            if(prefix)
            {
                var tmp:any = {};
                tmp[prefix] = data;
                data = tmp;
            }
            // add user_id
            if (this.data && this.data.id_user)
                data.id_user = this.data.id_user;

            var req:any = ajax({
                url:action,
                data:data,
                retry:3,
                method:"POST"
            }).
                then((result:any):void=>
                {
                    delete this.promises[name];
                    value[0].input.setAutocomplete(result.autocomplete);
                    this.data.trigger(Model.EVENT_CHANGE);
                    console.log(value[value.length-1].name);


                }, (error:any):void=>
                {
                    debugger;
                    delete this.promises[name];
                });

            this.promises[name] = req;
        }
        protected additionalData():any
        {
            return null;
        }
        protected onChange(value:IChangeData[]):void
        {
            var name:string = this._getDataItemName(value);
            this.trigger(Form.EVENT_CHANGE+":"+name, name, value);
            if(value[0].input && value[0].input.constructor && value[0].input.constructor["force_trigger"])
            {
                this.data.trigger(Model.EVENT_CHANGE);
            }
            console.log(Form.EVENT_CHANGE+":"+name, name, value);
            if(!this.autosave)
            {
                return;
            }

            if(this.promises[name])
            {
                this.promises[name].cancel();
            }
            var action:string = this.getAction();
            if(!action)
            {
                setTimeout(()=>
                {
                    this.onChange(value);
                }, 500);
                return;
            }
            var data:any = {action:"autosave",
            value: this._getDataItemData(value)
            };
            var add:any = this.additionalData();
            if(add)
            {
                for(var p in add)
                {
                    data[p] = add[p];
                }
            }
            var prefix:string = this.prefix();
            if(prefix)
            {
                var tmp:any = {};
                tmp[prefix] = data;
                data = tmp;
            }

            // add user_id
            if (this.data && this.data.id_user)
                data.id_user = this.data.id_user;

            var req:any = ajax({
                    url:action,
                    data:data,
                    retry:RETRY_INFINITE,
                    method:"POST"
                }).
            then((result:any):void=>
            {
               delete this.promises[name];
                if(value[0] && value[0].input && value[0].input["handleAutosave"])
                {
                    value[0].input["handleAutosave"](result);
                }

            }, (error:any):void=>
            {
               delete this.promises[name];
            });

            this.promises[name] = req;
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
        private _getDataItemName(dataItems:IChangeData[]):string
        {
            return dataItems.reduce(function(previous:any, item:IChangeData):string
            {
                if(previous)
                {
                    previous = "/"+previous;
                }else
                {
                    previous = "";
                }
                return item.name+(item.id != undefined?item.id:"")+previous;
            }, null);
        }
        private _getDataItemData(dataItems:IChangeData[]):any
        {
            return dataItems.map(function(item:IChangeData):IChangeData
            {
                var data:any = {};
                for(var p in item)
                {
                    if(p!="input" && p!="list" && item.hasOwnProperty(p))
                    {
                        data[p] = item[p];
                    }
                }/*
                if(item.id != undefined)
                {
                    data.id = item.id;
                }
                if(item.name)
                {
                    data.name = item.name;
                }
                if(item.value)
                {
                    data.value = item.value;
                }*/
                return data;
            });
        }
        public onAdd(dataItems:IChangeData[]):void
        {
            console.log("on add");
            var name:string = this._getDataItemName(dataItems);
            this.trigger(Form.EVENT_ADD_ITEM, dataItems);

            if(!this.autosave)
            {
                return;
            }
            var item:ItemField = <ItemField>dataItems[0].input;

            var action:string = this.getAction();
            if(!action)
            {
                setTimeout(()=>
                {
                    this.onAdd(dataItems);
                }, 500);
                return;
            }

            var data:any = {
                action:"add",
                value:this._getDataItemData(dataItems)
            };
            var prefix:string = this.prefix();
            if(prefix)
            {
                var tmp:any = {};
                tmp[prefix] = data;
                data = tmp;
            }

            // add user_id
            if (this.data && this.data.id_user)
                data.id_user = this.data.id_user;

            var req:any = ajax({
                url:action,
                data:data,
                retry:RETRY_INFINITE,
                method:"POST"
            }).
                then((result:any):void=>
                {
                    delete this.promises[name];
                    if(result.id != undefined)
                    {
                        item.setID(result.id);
                    }

                }, (error:any):void=>
                {
                    delete this.promises[name];
                    //log.error(error);
                });
            this.promises[name] = req;
        }
        public onRemove(dataItems:IChangeData[]):void
        {
            var name:string = this._getDataItemName(dataItems);
            this.trigger(Form.EVENT_REMOVE_ITEM, dataItems);
            if(!this.autosave)
            {
                return;
            }
            if(this.promises[name])
            {
                this.promises[name].cancel();
            }
            var data:any = {
                action:"remove",
                value:this._getDataItemData(dataItems)
            };
            var prefix:string = this.prefix();
            if(prefix)
            {
                var tmp:any = {};
                tmp[prefix] = data;
                data = tmp;
            }
            // add user_id
            if (this.data && this.data.id_user)
                data.id_user = this.data.id_user;

            var action:string = this.getAction();
            if(!action)
            {
                setTimeout(()=>
                {
                    this.onRemove(dataItems);
                }, 500);
                return;
            }
            var req:any = ajax({
                url:action,
                data:data,
                retry:RETRY_INFINITE,
                method:"POST"
            }).
                then((result:any):void=>
                {
                    delete this.promises[name];

                }, (error:any):void=>
                {
                    debugger;
                    delete this.promises[name];
                    //log.error(error);
                });
            this.promises[name] = req;
        }
        public static addFieldClass(cls):void
        {
            var name:string = Classes.getName(cls);
            if(name && name.indexOf("ListField")!=-1)
            {
                if(Form.customListClasses.indexOf(cls) == -1)
                    Form.customListClasses.push(cls);

                return;
            }
            if(Form.customClasses.indexOf(cls) == -1)
                Form.customClasses.push(cls);
        }
        public static removeFieldClass(cls):void
        {
            var name:string = Classes.getName(cls);
            if(name && name.indexOf("ListField")!=-1)
            {
                Form.customListClasses.splice(name.indexOf("ListField"), 1);

                return;
            }
            if(Form.customClasses.indexOf(cls) != -1)
            {
                Form.customClasses.splice(Form.customClasses.indexOf(cls), 1);
            }
        }
        public static getFieldList(element):any
        {
            var cls:any = ListField;
            for(var p in Form.customListClasses)
            {
                if(Form.customListClasses[p].match)
                {
                    if(Form.customListClasses[p].match(element))
                    {
                        return Form.customListClasses[p];
                    }
                }
            }
            return cls;
        }
        public static getField(element):any
        {
            var cls:any;
            for(var p in Form.customClasses)
            {
                if(Form.customClasses[p].match)
                {
                    if(Form.customClasses[p].match(element))
                    {
                        return Form.customClasses[p];
                    }
                }
            }
            for (var p in formTypes)
            {
                if(p == "Field")
                {
                    continue;
                }
                if(Strings.endsWith(p, "Field"))
                {
                    if (formTypes[p].match)
                    {
                        if (formTypes[p].match(element))
                        {
                            return formTypes[p];
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
                this.$form.off("click", "[data-action]");
                this.$form.off("submit");
                this.$form.find("[data-action]").off("click");
            }
            if(this.fields) {
                this.fields.forEach(function(field:Field)
                {
                    field.dispose();
                });
                this.off();
                this.fields = null;
            }
            var index:number = Form.instances.indexOf(this);
            if(index != -1)
            {
                Form.instances.splice(index, 1);
            }
        }
    }
    export class Validator
    {
        protected error:string;
        public getError():string
        {
            return this.error;
        }
        public isValid(field:Field):boolean
        {
            this.error = this.validate(field);
            return this.error == null;
        }
        public validate(field:Field):string
        {
            return null;
        }
    }
    export class TextValidator extends Validator
    {
        public validate(field:Field):string{
            if(!field.required)
            {
                return null;
            }

            if(field.getValue().length>0)
            {
                return null;
            }
            return "required";
        }
    }
    export class CheckboxValidator extends Validator
    {
        public validate(field:Field):string{
            if(!field.required)
            {
                return null;
            }

            if(field.getValue()==1)
            {
                return null;
            }
            return "required";
        }
    }

    export class Field extends EventDispatcher
    {
        /**
         * CHANGE
         * @type {string}
         */
        public static EVENT_CHANGE:string = Form.EVENT_CHANGE;
        public static EVENT_AUTOCOMPLETE:string = "autocomplete";
        public static EVENT_VALIDATE:string = "validate";
        public static EVENT_BLUR:string = "blur";
        private static KEY_UP:number = 38;
        private static KEY_DOWN:number = 40;
        private static KEY_ENTER:number = 13;
        private static KEY_ESCAPE:number = 27;
        private static KEYS_AUTOCOMPLETION:number[] = [Field.KEY_UP, Field.KEY_DOWN, Field.KEY_ENTER, Field.KEY_ESCAPE];

        public state:string;
        public required:boolean = false;
        protected autocomplete:boolean;
        protected $input:any;
        protected inputSelector:any;
        public data_saved:any;
        protected validators:Validator[];
        protected onChangeBinded:any;
        protected onBlurBinded:any;
        protected onFocusBinded:any;
        protected onKeyBinded:any;
        protected onChangeThrottle:BufferFunction;
        protected onAutocompleteThrottle:BufferFunction;
        protected itemAutocomplete:ItemAutocomplete;
        public prefix_autocomplete:string = "";
        protected additionals:string[];
        protected useValidator:boolean;
        protected $error:JQuery;
        protected error:string;
       // protected autocompleted:boolean;

        public constructor( public name:string, public data:any, public element:any, protected _setInitialData:boolean, protected form:Form, protected parent:Field|Form)
        {
            super();
            if(!this.useValidator)
                this.useValidator = false;
            if(!this.data)
            {
                this.data = {};
            }
            try
            {

                this.data_saved = Objects.clone(this.data, "data", true);
            }catch(error)
            {
                debugger;
            }
            this.onChangeBinded = this.onChange.bind(this);
            this.onBlurBinded = this.onBlur.bind(this);
            this.onFocusBinded = this.onFocus.bind(this);
            this.onKeyBinded = this.onKeyDown.bind(this);
            this.onChangeThrottle = Buffer.throttle(this.triggerChange.bind(this), 500);
            this.validators = [];


        }
        public get$Input():JQuery
        {
            return this.$input;
        }
        public initialize():void
        {
            this.initializeInput();
            this.init();
            this.bindEvents();
            this.setInitialValue();
            this.initialValidate();
        }
        public focus():void
        {
            if(this.$input)
                this.$input.focus();
        }
        public focusAutocomplete(index:number):void
        {
            for(var p in this.data[this.prefix_autocomplete+"autocompletion"])
            {
                this.data[this.prefix_autocomplete+"autocompletion"][p].selected = false;
            }
            if(this.data[this.prefix_autocomplete+"autocompletion"][index])
            {
                this.data[this.prefix_autocomplete+"autocompletion"][index].selected = true;
            }
            if(this.form.data && this.form.data.trigger)
                this.form.data.trigger(Model.EVENT_CHANGE);
        }
        public chooseAutocomplete(index:number):void
        {
            if(this.data[this.prefix_autocomplete+"autocompletion"] && this.data[this.prefix_autocomplete+"autocompletion"].length>index)
            {
                console.log("autocomplete");
                var value:any;
                for(var p in this.data[this.prefix_autocomplete+"autocompletion"][index])
                {
                    if(p == "id")
                    {
                        continue;
                    }
                    value = this.data[this.prefix_autocomplete+"autocompletion"][index][p];
                    if(value != null)
                    {
                        this.data[p] = value;
                    }
                }
                this.data[this.prefix_autocomplete+"autocompleted"] = true;
                this.data_saved[this.name] = Objects.clone(this.data[this.name], null, true);
                this.onChangeThrottle();
                //this.data[this.name] = this.data["autocompletion"][index]["name"];
                this.form.data.trigger(Model.EVENT_CHANGE);
            }
        }


        public setAutocomplete(data:any):void
        {

            if(this.$input)
            {
                if(!this.$input.is(":focus"))
                {

                    return this.clearAutocomplete();
                }
            }
            if(data)
            {

                var current:any = {};
                current[this.name] = this.getValue();
                for(var p in data)
                {
                    if(data[p][this.name] == current[this.name])
                    {
                        data.splice(p, 1);
                        break;
                    }
                }
                this.data[this.prefix_autocomplete+"autocompletion"] = [current].concat(data);
                this.itemAutocomplete.resetSelected();
            }

        }
        public addValidator(validator:Validator):void
        {
            this.validators.push(validator);
            this.useValidator = true;
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
            if($(this.element).attr("data-autocomplete") != undefined)
            {
                this.prefix_autocomplete = $(this.element).attr("data-autocomplete");
                this.autocomplete = true;
                this.data[this.prefix_autocomplete+"autocompletion"]=[];
                this.data[this.prefix_autocomplete+"autocompleted"]=false;
                this.itemAutocomplete = new ItemAutocomplete(this, $(this.element).find("[data-autocomplete-list]"));
//                this.data["autocomplete"] = ListField.prototype.getListItem.call(this, )
                this.onAutocompleteThrottle = Buffer.throttle(this.triggerAutocomplete.bind(this), 50);
                this.form.data.trigger(Model.EVENT_CHANGE);
            }
            if($(this.element).attr("data-success") != undefined)
            {
                this.useValidator = true;
            }
            if($(this.element).find("data-error").length)
            {
                this.$error = $(this.element).find("data-error");
            }
            this.additionals = $(this.element).attr("data-additionals")? $(this.element).attr("data-additionals").split(","):null;
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
                this.$input.on("blur", this.onBlurBinded);
                this.$input.on("focus", this.onFocusBinded);

            }
        }
        public onBlur():void
        {
            if(window["form_debug"])
            {
                return;
            }
            this.clearAutocomplete();
            this.trigger(Field.EVENT_BLUR);
            if(this.autocomplete)
            {
                $(document).off("keydown", this.onKeyBinded);
            }
        }
        public onFocus():void
        {
            if(this.autocomplete)
            {
                $(document).on("keydown", this.onKeyBinded);
            }
        }

        public onKeyDown(event:any):void
        {
            if(!this.itemAutocomplete || !this.data[this.prefix_autocomplete+"autocompletion"])
            {
                return;
            }
            if(Field.KEYS_AUTOCOMPLETION.indexOf(event.keyCode) == -1 )
            {
                return;
            }
            switch(event.keyCode)
            {
                case Field.KEY_ENTER:
                    this.itemAutocomplete.selectCurrent();
                    break;
                case Field.KEY_DOWN:
                    this.itemAutocomplete.selectUp();
                    break;
                case Field.KEY_UP:
                    this.itemAutocomplete.selectDown();
                    break;
                case Field.KEY_ESCAPE:
                    this.itemAutocomplete.resetSelected();
                    break;
            }
            event.preventDefault();

        }
        public onChange(event:any):void
        {
            this.data[this.name] = this.getValue();
            if(!Objects.deepEquals(this.data_saved[this.name],this.data[this.name]))
            {
                this.unvalidate();
                this.onChangeValidated();

            }
        }
        protected unvalidate():void
        {
            if(!this.useValidator)
            {
                return;
            }
            this.error = null;
            $(this.element).attr("data-success","");
            if(this.$error)
            {
                this.$error.text("");
            }
        }
        public getErrorFields():Field|Field[]
        {
            if(this.error )
            {
                return this;
            }
            return null;
        }
        public validate():boolean
        {
            // if(false && !this.useValidator)
            // {
            //     return true;
            // }
            if(this.isValid())
            {
                $(this.element).attr("data-success", "success");
                return true;
            }else
            {
                $(this.element).attr("data-success", "error");
                if(this.$error && this.getError())
                {
                    this.$error.text(this.getError());
                }
                return false; 
            }
        }
        protected initialValidate():void
        {
            if(!this.useValidator)
            {
                return;
            }
            if(this.isValid())
            {
                $(this.element).attr("data-success", "success");
            }else
            {
                if(this.getValue()!=undefined && this.getValue()!="")
                {

                    $(this.element).attr("data-success", "error");
                    if(this.$error && this.getError())
                    {
                        this.$error.text(this.getError());
                    }
                }
            }
        }
        public getError():string
        {
           return this.error;
        }
        protected clearAutocomplete(trigger:boolean = false):void
        {
            if(this.itemAutocomplete && this.data[this.prefix_autocomplete+"autocompletion"])
            {
                if(this.data[this.prefix_autocomplete+"autocompletion"].length)
                {
                    this.data[this.prefix_autocomplete+"autocompletion"].length = 0;
                    this.form.data.trigger(Model.EVENT_CHANGE);
                }
                if(!this.itemAutocomplete)
                {
                    debugger;
                }
                var resets:string[] = this.itemAutocomplete.getReset();
                for(var p in resets)
                {
                    delete this.data[resets[p]];
                }
                this.data[this.prefix_autocomplete+"autocompleted"] = false;
                //TODO:mode where autocompletion is on with empty string + on start
                if(trigger && this.data[this.name] != "")
                {
                    this.onAutocompleteThrottle();
                }
            }
        }
        protected onChangeValidated():void
        {
            /*if(this.itemAutocomplete && this.data[this.prefix_autocomplete+"autocompletion"])
            {
                if(this.data[this.prefix_autocomplete+"autocompletion"].length)
                {
                    this.data[this.prefix_autocomplete+"autocompletion"].length = 0;
                    this.form.data.trigger(Model.EVENT_CHANGE);
                }
                if(!this.itemAutocomplete)
                {
                    debugger;
                }
                var resets:string[] = this.itemAutocomplete.getReset();
                for(var p in resets)
                {
                    delete this.data[resets[p]];
                }
                this.data[this.prefix_autocomplete+"autocompleted"] = false;
                //TODO:mode where autocompletion is on with empty string + on start
                if(this.data[this.name] != "")
                {
                    this.onAutocompleteThrottle();
                }
            }*/
            this.clearAutocomplete(true);
            this.data_saved[this.name] = Objects.clone(this.data[this.name], null, true);
            this.onChangeThrottle();
        }
        protected triggerAutocomplete():void
        {
            if(this.autocomplete && !this.data[this.prefix_autocomplete+"autocompleted"])
            {
                this.trigger(Field.EVENT_AUTOCOMPLETE, [{value:this.data[this.name], input:this, name:this.name}]);
            }
        }
        protected triggerChange():void
        {
            //TODO:perhaps consequences
           // this.validate();
            var data = {value:this.data[this.name], input:this, name:this.name};
            if(this.additionals)
            {
                data = this.additionals.reduce((previous:any, item:string):any=>
                {
                    previous[item] = this.data[item];
                    return previous;
                }, data);
            }
            //this.trigger(Field.EVENT_CHANGE, this.data[this.name], this);
            //{value:this.data[this.name], input:this, name:this.name}]
            this.trigger(Field.EVENT_CHANGE, [data]);
        }
        public getValue():any
        {
            return this.$input?this.$input.val():null;
        }
        public isValid():boolean
        {
            if(!this.required && this.$input.attr("required")!=undefined)
            {
                this.required = true;
            }

            var value:any = this.getValue();
            if(!value && this.required)
            {
                this.error = "required";
                return false;
            }
            for(var p in this.validators)
            {

                if(!this.validators[p].isValid(this))
                {
                    this.error = this.validators[p].getError();
                    return false;
                }
            }
            return true;
        }
        public dispose():void
        {
            if(this.$input)
            {
                this.$input.off("change", this.onChangeBinded);
                this.$input.off("blur", this.onBlurBinded);
                this.$input.off("focus", this.onFocusBinded);
            }
            if(this.itemAutocomplete)
            {
                this.itemAutocomplete.dispose();
                this.itemAutocomplete = null;
            }
            if(this.autocomplete)
            {
                $(document).off("keydown", this.onKeyBinded);
            }
            this.onChangeThrottle.cancel();
            this.form = null;
            this.parent = null;
            this.off();
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
    export class ItemAutocomplete
    {
        private reset:string[];
        private onClickBind:any;
        private selected:number = -1;
        public constructor(protected field:Field, protected $list:JQuery)
        {
            this.init();
        }
        protected init():void
        {
            this.onClickBind = this.onClick.bind(this);
            this.reset = [];
            //var _self:ItemAutocomplete = this;
            this.reset = <any>this.$list.attr("data-autocomplete-reset");
            if(this.reset)
            {
                this.reset = (<any>this.reset).split(",");
            }
            this.$list.on("mousedown","[data-autocomplete-item]", this.onClickBind);
        }
        public selectDown():void
        {
            this.selected--;
            if(this.selected<0)
            {
                this.selected = this.field.data[this.field.prefix_autocomplete+"autocompletion"].length-1;
            }
            this.field.focusAutocomplete(this.selected);
        }
        public selectUp():void
        {
            this.selected++;
            if(this.selected>=this.field.data[this.field.prefix_autocomplete+"autocompletion"].length)
            {
                this.selected = 0;
            }
            this.field.focusAutocomplete(this.selected);
        }
        public selectCurrent():void
        {
            this.field.chooseAutocomplete(this.selected);
        }
        protected onClick(event:any):boolean
        {
            var id:number = parseInt($(event.currentTarget).attr("data-autocomplete-item"), 10);
            if(!isNaN(id))
            {
                this.field.chooseAutocomplete(id);
            }
            this.field.focus();
            event.stopImmediatePropagation();
            return false;

        }
        public dispose():void
        {
            if(this.$list)
            {
                this.$list.off("mousedown","[data-autocomplete-item]", this.onClickBind);
                this.$list = null;
            }
        }
        public resetSelected():void
        {
            this.selected = -1;
            this.field.focusAutocomplete(this.selected);
        }
        public getReset():string[]
        {
            return this.reset;
        }
    }
    export class ListField extends Field
    {
        public static selector:string = null;//"[data-list]";
        public static EVENT_ADD:string = "add_item";
        public static EVENT_REMOVE:string = "remove_item";
        private actionListener:Function;
        /**
         * Item list
         */
        protected items:Field[];
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
        public constructor(name:string, data:any, element:any, _setInitialData:boolean, form:Form, parent:Field|Form)
        {
            super(name, data, element, _setInitialData, form, parent);
            this.items = [];
            this.min = this.max = -1;
            //this.sublist = [];
        }

        public validate():boolean
        {
            var success:boolean = true;
            for(var p in this.items)
            {
                success = success && this.items[p].validate();
            }
            return success;
        }
        public onChange(data:any, input?:Field, name?:string, itemField?:ItemField):void
        {
            console.log("CHANGE-LISTFIELD:",this,this.$input);
            if(!data)
            {
                debugger;
                return;
            }
            if(!data[data.length-1])
            {
                debugger;
                return;
            }
            data[data.length-1].name = this.name;
            data[data.length-1].list = this;

           // this.onChangeThrottle(data, itemField);
            this.triggerChange(data, input, name, itemField);
        }
        protected triggerChange (data?:any, input?:Field, name?:string, itemField?:ItemField) {
            this.trigger(Field.EVENT_CHANGE, data, input, itemField.getItemIndex(), name);
        }
        public getFields():Field[]
        {
            return this.items;
        }
        public getErrorFields():Field|Field[]
        {
            var errors:Field[] = [];
            for(var p in this.items)
            {
                var error:Field|Field[] = this.items[p].getErrorFields();
                if(error instanceof Field)
                {
                    errors.push(error);
                }else
                {
                    errors = errors.concat(<Field[]>error);
                }
            }
            return errors;
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

            this.actionListener = (event)=>
            {
                    if(this.isSubList(event.currentTarget))
                {
                        return;
                }
                    this[$(event.currentTarget).attr("data-action")](event.currentTarget);
            };
            $(this.element).on("click","[data-action]", <any>this.actionListener);
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
                this.add(false, true);
            }
            this.checkMinStatus();
            this.checkMaxStatus();
        }
        public reset():void
        {
            if(this.items)
            {
                this.items.forEach(function(field:ItemField)
                {
                    field.dispose();
                });
                this.items.length = 0;
            }
            this.init();
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
        public add(focus:boolean = true, isInit:boolean = false):void
        {
            if(this.isMaxReached())
            {
                return;
            }

            if(!this.data[this.name] || !this.data[this.name].push)
            {
                this.data[this.name] =  [];
            }

            //this.data[this.name].push({name:"test", tags:[]});
            var model:any;
            //hack of ractive => use previous data to set the new item
            if(!isInit)
            {
                if(this.items.length)
                {
                    model = (<ItemField>this.items[this.items.length-1]).cloneData();
                }
            }
            var index:number = this.addData(this.data[this.name].length, model);

            var $last:JQuery = this.getListItem("[data-item]", this.element).last();//$(this.element).find("[data-item]").last();
            var item = this.addItem(index, $last);
            ///hack of ractive => use constructed data to rebuild the first item
            if(!isInit && this.items.length == 1)
            {
                model= item.cloneData();
                this.data[this.name].splice(0, 1);
                //this.data[this.name].push(item.data);
                this.items[0].dispose();
                this.items.splice(0, 1);

                var index:number = this.addData(this.data[this.name].length, model);

                var $last:JQuery = this.getListItem("[data-item]", this.element).last();//$(this.element).find("[data-item]").last();
                var item = this.addItem(index, $last);

            }
            /*if(!isInit) {
                item.cloneData();
                this.data[this.name].splice(index, 1);
                this.data[this.name].push(item.data);
            }*/
          //  this.trigger(ListField.EVENT_ADD, item);
            this.trigger(ListField.EVENT_ADD, [{name:this.name, list:this, input:item}]);
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
        protected addData(index?:number, model?:any):number
        {
            if(!this.data[this.name] || !this.data[this.name].push)
            {
                this.data[this.name] =  [];
            }
            if(index == undefined)
            {
                index = this.data[this.name].length;
            }
            if(!model)
            {
                model = {};
            }


            while(this.data[this.name].length<=index)
            {
                var newItem:any = this.data[this.name].length==index?model:Objects.clone(model);//{};
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
            var cls:any = ItemField;
            if($(lastItem).attr("data-item-type"))
            {
                cls = Form.getField(lastItem);
            }
            var itemField:ItemField = new cls(this.name, this.data[this.name][index], lastItem, this._setInitialData, this.form, this);
            itemField.on(Field.EVENT_CHANGE, this.onChange, this, itemField);
            itemField.on(Field.EVENT_AUTOCOMPLETE, this.onAutocomplete, this, itemField);
            itemField.on(ListField.EVENT_ADD, this.onAdd, this, itemField);
            itemField.on(ListField.EVENT_REMOVE, this.onRemove, this, itemField);
            itemField.on(Field.EVENT_VALIDATE, this.onValidate, this, itemField);
            itemField.initialize();
            this.items.push(itemField);
            return itemField;
        }
        protected onValidate(field:ItemField):void
        {
            var index:number = this.items.indexOf(field);
            if(index == -1)
            {
                //should not happend
                debugger;
                return;
            }
            if(index == this.items.length-1)
            {
             //   debugger;
                this.add(true);
            }else
            {
                console.log("focus");
                setTimeout(()=>
                {

                    this.items[index+1].focus();
                }, 0);
                //not working
               /* setTimeout(()=>
                {
                    this.items[index+1].focus();
                }, 0);*/
            }
        }
        protected onAdd(data:IChangeData[]/*newItem:ItemField, name:string, list:ListField*/):void
        {
            // this.form.onAdd(newItem, name, list, this);
            data[data.length-1].name = this.name;
            data[data.length-1].list = this;
            this.trigger(ListField.EVENT_ADD, data);
        }
        protected onAutocomplete(data:IChangeData[]):void
        {
            data[data.length-1].name = this.name;
            data[data.length-1].list = this;
            this.trigger(Field.EVENT_AUTOCOMPLETE, data);
        }
        protected onRemove(data:IChangeData[]):void
        {
            data[data.length-1].name = this.name;
            data[data.length-1].list = this;
            this.trigger(ListField.EVENT_REMOVE, data);
        }

        public getListItem(selector:string, root?:any, testSelf:boolean = true):JQuery
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
        public remove(element:HTMLElement|ItemField):void
        {
            if(this.isMinReached())
            {
                //no remove
                return;
            }
            //debugger;
            var $item:JQuery;
            if(element instanceof ItemField)
            {
                $item = $(element.element);
            }else
            {
                $item = $(element).closest("[data-item]");
            }
            var i:number = parseInt($item.attr("data-item"), 10);
            if(!isNaN(i))
            {
                this.data[this.name].splice(i, 1);
            }
            //this.trigger(ListField.EVENT_REMOVE, [{name:this.name, list:this, input:this.items[i], id:(<ItemField>this.items[i]).getID()}]);
            //this.items.splice(i, 1);
            if (this.items[i] && (<any>this.items[i]).remove)
                (<ItemField>this.items[i]).remove();
            this.items.splice(i, 1);
          //  this.getListItem("[data-item]", this.element).find("[data-focus]").focus();
            this.checkMinStatus();
            this.checkMaxStatus();
        }
        public dispose():void
        {
            $(this.element).off("click","[data-action]", <any>this.actionListener);

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
    interface IItemValue
    {
        name:string;
        value:any;
    }
    export class ItemField extends Field
    {
        public static selector:string = null;// "[data-list]";
        private fields:Field[];
        private id_name:string;
        private change_timeout:number = -1;
        private remove_timeout:number = -1;
        private initialized:boolean;
        private validateBinded:Function;


        private _inputs:Field[];
        //TODO:change to IChangeData

        private _values:IChangeData[][] = [];
        public constructor(name:string, data:any, element:any, _setInitialData:boolean, form:Form, parent:Field|Form)
        {
            super(name, data, element, _setInitialData, form, parent);
            this.validateBinded = this.onValidate.bind(this);
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
        public getField(name:string):Field
        {
            return Form.prototype.getField.call(this, name);
        }
        public getFields():Field[]
        {
            return this.fields;
        }
        public validate():boolean
        {
            var success:boolean = true;
            for(var p in this.fields)
            {
                success = success && this.fields[p].validate();
            }
            return success;
        }
        public focus():void
        {
            if(this.fields && this.fields.length)
            {
                this.fields[0].focus();
            }
        }
        public getErrorFields():Field|Field[]
        {
            var errors:Field[] = [];
            for(var p in this.fields)
            {
                var error:Field|Field[] = this.fields[p].getErrorFields();
                if(error)
                {
                    if(error instanceof Field)
                    {
                        errors.push(error);
                    }else
                    {
                        errors = errors.concat(<Field[]>error);
                    }
                }
            }
            return errors;
        }
        public cloneData(data?:any):any
        {
            var clone:any = {};
            if(!data)
            {
                data = this.data;
            }
            for(var p in data)
            {
                if(data.hasOwnProperty(p) && data[p]!==null)
                {
                    if(typeof data[p] == "object")
                    {
                        if(Arrays.isArray(data[p]))
                        {

                            clone[p] = [];
                        }else
                        clone[p] = this.cloneData(data[p]);
                    }
                }
            }
            return clone;
        }
        public init():void
        {
            if(this.initialized)
            {
                debugger;
            }
            this.fields = [];
            this._inputs = [];
            this._values = [];
            this.initialized = true;
            Form.prototype.retrieveFields.call(this, this.element, this.name);
            this.fields.forEach(function(item:Field):void
            {
              //  item.on(Field.EVENT_CHANGE, this.onChange, this);
            }, this);
            this.id_name = $(this.element).attr("data-id-name")?$(this.element).attr("data-id-name"):"id";


            this.additionals = $(this.element).attr("data-additionals")? $(this.element).attr("data-additionals").split(","):null;

            if(this.fields.length == 1)
            {
                //one field only => listen to validate
                this.fields[0].on(Field.EVENT_VALIDATE, this.validateBinded);
               this.fields[0].on(Field.EVENT_BLUR, this.onItemBlur, this, this.fields[0]);
            }
        }
        protected onValidate():void
        {
            this.trigger(Field.EVENT_VALIDATE);
        }
        protected onItemBlur(item:Field):void
        {
            var value = item.getValue();
            if(!value)
            {
                (<ListField>this.parent).remove(this);
            }
        }
        protected onAdd(value:IChangeData[]/*newItem:ItemField, name:string, list:ListField*/):void
        {
           // this.form.onAdd(newItem, name, list, this);
            value.push({input:this, id:this.getID()});
            this.trigger(ListField.EVENT_ADD, value);
        }
        protected onAutocomplete(value:IChangeData[]):void
        {
            value.push({input:this, id:this.getID()});
            this.trigger(Field.EVENT_AUTOCOMPLETE, value);
        }
        protected onRemove(value:IChangeData[]):void
        {
            /*console.warn("Hey developer YOU MUST REMOVE _values and _inputs linked");
            if(this.change_timeout != -1)
            {
                clearTimeout(this.change_timeout);
            }
            this.form.onRemove(name, list, this);*/
            value.push({input:this, id:this.getID()});
            this.trigger(ListField.EVENT_REMOVE, value);
        }
        public remove():void
        {
            if( this.remove_timeout != -1)
            {
                clearTimeout(this.remove_timeout);
            }
            if(this.change_timeout != -1)
            {
                clearTimeout(this.change_timeout);
                this.change_timeout = -1;
            }
            if(this.hasID())
            {
                this.remove_timeout = -1;
                this.trigger(ListField.EVENT_REMOVE, [{input:this, id:this.getID()}]);
                this.dispose();
            }else
            {
                this.remove_timeout = window.setTimeout(this.remove.bind(this), 500);
            }
        }
        public dispose():void
        {
            if(this.fields)
            {
                if(this.fields.length == 1)
                {
                    //one field only => listen to validate
                    this.fields[0].off(Field.EVENT_VALIDATE, this.validateBinded);
                    this.fields[0].off(Field.EVENT_BLUR, this.onItemBlur, this);
                }
                this.fields.forEach(function(field:Field)
                {
                    field.dispose();
                });
                this.fields = null;

            }
            this._inputs = null;
            this._values = null;
            this.off();
            super.dispose();
        }
        public setInitialValue():void
        {

        }
        public onChange(value:IChangeData[], input?:Field, name?:string):void
        {
            /*    if( this.data[this.name]  != this.getValue())
             {
             this.data[this.name] = this.getValue();
             this.onChangeThrottle();
             }*/
            /*var name:string = value[value.length-1].name;
           // this.data[this.name] = this.getValue();
            if(!Objects.deepEquals(this.data_saved[name],this.data[name]))
            {
                this.data_saved[name] = Objects.clone(this.data[name], null, true);
                this.delayChange(value);
            }*/
            this.delayChange(value);
        }
        private delayChange(value?:IChangeData[]):void
        {
            if(this.change_timeout != -1)
            {
                clearTimeout(this.change_timeout);
            }
            if(value)
            {
                var item:IChangeData = value[0];
                if(!item)
                {
                    //weird
                    return;
                }
                var input:Field = item.input;
                var index:number;
                if((index = this._inputs.indexOf(input))==-1)
                {
                    index = this._inputs.length;
                    this._inputs.push(input);
                }
                this._values[index] = value;
            }
            if(this.hasID())
            {
                this.change_timeout = -1;
                //this.onChangeThrottle();
                this._inputs.forEach(function(item:Field, index:number):void
                {
                    this._values[index].push({input:this, id:this.getID()});
                    if(this.additionals)
                    {
                        for(var p in this.additionals)
                        {
                            this._values[index][0][this.additionals[p]] = this.data[this.additionals[p]];
                        }
                    }
                    this.trigger(Field.EVENT_CHANGE, this._values[index], item, (<any>this._values[index]).name);
                }, this);
                this._inputs.length = this._values.length = 0;
            }else
            {
                console.warn("no id yet", this);
                this.change_timeout = window.setTimeout(this.delayChange.bind(this), 500);
            }
        }
    }
    export interface IChangeData
    {
        name?:string;
        value?:any;
        input:Field;
        list?:ListField;
        id?:string;
    }

    export class GMapField extends Field
    {
        public static selector:string = "[data-type='gmap']";
        /*public constructor( public name:string, protected data:any, public element:any, protected _setInitialData:boolean, protected form:Form)
         {
         super(name, data, element, _setInitialData, form);
         }*/
        protected types:string[];
        protected init():void
        {

            super.init();
            this.addValidator(new TextValidator());
            //force no autocomplete request
            this.onAutocompleteThrottle = <any>function(){};
        }
        protected initializeInput():void
        {
            var selector:string = "input[type='text']";
           this.$input = $(this.element).find(selector).addBack(selector);
            var types:any = $(this.element).find("[data-types]").addBack("[data-types]").attr("data-types");
            if(!types || types.length==0)
            {
                types = ["(cities)"];
            }else
            {
                if (types === 'all')
                    types = [];
                else
                    types = types.split(",");
            }
            this.types = types;
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
        public chooseAutocomplete(index:number):void
        {
            if(this.data[this.prefix_autocomplete+"autocompletion"] && this.data[this.prefix_autocomplete+"autocompletion"].length>index)
            {
                var value:any;
                var data:any = this.data[this.prefix_autocomplete+"autocompletion"][index];
                if(!data)
                {
                    //error is trigger otherwise
                    debugger;
                    return;
                }
                for(var p in this.data[this.prefix_autocomplete+"autocompletion"][index])
                {
                    if(p == "id")
                    {
                        continue;
                    }
                    value = this.data[this.prefix_autocomplete+"autocompletion"][index][p];
                    if(value != null)
                    {
                        if (0 !== p.indexOf(this.prefix_autocomplete))
                            this.data[this.prefix_autocomplete + p] = Objects.clone(value);
                        else
                            this.data[p] = Objects.clone(value);
                    }
                }
                this.data[this.prefix_autocomplete+"autocompleted"] = true;
                this.data_saved[this.name] = Objects.clone(this.data[this.name], null, true);

                //this.onChangeThrottle();

                this.form.data.trigger(Model.EVENT_CHANGE);
                GMap.getDetails(data.place_id).then((data:any):void=>
                {
                    if(this.data["place_id"] != data.place_id)
                    {
                        debugger;
                        return;
                    }
                    var keys:string[] = ["address_components", "formatted_address","geometry","place_id","types"];
                    var key:string;
                    for(var p in keys)
                    {
                       key = keys[p];
                       this.data[key] = Objects.clone(data[key]);
                    }
                    this.triggerChange();
                }, function(error:any):void
                {
                    debugger;
                });

            }
        }
        /*
        public setAutocomplete(data:any):void
        {

            if(data)
            {
                this.data[this.prefix_autocomplete +  "autocompletion"] = data;
            }

        }*/
        protected onChangeValidated():void
        {
            super.onChangeValidated();
            if(!this.data[this.name] || this.data[this.name].length<1/* || this.data[this.name].length<3*/)
            {
                return ;
            }
            this.geocode();

        }
        protected geocode():void
        {
            GMap.autocomplete({input:this.data[this.name],
                types:this.types
            }).then((result:any[])=>{
                result = result.map(function(item:any):any
                    {
                        item.name = item.description;
                        return item;
                    });

                this.setAutocomplete(result);
                this.form.data.trigger(Model.EVENT_CHANGE);
            },function(){debugger;});
        }
    }
    export class CheckboxField extends Field
    {
        public static selector:string = "[data-type='checkbox']";
        /*public constructor( public name:string, protected data:any, public element:any, protected _setInitialData:boolean, protected form:Form)
         {
         super(name, data, element, _setInitialData, form);
         }*/
        protected init():void
        {
            super.init();
            this.addValidator(new CheckboxValidator());
        }
        public onChange(event:any):void
        {
            if(this.data[this.name] == 1)
            {
                this.data[this.name] = 0;
            }else
            {
                this.data[this.name] = 1;
            }
            if(this.form.data && this.form.data.trigger)
            {

                this.form.data.trigger(Model.EVENT_CHANGE);
            }else
            {
                console.warn("CheckboxField can't enable two ways binding if form data is not an EventDispatcher");
            }
            this.data_saved[this.name] = this.data[this.name];
            this.triggerChange();
        }
        public getValue():any
        {
            return this.data[this.name];
        }
        protected bindEvents():void
        {
            super.bindEvents();
            if(this.$input)
                this.$input.on("click", this.onChangeBinded);
        }
        public dispose():void
        {
            super.dispose();
            if(this.$input)
                this.$input.off("click", this.onChangeBinded);
        }
    }

    export class InputTextField extends Field
    {
        public static selector:string = "input[type='text'],input[type='search']";
        /*public constructor( public name:string, protected data:any, public element:any, protected _setInitialData:boolean, protected form:Form)
        {
            super(name, data, element, _setInitialData, form);
        }*/
        protected init():void
        {
            super.init();
            this.addValidator(new TextValidator());
        }
        protected bindEvents():void
        {
            super.bindEvents();
            if(this.$input)
            {
                this.$input.on("keyup", this.onChangeBinded);
                if(this.$input.attr("type") == "search")
                {
                    this.$input.on("search", this.onChangeBinded);
                }
            }
        }
        public dispose():void
        {
            super.dispose();
            if(this.$input)
            {
                this.$input.off("keyup", this.onChangeBinded);
                if(this.$input.attr("type") == "search")
                {
                    this.$input.off("search", this.onChangeBinded);
                }
            }
        }
        public onChange(event:any):void
        {

            super.onChange(event);
            if(event && (event.keyCode == 13|| event.keyCode == 9) && this.data[this.name] && this.data[this.name] != "")
            {
                this.trigger(Field.EVENT_VALIDATE);
            }
        }
    }

    export class InputNumberField extends Field
    {
        public static selector:string = "input[type='number']";

        protected init():void
        {
            super.init();
            this.addValidator(new TextValidator());
        }
        protected bindEvents():void
        {
            super.bindEvents();
            if(this.$input)
                this.$input.on("change keyup", this.onChangeBinded);
        }
        public dispose():void
        {
            super.dispose();
            if(this.$input)
                this.$input.off("change keyup", this.onChangeBinded);
        }
    }
    export class EmailTextField extends InputTextField
    {
        public static selector:string = "input[type='email']";
    }
    export class InputFileField extends Field
    {
        public static selector:string = "[data-type='picture']";
        private inputFile:HTMLInputElement;
        private preview:any;
        private $triggerInput:JQuery;
        private $triggerRemove:JQuery;
        private preview_type:string;
        private picture: string;
        protected init():void
        {
            super.init();
            if(!$(this.element).find("input[type='file']").length)
            {
                $(this.element).append('<input type="file" name="'+$(this.element).attr("data-field")+'">');
            }
            this.inputFile = <any>$(this.element).find("input[type='file']").get(0);
            this.$triggerInput = $(this.element).find("[data-trigger]").addBack("[data-trigger]");
            if(!this.$triggerInput.length)
            {
                this.$triggerInput = this.$input;
            }
            this.preview = <any>$(this.element).find("[data-preview]").get(0);
            if(this.preview)
            {

                this.preview_type = ($(this.preview).prop("tagName")+"").toLowerCase();
            }
            this.$triggerRemove = $(this.element).find("[data-remove]").addBack("[data-remove]");
            //     this.validators.push(new TextValidator());
            this.picture = this.data[this.name];
        }
        protected bindEvents():void
        {
            super.bindEvents();
            if(this.$input)
            {

                $(this.inputFile).on("change", (event)=>
                {
                    FileAPI.loadFile(this.inputFile).
                        then((event:ProgressEvent):void=>
                        {
                            if(!event)
                            {
                                return;
                            }
                              var file:FileReader = <FileReader>event.currentTarget;
                              if(!file)
                              {
                                  file = <FileReader>event.target;
                                  if (!file) {
                                      file = <FileReader>event["originalTarget"];
                                      if (!file) {
                                          file = <FileReader>event["expliciteOriginalTarget"];
                                      }
                                      if(!file)
                                      {
                                          return;
                                      }
                                  }
                              }
                              if(this.preview)
                              {
                                  if(this.preview_type == "img")
                                  {
                                      this.preview.src = file.result;
                                  }else
                                  {
                                      $(this.preview).css("background-image", 'url("'+file.result+'")');
                                      $(this.preview).removeClass("no-picture");
                                      var pwidth:number = $(this.preview).width();
                                      var pheight:number = $(this.preview).height();

                                      var image = new Image();
                                      image.src = <any>file.result;

                                      image.onload = ()=> {

                                          if(!image.width || !image.height)
                                          {
                                              return;
                                          }
                                          var ratio:number = image.width/image.height;
                                          if(image.width != pwidth)
                                          {
                                              image.width = pwidth;
                                              image.height = image.width/ratio;
                                          }
                                          if(image.height < pheight)
                                          {
                                              image.height = pheight;
                                              image.width = image.height * ratio;
                                          }
                                          //position

                                          var positionX:number = (image.width-pwidth)/2;
                                          var positionY:number = (image.height-pheight)/2;
                                          $(this.preview).css("background-size", image.width+"px "+image.height+"px");
                                          $(this.preview).css("background-position", (-positionX)+"px "+(-positionY)+"px");

                                          // access image size here
                                      };
                                  }
                                  this.$input.addClass("preview");
                              }
                            this.picture = <any>file.result;
                            this.onChangeBinded();

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
                this.$triggerInput.on("click", (event)=>
                {
                    if($(event.target).get(0) === this.inputFile)
                    {
                        return;
                    }
                    Form.fieldCrop = this;
                    //window.location.href="#crop/crop";
                    $(this.inputFile).trigger("click");
                });
                this.$triggerRemove.on("click", ()=>
                {
                    if(this.preview)
                    {
                        if(this.preview_type == "img")
                        {
                            $(this.preview).removeAttr("src");
                        }
                        else
                        {
                            $(this.preview).addClass("no-picture");
                            $(this.preview).css("background-image", "");
                        }
                        this.preview.src = null;
                        this.$input.removeClass("preview");
                        this.picture = null;
                        this.onChangeBinded();
                    }
                });
            }
        }
        public dispose():void
        {
            super.dispose();
            if(this.$input)
                this.$input.off("keyup", this.onChangeBinded);
            if(this.$triggerInput)
            {
                this.$triggerInput.off("click");
            }
            if(this.$triggerRemove)
            {
                this.$triggerRemove.off("click");
            }
            $(this.inputFile).off("change");
        }
        public getValue():string
        {
            return this.picture;
        }
        public focus():void
        {
            //nothing to do
        }
    }
    export class TextareaField extends Field
    {
        public static selector:string = "textarea";
        private max:number;
        private min:number;
        private force_max:boolean;
        private $counter:JQuery;
        protected init():void
        {
            super.init();
            this.min = -1;
            this.max = -1;
            this.force_max = false;
            this.addValidator(new TextValidator());
            var $max:JQuery;
            if (($max = $(this.element).find("[data-max]").addBack("[data-max]")).length)
            {
                this.$counter = $(this.element).find("[data-max],.counter"); //$max;
                this.max = parseInt($max.attr("data-max"),10);
                if(isNaN(this.max))
                {
                    this.max = -1;
                    console.warn("TextArea with data-max attribute but no correct value");
                }else
                {
                    if($(this.element).find("[data-force],.force").addBack("[data-force],.force").length)
                    {
                        this.force_max = true;
                    }
                    this.checkLimits();
                }
            }
            var $min:JQuery;
            if (($min = $(this.element).find("[data-min]").addBack("[data-min]")).length)
            {
                this.$counter = $(this.element).find("[data-min],.counter"); //$min;
                this.min = parseInt($min.attr("data-min"), 10);
                if (isNaN(this.min)) {
                    this.min = -1;
                    console.warn("TextArea with data-min attribute but no correct value");
                } else {

                    this.checkLimits();
                }
            }
        }
        public onChange(event:any):void
        {
            super.onChange(event);
            this.checkLimits();
        }
        public isValid():boolean
        {
            if(super.isValid())
            {
                if(this.max == -1 && this.min == -1)
                {
                    return true;
                }
                if(this.max>-1)
                {
                    var count:number = this.max - (this.data[this.name]?this.data[this.name].length:0);
                    if(count < 0)
                    {
                        this.error = "too_long";
                        return false;
                    }
                }
                if (this.min > -1) {
                    var count: number = (this.data[this.name] ? this.data[this.name].length : 0);
                    if (count < this.min) {
                        this.error = "too_short";
                        return false;
                    }
                }

                return true;
            }
            return false;
        }
        private checkLimits():void
        {

            if(this.max > 0)
            {
                var count:number = this.max - (this.data[this.name]?this.data[this.name].length:0);
                if(count < 0)
                {
                    if(this.force_max)
                    {
                        this.$input.val(this.$input.val().substring(0, this.max));
                        count = 0;
                    }else
                    {
                        $(this.element).addClass("counter_error");
                    }
                }else
                {
                    $(this.element).removeClass("counter_error");
                }
                this.$counter.text(""+count);
            }
            if (this.min>0)
            {
                var count: number = (this.data[this.name] ? this.data[this.name].length : 0);
                if (count >= this.min) {
                    $(this.element).addClass("counter_success");
                    $(this.element).removeClass("counter_error");
                } else {
                    $(this.element).removeClass("counter_success");
                    $(this.element).addClass("counter_error");
                }
                this.$counter.text("" + count);
            }
            console.log(this, "check limits:"+this.max+"=>"+count);
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
            if(this.$counter)
                this.$counter = null;
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
    }


    export class InputListField extends Field
    {
        public static selector:string = "select";

        protected init():void
        {
            super.init();
            this.addValidator(new TextValidator());
        }

    }


    export class CustomInputListField extends Field
    {
        public static selector:string = "[data-type='list']";
        /**
         * Force form to trigger Model.EVENT_CHANGE from the data
         * Required when ractive doesn't handle two ways binding
         * @type {boolean}
         */
            //replaced by overrided onChangeValidated method
        public static force_trigger:boolean = false;
        protected init():void
        {
            super.init();
        }
        protected bindEvents():void
        {
            if(this.$input)
            {
                this.$input.on("change", this.onChangeBinded);

            }
        }


        public getValue():any
        {
            return this.$input?this.$input.find("p[value]").attr("value"):null;
        }
        public dispose():void
        {
            super.dispose();
            if(this.$input)
                this.$input.off("change", this.onChangeBinded);
        }
        protected onChangeValidated():void
        {
            super.onChangeValidated();

            if(this.form.data && this.form.data.trigger)
                this.form.data.trigger(Model.EVENT_CHANGE);
        }
    }


    export class InputCheckboxField extends Field
    {
        public static selector:string = "input[type='checkbox']";

        protected init():void
        {
            super.init();
            //this.validators.push(new TextValidator());
        }
        protected bindEvents():void
        {
            super.bindEvents();
            if(this.$input)
                this.$input.on("change", this.onChangeBinded);
        }
        public dispose():void
        {
            super.dispose();
            if(this.$input)
                this.$input.off("change", this.onChangeBinded);
        }

        public getValue():any
        {
            return this.$input?this.$input.prop("checked"):false;
        }
    }

    formTypes["Form"] = Form;
    formTypes["Validator"] = Validator;
    formTypes["TextValidator"] = TextValidator;
    formTypes["CheckboxValidator"] = CheckboxValidator;
    formTypes["Field"] = Field;
    formTypes["ItemAutocomplete"] = ItemAutocomplete;
    formTypes["ListField"] = ListField;
    formTypes["ItemField"] = ItemField;
    formTypes["GMapField"] = GMapField;
    formTypes["CheckboxField"] = CheckboxField;
    formTypes["InputTextField"] = InputTextField;
    formTypes["InputFileField"] = InputFileField;
    formTypes["InputNumberField"] = InputNumberField;
    formTypes["InputHiddenField"] = InputHiddenField;
    formTypes["EmailTextField"] = EmailTextField;
    formTypes["InputFileField"] = InputFileField;
    formTypes["TextareaField"] = TextareaField;
    formTypes["InputListField"] = InputListField;
    formTypes["CustomInputListField"] = CustomInputListField;
    formTypes["InputCheckboxField"] = InputCheckboxField;
    formTypes["CustomInputListField"] = CustomInputListField;
    formTypes["CustomInputListField"] = CustomInputListField;
    formTypes["CustomInputListField"] = CustomInputListField;

