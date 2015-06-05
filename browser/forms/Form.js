var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var _this = this;
///<module="mvc"/>
///<module="framework/ghost/utils"/>
///<module="framework/browser/io"/>
///<module="framework/ghost/events"/>
var ghost;
(function (ghost) {
    var browser;
    (function (browser) {
        var forms;
        (function (forms) {
            var _this = this;
            //EVENT_CHANGE => moins de data remontée (juste id/name parent => si retour autocomplete appeler la fonction .setAutocomplete())s
            /**
             * Form managment
             */
            var Form = (function (_super) {
                __extends(Form, _super);
                function Form(form, data) {
                    _super.call(this);
                    this.autosave = false;
                    this._setInitialData = false;
                    if (!data) {
                        data = {};
                        this._setInitialData = true;
                    }
                    this.data = data;
                    this.promises = {};
                    if (form) {
                        this.attachForm(form);
                    }
                }
                Form.isSubList = function (element, listName, testSelf) {
                    if (testSelf === void 0) { testSelf = true; }
                    var $item = $(element);
                    if (testSelf && $item.is("[data-list") && $item.attr("data-list") != listName) {
                        return true;
                    }
                    if ($item.parents("form,[data-list]").attr("data-list") && $item.parents("form,[data-list]").attr("data-list") != listName) {
                        return true;
                    }
                    return false;
                };
                Form.prototype.setAutosave = function (value) {
                    this.autosave = value;
                };
                Form.prototype.getAutosave = function () {
                    return this.autosave;
                };
                /**
                 * Export data into object
                 */
                Form.prototype.toObject = function (name) {
                    if (!name)
                        return this.data;
                    var data = {};
                    data[name] = this.data[name];
                    return data;
                };
                Form.prototype.retrieveFields = function (form, listname) {
                    var _this = this;
                    if (!listname) {
                        listname = $(form).attr("data-list");
                    }
                    var $list = $(form).find("[data-field],[data-list]");
                    if ($(form).attr("data-field") || $(form).attr("data-list")) {
                        $list = $list.addBack();
                    }
                    var fields = $list.toArray().map(function (element) {
                        var name = $(element).attr("data-field");
                        var list = false;
                        if (!name) {
                            name = $(element).attr("data-list");
                            list = true;
                        }
                        if (($(element).attr("data-field") || $(element).attr("data-list")) && $(element).parents("form,[data-list]").attr("data-list") && $(element).parents("form,[data-list]").attr("data-list") != listname) {
                            //
                            return null;
                        }
                        var cls = list ? ListField : Form.getField(element);
                        var field;
                        if (cls) {
                            field = new cls(name, _this.data, element, _this._setInitialData, _this["form"] ? _this["form"] : _this);
                            field.on(Field.EVENT_CHANGE, _this.onChange, _this, name);
                            if (field instanceof ListField) {
                                field.on(ListField.EVENT_ADD, _this.onAdd, _this, name, field);
                                field.on(ListField.EVENT_REMOVE, _this.onRemove, _this, name, field);
                            }
                        }
                        return field;
                    }).filter(function (element) {
                        if (element) {
                            return true;
                        }
                        return false;
                    });
                    this.fields = fields;
                };
                Form.prototype.attachForm = function (form) {
                    var _this = this;
                    this.retrieveFields(form);
                    var $forms = $(form).find("form").addBack("form");
                    this.$form = $forms;
                    this.action = $forms.attr("action");
                    $forms.on("submit", function (event) {
                        _this.submit();
                        event.stopPropagation();
                        return false;
                    });
                    $forms.on("click", "[data-action]", function (event) {
                        var $this = $(event.currentTarget);
                        if ($this.parents("[data-list],form").attr("data-list")) {
                            //inside data-list
                            return;
                        }
                        _this[$this.attr("data-action")]();
                        //.submit();
                    });
                    /*   $forms.find("[data-field='cancel']").on("click", ()=>
                      {
                          this.cancel();
                      });*/
                };
                Form.prototype.cancel = function () {
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
                };
                Form.prototype.submit = function () {
                    var _this = this;
                    var object = this.toObject();
                    var uniqueID = ghost.utils.Maths.getUniqueID();
                    if (object) {
                        object.__uniqueID = uniqueID;
                    }
                    this.trigger(Form.EVENT_SUBMIT, object);
                    if (!this.action) {
                        log.warn("unable to autosave the form - no action attribute found for the form");
                        return;
                    }
                    for (var p in this.promises) {
                        if (this.promises[p])
                            this.promises[p].cancel();
                    }
                    this.promises = {};
                    var data = this.toObject();
                    var action = this.getAction();
                    data.action = "submit";
                    ghost.io.ajax({
                        url: action,
                        data: data,
                        retry: ghost.io.RETRY_INFINITE,
                        method: "POST"
                    }).
                        then(function (result) {
                        if (result) {
                            result.__uniqueID = uniqueID;
                        }
                        _this.trigger(Form.EVENT_SUBMITTED, result);
                    }, function (error) {
                        if (error) {
                            error.__uniqueID = uniqueID;
                        }
                        _this.trigger(Form.EVENT_SUBMIT_ERROR, error);
                    });
                };
                Form.prototype.getAction = function () {
                    var action = this.action;
                    if (action.indexOf(":") != -1) {
                        for (var p in this.data) {
                            action = action.replace(":" + p, this.data[p]);
                        }
                    }
                    /*if(action.indexOf(":")!=-1)
                    {
                       
                    }*/
                    return action;
                };
                Form.prototype.onChange = ;
                /**
                 * CHANGE
                 * @type {string}
                 */
                Form.EVENT_CHANGE = "change";
                Form.EVENT_ADD_ITEM = "add_item";
                Form.EVENT_REMOVE_ITEM = "remove_item";
                Form.EVENT_SUBMIT = "submit";
                Form.EVENT_CANCEL = "cancel";
                Form.EVENT_SUBMITTED = "submitted";
                Form.EVENT_SUBMIT_ERROR = "submit_error";
                return Form;
            })(ghost.events.EventDispatcher);
            forms.Form = Form;
            {
                debugger;
                if (!name && typeof index == "string") {
                    name = index;
                    index = null;
                }
                this.trigger(Form.EVENT_CHANGE + ":" + name, name, value);
                console.log(Form.EVENT_CHANGE + ":" + name, name, value);
                if (!this.autosave) {
                    return;
                }
                if (this.promises[name]) {
                    this.promises[name].cancel();
                }
                debugger;
                var action = this.getAction();
                var data;
                if (index != null) {
                    data = {};
                    data[name] = value;
                    data.index = index;
                }
                else {
                    data = this.toObject(name);
                }
                data.action = "autosave";
                var ajax = ghost.io.ajax({
                    url: action,
                    data: data,
                    retry: ghost.io.RETRY_INFINITE,
                    method: "POST"
                }).
                    then(function (result) {
                    delete _this.promises[name];
                }, function (error) {
                    delete _this.promises[name];
                    log.error(error);
                });
                this.promises[name] = ajax;
            }
            getObjectID(data, any);
            string;
            {
                if (data.id) {
                    return data.id;
                }
                for (var p in data) {
                    if (p.substring(0, 3) == "id_") {
                        return data[p];
                    }
                }
            }
            onAdd(newItem, ItemField, name, string, list, ListField, itemfield ?  : ItemField);
            void {
                this: .trigger(Form.EVENT_ADD_ITEM, name, list),
                if: function () { } };
            !this.autosave;
            {
                return;
            }
            if (this.promises[name]) {
                this.promises[name].cancel();
            }
            debugger;
            var action = this.getAction();
            var data = {
                name: name }; //this.toObject(name);
            data.action = "add";
            if (itemfield) {
                data.item =
                    {
                        name: itemfield.name,
                        id: this.getObjectID(itemfield.data)
                    };
            }
            var ajax = ghost.io.ajax({
                url: action,
                data: data,
                retry: ghost.io.RETRY_INFINITE,
                method: "POST"
            }).
                then(function (result) {
                delete _this.promises[name];
                if (result.id != undefined) {
                    newItem.setID(result.id);
                }
            }, function (error) {
                delete _this.promises[name];
                log.error(error);
            });
            this.promises[name] = ajax;
        })(forms = browser.forms || (browser.forms = {}));
    })(browser = ghost.browser || (ghost.browser = {}));
})(ghost || (ghost = {}));
onRemove(name, string, list, ListField, itemfield ?  : ItemField);
void {
    this: .trigger(Form.EVENT_REMOVE_ITEM, name, list),
    if: function () { } };
!this.autosave;
{
    return;
}
if (this.promises[name]) {
    this.promises[name].cancel();
}
debugger;
var action = this.getAction();
var data = {
    name: name }; //this.toObject(name);
data.action = "remove";
if (itemfield) {
    data.item =
        {
            name: itemfield.name,
            id: this.getObjectID(itemfield.data)
        };
}
var ajax = ghost.io.ajax({
    url: action,
    data: data,
    retry: ghost.io.RETRY_INFINITE,
    method: "POST"
}).
    then(function (result) {
    delete _this.promises[name];
}, function (error) {
    delete _this.promises[name];
    log.error(error);
});
this.promises[name] = ajax;
getField(element);
any;
{
    var cls;
    for (var p in ghost.browser.forms) {
        if (p == "Field") {
            continue;
        }
        if (ghost.utils.Strings.endsWith(p, "Field")) {
            if (ghost.browser.forms[p].match) {
                if (ghost.browser.forms[p].match(element)) {
                    return ghost.browser.forms[p];
                }
            }
            else {
            }
        }
    }
    return cls;
}
toRactive();
any;
{
    return this.toObject();
}
dispose();
void {
    if: function () { }, this: .$form };
{
    this.$form.off("submit");
    this.$form.find("[data-action]").off("click");
}
this.fields.forEach(function (field) {
    field.dispose();
});
this.off();
this.fields = null;
var Validator = (function () {
    function Validator() {
    }
    Validator.prototype.isValid = function (value) {
        return true;
    };
    return Validator;
})();
exports.Validator = Validator;
var TextValidator = (function (_super) {
    __extends(TextValidator, _super);
    function TextValidator() {
        _super.apply(this, arguments);
    }
    TextValidator.prototype.isValid = function (field) {
        return !field.required || field.getValue().length > 0;
    };
    return TextValidator;
})(Validator);
exports.TextValidator = TextValidator;
var Field = (function (_super) {
    __extends(Field, _super);
    function Field(name, data, element, _setInitialData, form) {
        _super.call(this);
        this.name = name;
        this.data = data;
        this.element = element;
        this._setInitialData = _setInitialData;
        this.form = form;
        this.required = false;
        if (!this.data) {
            this.data = {};
        }
        try {
            this.data_saved = ghost.utils.Objects.clone(this.data, "data", true);
        }
        catch (error) {
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
    Field.prototype.addValidator = function (validator) {
        this.validators.push(validator);
    };
    Field.prototype.initializeInput = function () {
        if (this.constructor && this.constructor["selector"]) {
            this.inputSelector = this.constructor["selector"];
        }
        if (this.inputSelector) {
            this.$input = $(this.element).find(this.inputSelector).addBack(this.inputSelector);
        }
    };
    Field.prototype.init = function () {
        if ($(this.element).attr("data-require") == "true") {
            this.required = true;
        }
        /*if(this.data && this.data.tags)
        {
            
        }*/
        var category = $(this.element).attr("data-category") || $(this.element).parents("form,[data-category]").attr("data-category");
        if (category) {
            if (!this.data[category]) {
                this.data[category] = {};
            }
            this.data = this.data[category];
        }
    };
    Field.prototype.setInitialValue = function () {
        if (this._setInitialData || this.data[this.name] == undefined) {
            this.data[this.name] = this.getValue();
        }
    };
    Field.prototype.bindEvents = function () {
        if (this.$input) {
            this.$input.on("change", this.onChangeBinded);
        }
    };
    Field.prototype.onChange = function (event) {
        /*    if( this.data[this.name]  != this.getValue())
            {
                this.data[this.name] = this.getValue();
                this.onChangeThrottle();
            }*/
        this.data[this.name] = this.getValue();
        console.log(this.name, this.data[this.name], this.data_saved[this.name]);
        if (!ghost.utils.Objects.deepEquals(this.data_saved[this.name], this.data[this.name])) {
            debugger;
            this.data_saved[this.name] = ghost.utils.Objects.clone(this.data[this.name], null, true);
            this.onChangeThrottle();
        }
        //dispatch event change for item
        //    this.trigger(Field.EVENT_CHANGE, this.data,
    };
    Field.prototype.triggerChange = function () {
        this.trigger(Field.EVENT_CHANGE, this.data[this.name], this);
    };
    Field.prototype.getValue = function () {
        return this.$input ? this.$input.val() : null;
    };
    Field.prototype.isValid = function () {
        var value = this.getValue();
        for (var p in this.validators) {
            if (!this.validators[p].isValid(this)) {
                return false;
            }
        }
        return true;
    };
    Field.prototype.dispose = function () {
        if (this.$input)
            this.$input.off("change", this.onChangeBinded);
        this.onChangeThrottle.cancel();
        this.form = null;
    };
    Field.match = function (element) {
        var selector = this.prototype.constructor["selector"];
        if (!selector) {
            return false;
        }
        if ($(element).find(selector).addBack(selector).length) {
            return true;
        }
        return false;
    };
    /**
     * CHANGE
     * @type {string}
     */
    Field.EVENT_CHANGE = "change";
    return Field;
})(ghost.events.EventDispatcher);
exports.Field = Field;
var ListField = (function (_super) {
    __extends(ListField, _super);
    function ListField(name, data, element, _setInitialData, form) {
        this.items = [];
        this.min = this.max = -1;
        //this.sublist = [];
        _super.call(this, name, data, element, _setInitialData, form);
    }
    ListField.prototype.onChange = function (data, input, name, itemField) {
        // this.onChangeThrottle(data, itemField);
        this.triggerChange(data, input, name, itemField);
    };
    ListField.prototype.triggerChange = function (data, input, name, itemField) {
        this.trigger(Field.EVENT_CHANGE, data, itemField.getItemIndex(), name, input);
    };
    ListField.prototype.init = function () {
        var _this = this;
        //don't count sublist
        var i = 0;
        $(this.element).find("[data-item]").toArray().map(function (item, index) {
            var $item = $(item);
            if (_this.isSubList(item)) {
                return null;
            }
            _this.addData(i);
            _this.addItem(i, item);
            i++;
            //this.items.push(new ItemField(this.name, this.data[this.name][index], item, this._setInitialData, this.form));
        });
        this.max = parseInt($(this.element).attr("data-max"), 10) || -1;
        this.min = parseInt($(this.element).attr("data-min"), 10) || -1;
        $(this.element).on("click", "[data-action]", function (event) {
            if (_this.isSubList(event.currentTarget)) {
                return;
            }
            _this[$(event.currentTarget).attr("data-action")](event.currentTarget);
        });
        this.sublist = this.getListItem("[data-list]", this.element, false).toArray().map(function (item) {
            return $(item).attr("data-list");
        });
        if (!this.sublist.length) {
            this.sublist = null;
        }
        while (this.length() < this.min) {
            this.add(false);
        }
        this.checkMinStatus();
        this.checkMaxStatus();
    };
    ListField.prototype.length = function () {
        return this.data[this.name] ? this.data[this.name].length : 0;
    };
    /**
     * Check if the list has reach the maximum number of items
     */
    ListField.prototype.checkMaxStatus = function () {
        if (this.isMaxReached()) {
            $(this.element).addClass("max_reached");
        }
        else {
            if (this.max != -1) {
                $(this.element).removeClass("max_reached");
            }
        }
    };
    ListField.prototype.checkMinStatus = function () {
        if (this.isMinReached()) {
            $(this.element).addClass("min_reached");
        }
        else {
            if (this.max != -1) {
                $(this.element).removeClass("min_reached");
            }
        }
    };
    ListField.prototype.isMaxReached = function () {
        return this.max != -1 && this.length() >= this.max;
    };
    ListField.prototype.isMinReached = function () {
        return this.min != -1 && this.length() <= this.min;
    };
    ListField.prototype.setInitialValue = function () {
        if (this._setInitialData || this.data[this.name] == undefined) {
            //  
            this.data[this.name] = [];
        }
    };
    ListField.prototype.add = function (focus) {
        if (focus === void 0) { focus = true; }
        if (this.isMaxReached()) {
            return;
        }
        if (!this.data[this.name] || !this.data[this.name].push) {
            this.data[this.name] = [];
        }
        debugger;
        //this.data[this.name].push({name:"test", tags:[]});
        var index = this.addData();
        var $last = this.getListItem("[data-item]", this.element).last(); //$(this.element).find("[data-item]").last();
        var item = this.addItem(index, $last);
        this.trigger(ListField.EVENT_ADD, item);
        //this.items.push(new ItemField(this.name, this.data[this.name][this.data[this.name].length-1], $last, this._setInitialData, this.form));
        if (focus) {
            var $element = $last.find("[data-focus]");
            if (!$element.length && $last.is("[data-focus]")) {
                $element = $last;
            }
            $element.focus();
        }
        this.checkMaxStatus();
        this.checkMinStatus();
    };
    ListField.prototype.addData = function (index) {
        if (!this.data[this.name] || !this.data[this.name].push) {
            this.data[this.name] = [];
        }
        if (index == undefined) {
            index = this.data[this.name].length;
        }
        while (this.data[this.name].length <= index) {
            var newItem = {};
            if (this.sublist) {
                for (var p in this.sublist) {
                    newItem[this.sublist[p]] = [];
                }
            }
            this.data[this.name].push(newItem);
        }
        return index;
    };
    ListField.prototype.addItem = function (index, item) {
        var lastItem = this.getListItem("[data-item]").eq(index);
        var itemField = new ItemField(this.name, this.data[this.name][index], lastItem, this._setInitialData, this.form);
        itemField.on(Field.EVENT_CHANGE, this.onChange, this, itemField);
        this.items.push(itemField);
        return itemField;
    };
    ListField.prototype.getListItem = function (selector, root, testSelf) {
        var _this = this;
        if (testSelf === void 0) { testSelf = true; }
        if (!root) {
            root = this.element;
        }
        var $root = $(root);
        return $root.find(selector).filter(function (index, item) {
            return !_this.isSubList(item, _this.name, testSelf);
        });
    };
    ListField.prototype.isSubList = function (element, listName, testSelf) {
        if (testSelf === void 0) { testSelf = true; }
        if (!listName) {
            listName = this.name;
        }
        return Form.isSubList(element, listName, testSelf);
    };
    ListField.prototype.remove = function (element) {
        if (this.isMinReached()) {
            //no remove
            return;
        }
        var $item = $(element).parents("[data-item]");
        var i = parseInt($item.attr("data-item"), 10);
        if (!isNaN(i)) {
            this.data[this.name].splice(i, 1);
        }
        this.trigger(ListField.EVENT_REMOVE);
        this.getListItem("[data-item]", this.element).find("[data-focus]").focus();
        this.checkMinStatus();
        this.checkMaxStatus();
    };
    ListField.prototype.dispose = function () {
        if (this.items) {
            this.items.forEach(function (field) {
                field.dispose();
            });
            this.items = null;
        }
        this.off();
        _super.prototype.dispose.call(this);
    };
    ListField.selector = null; //"[data-list]";
    ListField.EVENT_ADD = "add_item";
    ListField.EVENT_REMOVE = "remove_item";
    return ListField;
})(Field);
exports.ListField = ListField;
var ItemField = (function (_super) {
    __extends(ItemField, _super);
    function ItemField(name, data, element, _setInitialData, form) {
        _super.call(this, name, data, element, _setInitialData, form);
        this.change_timeout = -1;
        this.fields = [];
        this._inputs = [];
        this._values = [];
    }
    ItemField.prototype.getID = function () {
        return this.data[this.id_name];
    };
    ItemField.prototype.hasID = function () {
        return this.getID() != null;
    };
    ItemField.prototype.setID = function (id) {
        this.data[this.id_name] = id;
    };
    ItemField.prototype.getItemIndex = function () {
        return parseInt($(this.element).attr("data-item"), 10);
    };
    ItemField.prototype.triggerChange = function () {
        this.trigger(Field.EVENT_CHANGE, this.data);
    };
    ItemField.prototype.init = function () {
        Form.prototype.retrieveFields.call(this, this.element, this.name);
        this.fields.forEach(function (item) {
            item.on(Field.EVENT_CHANGE, this.onChange, this);
        }, this);
        this.id_name = $(this.element).attr("data-id-name") ? $(this.element).attr("data-id-name") : "id";
    };
    ItemField.prototype.onAdd = function (newItem, name, list) {
        this.form.onAdd(newItem, name, list, this);
    };
    ItemField.prototype.onRemove = function (name, list) {
        console.warn("Hey developer YOU MUST REMOVE _values and _inputs linked");
        debugger;
        if (this.change_timeout != -1) {
            clearTimeout(this.change_timeout);
        }
        this.form.onRemove(name, list, this);
    };
    ItemField.prototype.dispose = function () {
        if (this.fields) {
            this.fields.forEach(function (field) {
                field.dispose();
            });
            this.fields = null;
        }
        this.off();
        _super.prototype.dispose.call(this);
    };
    ItemField.prototype.setInitialValue = function () {
    };
    ItemField.prototype.onChange = function (value, input, name) {
        debugger;
        /*    if( this.data[this.name]  != this.getValue())
         {
         this.data[this.name] = this.getValue();
         this.onChangeThrottle();
         }*/
        this.data[this.name] = this.getValue();
        if (!ghost.utils.Objects.deepEquals(this.data_saved[this.name], this.data[this.name])) {
            debugger;
            this.data_saved[this.name] = ghost.utils.Objects.clone(this.data[this.name], null, true);
            this.delayChange(input, name, value);
        }
    };
    ItemField.prototype.delayChange = function (input, name, value) {
        if (this.change_timeout != -1) {
            clearTimeout(this.change_timeout);
        }
        if (input) {
            var index;
            if ((index = this._inputs.indexOf(input)) == -1) {
                index = this._inputs.length;
                this._inputs.push(input);
            }
            this._values[index] = { name: name, value: value };
        }
        if (this.hasID()) {
            this.change_timeout = -1;
            //this.onChangeThrottle();
            this._inputs.forEach(function (item, index) {
                this.trigger(Form.EVENT_CHANGE, this._values[index].value, item, this._values[index].name);
            }, this);
            this._inputs.length = this._values.length = 0;
        }
        else {
            this.change_timeout = setTimeout(this.delayChange.bind(this), 500);
        }
    };
    ItemField.selector = null; // "[data-list]";
    return ItemField;
})(Field);
exports.ItemField = ItemField;
var InputTextField = (function (_super) {
    __extends(InputTextField, _super);
    function InputTextField() {
        _super.apply(this, arguments);
    }
    /*public constructor( public name:string, protected data:any, public element:any, protected _setInitialData:boolean, protected form:Form)
    {
        super(name, data, element, _setInitialData, form);
    }*/
    InputTextField.prototype.init = function () {
        _super.prototype.init.call(this);
        this.validators.push(new TextValidator());
    };
    InputTextField.prototype.bindEvents = function () {
        _super.prototype.bindEvents.call(this);
        if (this.$input)
            this.$input.on("keyup", this.onChangeBinded);
    };
    InputTextField.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        if (this.$input)
            this.$input.off("keyup", this.onChangeBinded);
    };
    InputTextField.selector = "input[type='text']";
    return InputTextField;
})(Field);
exports.InputTextField = InputTextField;
var InputFileField = (function (_super) {
    __extends(InputFileField, _super);
    function InputFileField() {
        _super.apply(this, arguments);
    }
    InputFileField.prototype.init = function () {
        _super.prototype.init.call(this);
        if (!$(this.element).find("input[type='file']").length) {
            $(this.element).append('<input type="file" name="' + $(this.element).attr("data-field") + '">');
        }
        this.inputFile = $(this.element).find("input[type='file']").get(0);
        this.preview = $(this.element).find("[data-preview]").get(0);
        //     this.validators.push(new TextValidator());
    };
    InputFileField.prototype.bindEvents = function () {
        var _this = this;
        _super.prototype.bindEvents.call(this);
        if (this.$input) {
            this.$input.on("change", function (event) {
                ghost.browser.io.FileAPI.loadFile(_this.inputFile).
                    then(function (event) {
                    if (!event) {
                        //empty file
                        if (_this.preview) {
                            _this.preview.src = null;
                            _this.$input.removeClass("preview");
                        }
                    }
                    var file = event.currentTarget;
                    if (_this.preview) {
                        _this.preview.src = file.result;
                        _this.$input.addClass("preview");
                    }
                    ghost.io.ajax({
                        url: "/candidate/models/cv",
                        method: "POST",
                        data: { picture: file.result }
                    }).then(function (data) {
                        debugger;
                    }, function (error) {
                        debugger;
                    });
                }, function (error) {
                    if (_this.preview) {
                        _this.preview.src = null;
                        _this.$input.removeClass("preview");
                    }
                });
            });
            //this.$input.on("keyup", this.onChangeBinded);
            this.$input.on("click", function (event) {
                if ($(event.target).get(0) === _this.inputFile) {
                    return;
                }
                $(_this.inputFile).trigger("click");
            });
        }
    };
    InputFileField.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        if (this.$input)
            this.$input.off("keyup", this.onChangeBinded);
    };
    InputFileField.selector = "[data-type='picture']";
    return InputFileField;
})(Field);
exports.InputFileField = InputFileField;
var TextareaField = (function (_super) {
    __extends(TextareaField, _super);
    function TextareaField() {
        _super.apply(this, arguments);
    }
    TextareaField.prototype.init = function () {
        _super.prototype.init.call(this);
        this.validators.push(new TextValidator());
    };
    TextareaField.prototype.bindEvents = function () {
        _super.prototype.bindEvents.call(this);
        if (this.$input)
            this.$input.on("keyup", this.onChangeBinded);
    };
    TextareaField.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        if (this.$input)
            this.$input.off("keyup", this.onChangeBinded);
    };
    TextareaField.selector = "textarea";
    return TextareaField;
})(Field);
exports.TextareaField = TextareaField;
var InputHiddenField = (function (_super) {
    __extends(InputHiddenField, _super);
    function InputHiddenField() {
        _super.apply(this, arguments);
    }
    InputHiddenField.prototype.init = function () {
        _super.prototype.init.call(this);
        //this.validators.push(new TextValidator());
    };
    InputHiddenField.selector = "input[type='hidden']";
    return InputHiddenField;
})(Field);
exports.InputHiddenField = InputHiddenField;
var InputListField = (function (_super) {
    __extends(InputListField, _super);
    function InputListField() {
        _super.apply(this, arguments);
    }
    InputListField.prototype.init = function () {
        _super.prototype.init.call(this);
        this.validators.push(new TextValidator());
    };
    InputListField.prototype.bindEvents = function () {
        _super.prototype.bindEvents.call(this);
    };
    InputListField.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
    };
    InputListField.selector = "select";
    return InputListField;
})(Field);
exports.InputListField = InputListField;
//# sourceMappingURL=Form.js.map