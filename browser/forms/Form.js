var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<module="mvc"/>
///<module="apis"/>
///<module="framework/ghost/utils"/>
///<module="framework/browser/io"/>
///<module="framework/ghost/events"/>
var ghost;
(function (ghost) {
    var browser;
    (function (browser) {
        var forms;
        (function (forms) {
            //Gérer le choix par autocomplete (tjs id (du model auquel on lie pas de la relation)? )
            //comme ça l'id de la relation ne change pas c'est + simple
            //gérer la disparition de la liste ? et là les mixins manquent :(
            //verifier les images
            //PHP :'(
            /**
             * Form management
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
                Form.prototype.prefix = function () {
                    if (this.$form.attr("data-prefix")) {
                        return this.$form.attr("data-prefix");
                    }
                    return null;
                };
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
                    var prefix = this.prefix();
                    if (prefix) {
                        var tmp = {};
                        tmp[prefix] = data;
                        data = tmp;
                    }
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
                            field.on(Field.EVENT_AUTOCOMPLETE, _this.onAutocomplete, _this, name);
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
                    if (this instanceof ItemField && (!fields || fields.length == 0)) {
                        debugger;
                    }
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
                        _this[$this.attr("data-action")](event.currentTarget);
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
                Form.prototype.onAutocomplete = function (value) {
                    var _this = this;
                    var name = "___autocomplete" + this._getDataItemName(value);
                    if (this.promises[name]) {
                        this.promises[name].cancel();
                    }
                    var action = this.getAction();
                    var data = { action: "autocomplete",
                        value: this._getDataItemData(value)
                    };
                    var prefix = this.prefix();
                    if (prefix) {
                        var tmp = {};
                        tmp[prefix] = data;
                        data = tmp;
                    }
                    var ajax = ghost.io.ajax({
                        url: action,
                        data: data,
                        retry: 3,
                        method: "POST"
                    }).
                        then(function (result) {
                        delete _this.promises[name];
                        value[0].input.setAutocomplete(result.autocomplete);
                        _this.data.trigger(ghost.mvc.Model.EVENT_CHANGE);
                        console.log(value[value.length - 1].name);
                    }, function (error) {
                        debugger;
                        delete _this.promises[name];
                    });
                    this.promises[name] = ajax;
                };
                Form.prototype.onChange = function (value) {
                    var _this = this;
                    var name = this._getDataItemName(value);
                    this.trigger(Form.EVENT_CHANGE + ":" + name, name, value);
                    console.log(Form.EVENT_CHANGE + ":" + name, name, value);
                    if (!this.autosave) {
                        return;
                    }
                    if (this.promises[name]) {
                        this.promises[name].cancel();
                    }
                    var action = this.getAction();
                    var data = { action: "autosave",
                        value: this._getDataItemData(value)
                    };
                    var prefix = this.prefix();
                    if (prefix) {
                        var tmp = {};
                        tmp[prefix] = data;
                        data = tmp;
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
                    });
                    this.promises[name] = ajax;
                };
                Form.prototype.getObjectID = function (data) {
                    if (data.id) {
                        return data.id;
                    }
                    for (var p in data) {
                        if (p.substring(0, 3) == "id_") {
                            return data[p];
                        }
                    }
                };
                Form.prototype._getDataItemName = function (dataItems) {
                    return dataItems.reduce(function (previous, item) {
                        if (previous) {
                            previous = "/" + previous;
                        }
                        else {
                            previous = "";
                        }
                        return item.name + (item.id != undefined ? item.id : "") + previous;
                    }, null);
                };
                Form.prototype._getDataItemData = function (dataItems) {
                    return dataItems.map(function (item) {
                        var data = {};
                        for (var p in item) {
                            if (p != "input" && p != "list" && item.hasOwnProperty(p)) {
                                data[p] = item[p];
                            }
                        } /*
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
                };
                Form.prototype.onAdd = function (dataItems) {
                    var _this = this;
                    var name = this._getDataItemName(dataItems);
                    this.trigger(Form.EVENT_ADD_ITEM, dataItems);
                    if (!this.autosave) {
                        return;
                    }
                    var item = dataItems[0].input;
                    var action = this.getAction();
                    var data = {
                        action: "add",
                        value: this._getDataItemData(dataItems)
                    };
                    var prefix = this.prefix();
                    if (prefix) {
                        var tmp = {};
                        tmp[prefix] = data;
                        data = tmp;
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
                            item.setID(result.id);
                        }
                    }, function (error) {
                        delete _this.promises[name];
                        log.error(error);
                    });
                    this.promises[name] = ajax;
                };
                Form.prototype.onRemove = function (dataItems) {
                    var _this = this;
                    var name = this._getDataItemName(dataItems);
                    this.trigger(Form.EVENT_REMOVE_ITEM, dataItems);
                    if (!this.autosave) {
                        return;
                    }
                    if (this.promises[name]) {
                        this.promises[name].cancel();
                    }
                    var data = {
                        action: "remove",
                        value: this._getDataItemData(dataItems)
                    };
                    var prefix = this.prefix();
                    if (prefix) {
                        var tmp = {};
                        tmp[prefix] = data;
                        data = tmp;
                    }
                    var action = this.getAction();
                    var ajax = ghost.io.ajax({
                        url: action,
                        data: data,
                        retry: ghost.io.RETRY_INFINITE,
                        method: "POST"
                    }).
                        then(function (result) {
                        delete _this.promises[name];
                    }, function (error) {
                        debugger;
                        delete _this.promises[name];
                        log.error(error);
                    });
                    this.promises[name] = ajax;
                };
                Form.getField = function (element) {
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
                };
                Form.prototype.toRactive = function () {
                    return this.toObject();
                };
                Form.prototype.dispose = function () {
                    if (this.$form) {
                        this.$form.off("submit");
                        this.$form.find("[data-action]").off("click");
                    }
                    this.fields.forEach(function (field) {
                        field.dispose();
                    });
                    this.off();
                    this.fields = null;
                };
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
            var Validator = (function () {
                function Validator() {
                }
                Validator.prototype.isValid = function (value) {
                    return true;
                };
                return Validator;
            })();
            forms.Validator = Validator;
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
            forms.TextValidator = TextValidator;
            var Field = (function (_super) {
                __extends(Field, _super);
                // protected autocompleted:boolean;
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
                Field.prototype.chooseAutocomplete = function (index) {
                    if (this.data["autocompletion"] && this.data["autocompletion"].length > index) {
                        console.log("autocomplete");
                        var value;
                        for (var p in this.data["autocompletion"][index]) {
                            if (p == "id") {
                                continue;
                            }
                            value = this.data["autocompletion"][index][p];
                            if (value != null) {
                                this.data[p] = value;
                            }
                        }
                        this.data["autocompleted"] = true;
                        this.data_saved[this.name] = ghost.utils.Objects.clone(this.data[this.name], null, true);
                        this.onChangeThrottle();
                        //    debugger;
                        //this.data[this.name] = this.data["autocompletion"][index]["name"];
                        //debugger;
                        this.form.data.trigger(ghost.mvc.Model.EVENT_CHANGE);
                    }
                };
                Field.prototype.setAutocomplete = function (data) {
                    //debugger;
                    this.data["autocompletion"] = data;
                    //debugger;
                };
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
                    if ($(this.element).attr("data-autocomplete") != undefined)
                        debugger;
                    this.autocomplete = true;
                    this.data["autocompletion"] = [];
                    this.itemAutocomplete = new ItemAutocomplete(this, $(this.element).find("[data-autocomplete-list]"));
                    //                this.data["autocomplete"] = ListField.prototype.getListItem.call(this, )
                    this.onAutocompleteThrottle = ghost.utils.Buffer.throttle(this.triggerAutocomplete.bind(this), 50);
                };
                /**
                 * CHANGE
                 * @type {string}
                 */
                Field.EVENT_CHANGE = "change";
                Field.EVENT_AUTOCOMPLETE = "autocomplete";
                return Field;
            })(ghost.events.EventDispatcher);
            forms.Field = Field;
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
        })(forms = browser.forms || (browser.forms = {}));
    })(browser = ghost.browser || (ghost.browser = {}));
})(ghost || (ghost = {}));
setInitialValue();
void {
    if: function () { }, this: ._setInitialData || this.data[this.name] == undefined };
{
    this.data[this.name] = this.getValue();
}
bindEvents();
void {
    if: function () { }, this: .$input };
{
    this.$input.on("change", this.onChangeBinded);
}
onChange(event, any);
void {
    console: .log("on change"),
    /*    if( this.data[this.name]  != this.getValue())
        {
            this.data[this.name] = this.getValue();
            this.onChangeThrottle();
        }*/
    this: .data[this.name] = this.getValue(),
    //console.log(this.name, this.data[this.name], this.data_saved[this.name]);
    if: function () { } };
!ghost.utils.Objects.deepEquals(this.data_saved[this.name], this.data[this.name]);
{
    this.onChangeValidated();
}
onChangeValidated();
void {
    if: function () { }, this: .data["autocompletion"] };
{
    if (this.data["autocompletion"].length) {
        this.data["autocompletion"].length = 0;
        this.form.data.trigger(ghost.mvc.Model.EVENT_CHANGE);
    }
    var resets = this.itemAutocomplete.getReset();
    for (var p in resets) {
        delete this.data[resets[p]];
    }
    this.data["autocompleted"] = false;
    //TODO:mode where autocompletion is on with empty string + on start
    if (this.data[this.name] != "") {
        this.onAutocompleteThrottle();
    }
}
this.data_saved[this.name] = ghost.utils.Objects.clone(this.data[this.name], null, true);
this.onChangeThrottle();
triggerAutocomplete();
void {
    if: function () { }, this: .autocomplete && !this.data["autocompleted"] };
{
    this.trigger(Field.EVENT_AUTOCOMPLETE, [{ value: this.data[this.name], input: this, name: this.name }]);
}
triggerChange();
void {
    //this.trigger(Field.EVENT_CHANGE, this.data[this.name], this);
    this: .trigger(Field.EVENT_CHANGE, [{ value: this.data[this.name], input: this, name: this.name }])
};
getValue();
any;
{
    return this.$input ? this.$input.val() : null;
}
isValid();
boolean;
{
    var value = this.getValue();
    for (var p in this.validators) {
        if (!this.validators[p].isValid(this)) {
            return false;
        }
    }
    return true;
}
dispose();
void {
    if: function () { }, this: .$input,
    this: .$input.off("change", this.onChangeBinded),
    this: .onChangeThrottle.cancel(),
    this: .form = null
};
match(element, any);
boolean;
{
    var selector = this.prototype.constructor["selector"];
    if (!selector) {
        return false;
    }
    if ($(element).find(selector).addBack(selector).length) {
        return true;
    }
    return false;
}
var ItemAutocomplete = (function () {
    function ItemAutocomplete(field, $list) {
        this.field = field;
        this.$list = $list;
        this.init();
    }
    ItemAutocomplete.prototype.init = function () {
        this.reset = [];
        var _this = this;
        this.reset = this.$list.attr("data-autocomplete-reset");
        if (this.reset) {
            this.reset = this.reset.split(",");
        }
        this.$list.on("click", "[data-autocomplete-item]", function (event) {
            var id = parseInt($(this).attr("data-autocomplete-item"), 10);
            if (!isNaN(id)) {
                _this.field.chooseAutocomplete(id);
            }
        });
    };
    ItemAutocomplete.prototype.getReset = function () {
        return this.reset;
    };
    return ItemAutocomplete;
})();
exports.ItemAutocomplete = ItemAutocomplete;
var ListField = (function (_super) {
    __extends(ListField, _super);
    function ListField(name, data, element, _setInitialData, form) {
        this.items = [];
        this.min = this.max = -1;
        //this.sublist = [];
        _super.call(this, name, data, element, _setInitialData, form);
    }
    ListField.prototype.onChange = function (data, input, name, itemField) {
        if (!data) {
            debugger;
        }
        data[data.length - 1].name = this.name;
        data[data.length - 1].list = this;
        // this.onChangeThrottle(data, itemField);
        this.triggerChange(data, input, name, itemField);
    };
    ListField.prototype.triggerChange = function (data, input, name, itemField) {
        this.trigger(Field.EVENT_CHANGE, data, input, itemField.getItemIndex(), name);
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
            this.add(false, true);
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
    ListField.prototype.add = function (focus, isInit) {
        if (focus === void 0) { focus = true; }
        if (isInit === void 0) { isInit = false; }
        if (this.isMaxReached()) {
            return;
        }
        if (!this.data[this.name] || !this.data[this.name].push) {
            this.data[this.name] = [];
        }
        //this.data[this.name].push({name:"test", tags:[]});
        var model;
        //hack of ractive => use previous data to set the new item
        if (!isInit) {
            if (this.items.length) {
                model = this.items[this.items.length - 1].cloneData();
            }
        }
        var index = this.addData(this.data[this.name].length, model);
        var $last = this.getListItem("[data-item]", this.element).last(); //$(this.element).find("[data-item]").last();
        var item = this.addItem(index, $last);
        ///hack of ractive => use constructed data to rebuild the first item
        if (!isInit && this.items.length == 1) {
            model = item.cloneData();
            this.data[this.name].splice(0, 1);
            //this.data[this.name].push(item.data);
            this.items[0].dispose();
            this.items.splice(0, 1);
            var index = this.addData(this.data[this.name].length, model);
            var $last = this.getListItem("[data-item]", this.element).last(); //$(this.element).find("[data-item]").last();
            var item = this.addItem(index, $last);
        }
        /*if(!isInit) {
            item.cloneData();
            this.data[this.name].splice(index, 1);
            this.data[this.name].push(item.data);
        }*/
        //  this.trigger(ListField.EVENT_ADD, item);
        this.trigger(ListField.EVENT_ADD, [{ name: this.name, list: this, input: item }]);
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
    ListField.prototype.addData = function (index, model) {
        if (!this.data[this.name] || !this.data[this.name].push) {
            this.data[this.name] = [];
        }
        if (index == undefined) {
            index = this.data[this.name].length;
        }
        if (!model) {
            model = {};
        }
        while (this.data[this.name].length <= index) {
            var newItem = this.data[this.name].length == index ? model : ghost.utils.Objects.clone(model); //{};
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
        itemField.on(Field.EVENT_AUTOCOMPLETE, this.onAutocomplete, this, itemField);
        itemField.on(ListField.EVENT_ADD, this.onAdd, this, itemField);
        itemField.on(ListField.EVENT_REMOVE, this.onRemove, this, itemField);
        this.items.push(itemField);
        return itemField;
    };
    ListField.prototype.onAdd = function (data /*newItem:ItemField, name:string, list:ListField*/) {
        // this.form.onAdd(newItem, name, list, this);
        data[data.length - 1].name = this.name;
        data[data.length - 1].list = this;
        this.trigger(ListField.EVENT_ADD, data);
    };
    ListField.prototype.onAutocomplete = function (data) {
        data[data.length - 1].name = this.name;
        data[data.length - 1].list = this;
        this.trigger(Field.EVENT_AUTOCOMPLETE, data);
    };
    ListField.prototype.onRemove = function (data) {
        data[data.length - 1].name = this.name;
        data[data.length - 1].list = this;
        this.trigger(ListField.EVENT_REMOVE, data);
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
        //this.trigger(ListField.EVENT_REMOVE, [{name:this.name, list:this, input:this.items[i], id:(<ItemField>this.items[i]).getID()}]);
        //this.items.splice(i, 1);
        this.items[i].remove();
        this.items.splice(i, 1);
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
        _super.dispose.call(this);
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
        this.remove_timeout = -1;
        //TODO:change to IChangeData
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
    ItemField.prototype.cloneData = function (data) {
        var clone = {};
        if (!data) {
            data = this.data;
        }
        for (var p in data) {
            if (data.hasOwnProperty(p) && data[p] !== null) {
                if (typeof data[p] == "object") {
                    if (ghost.utils.Arrays.isArray(data[p])) {
                        clone[p] = [];
                    }
                    else
                        clone[p] = this.cloneData(data[p]);
                }
            }
        }
        return clone;
    };
    ItemField.prototype.init = function () {
        if (this.initialized) {
            debugger;
        }
        this.fields = [];
        this._inputs = [];
        this._values = [];
        this.initialized = true;
        Form.prototype.retrieveFields.call(this, this.element, this.name);
        this.fields.forEach(function (item) {
            //  item.on(Field.EVENT_CHANGE, this.onChange, this);
        }, this);
        this.id_name = $(this.element).attr("data-id-name") ? $(this.element).attr("data-id-name") : "id";
        this.additionals = $(this.element).attr("data-additionals") ? $(this.element).attr("data-additionals").split(",") : null;
    };
    ItemField.prototype.onAdd = function (value /*newItem:ItemField, name:string, list:ListField*/) {
        // this.form.onAdd(newItem, name, list, this);
        value.push({ input: this, id: this.getID() });
        this.trigger(ListField.EVENT_ADD, value);
    };
    ItemField.prototype.onAutocomplete = function (value) {
        value.push({ input: this, id: this.getID() });
        this.trigger(Field.EVENT_AUTOCOMPLETE, value);
    };
    ItemField.prototype.onRemove = function (value) {
        /*console.warn("Hey developer YOU MUST REMOVE _values and _inputs linked");
        debugger;
        if(this.change_timeout != -1)
        {
            clearTimeout(this.change_timeout);
        }
        this.form.onRemove(name, list, this);*/
        value.push({ input: this, id: this.getID() });
        this.trigger(ListField.EVENT_REMOVE, value);
    };
    ItemField.prototype.remove = function () {
        if (this.remove_timeout != -1) {
            clearTimeout(this.remove_timeout);
        }
        if (this.change_timeout != -1) {
            clearTimeout(this.change_timeout);
            this.change_timeout = -1;
        }
        if (this.hasID()) {
            this.remove_timeout = -1;
            this.trigger(ListField.EVENT_REMOVE, [{ input: this, id: this.getID() }]);
            this.dispose();
        }
        else {
            this.remove_timeout = setTimeout(this.remove.bind(this), 500);
        }
    };
    ItemField.prototype.dispose = function () {
        if (this.fields) {
            this.fields.forEach(function (field) {
                field.dispose();
            });
            this.fields = null;
        }
        this._inputs = null;
        this._values = null;
        this.off();
        _super.dispose.call(this);
    };
    ItemField.prototype.setInitialValue = function () {
    };
    ItemField.prototype.onChange = function (value, input, name) {
        /*    if( this.data[this.name]  != this.getValue())
         {
         this.data[this.name] = this.getValue();
         this.onChangeThrottle();
         }*/
        /*var name:string = value[value.length-1].name;
       // this.data[this.name] = this.getValue();
        /*debugger;
        if(!ghost.utils.Objects.deepEquals(this.data_saved[name],this.data[name]))
        {
            this.data_saved[name] = ghost.utils.Objects.clone(this.data[name], null, true);
            this.delayChange(value);
        }*/
        this.delayChange(value);
    };
    ItemField.prototype.delayChange = function (value) {
        if (this.change_timeout != -1) {
            clearTimeout(this.change_timeout);
        }
        if (value) {
            var item = value[0];
            var input = item.input;
            var index;
            if ((index = this._inputs.indexOf(input)) == -1) {
                index = this._inputs.length;
                this._inputs.push(input);
            }
            this._values[index] = value;
        }
        if (this.hasID()) {
            this.change_timeout = -1;
            //this.onChangeThrottle();
            this._inputs.forEach(function (item, index) {
                this._values[index].push({ input: this, id: this.getID() });
                if (this.additionals) {
                    for (var p in this.additionals) {
                        this._values[index][0][this.additionals[p]] = this.data[this.additionals[p]];
                    }
                }
                this.trigger(Form.EVENT_CHANGE, this._values[index], item, this._values[index].name);
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
var GMapField = (function (_super) {
    __extends(GMapField, _super);
    function GMapField() {
        _super.apply(this, arguments);
    }
    /*public constructor( public name:string, protected data:any, public element:any, protected _setInitialData:boolean, protected form:Form)
     {
     super(name, data, element, _setInitialData, form);
     }*/
    GMapField.prototype.init = function () {
        _super.init.call(this);
        this.validators.push(new TextValidator());
    };
    GMapField.prototype.bindEvents = function () {
        _super.bindEvents.call(this);
        if (this.$input)
            this.$input.on("keyup", this.onChangeBinded);
    };
    GMapField.prototype.dispose = function () {
        _super.dispose.call(this);
        if (this.$input)
            this.$input.off("keyup", this.onChangeBinded);
    };
    GMapField.prototype.setAutocomplete = function (data) {
        if (data) {
            this.data["autocompletion"] = data;
        }
        //debugger;
    };
    GMapField.prototype.onChangeValidated = function () {
        var _this = this;
        _super.onChangeValidated.call(this);
        if (!this.data[this.name] || this.data[this.name].length < 3) {
            return;
        }
        ghost.browser.apis.GMap.geocode(this.data[this.name], false).then(function (result) {
            result = result.map(function (item) {
                item.name = item.formatted_address;
                return item;
            });
            _this.setAutocomplete(result);
            _this.form.data.trigger(ghost.mvc.Model.EVENT_CHANGE);
            console.log("MAP");
        }, function () { debugger; });
    };
    GMapField.selector = "[data-type='gmap']";
    return GMapField;
})(Field);
exports.GMapField = GMapField;
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
        _super.init.call(this);
        this.validators.push(new TextValidator());
    };
    InputTextField.prototype.bindEvents = function () {
        _super.bindEvents.call(this);
        if (this.$input)
            this.$input.on("keyup", this.onChangeBinded);
    };
    InputTextField.prototype.dispose = function () {
        _super.dispose.call(this);
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
        _super.init.call(this);
        if (!$(this.element).find("input[type='file']").length) {
            $(this.element).append('<input type="file" name="' + $(this.element).attr("data-field") + '">');
        }
        this.inputFile = $(this.element).find("input[type='file']").get(0);
        this.preview = $(this.element).find("[data-preview]").get(0);
        //     this.validators.push(new TextValidator());
    };
    InputFileField.prototype.bindEvents = function () {
        var _this = this;
        _super.bindEvents.call(this);
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
        _super.dispose.call(this);
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
        _super.init.call(this);
        this.validators.push(new TextValidator());
    };
    TextareaField.prototype.bindEvents = function () {
        _super.bindEvents.call(this);
        if (this.$input)
            this.$input.on("keyup", this.onChangeBinded);
    };
    TextareaField.prototype.dispose = function () {
        _super.dispose.call(this);
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
        _super.init.call(this);
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
        _super.init.call(this);
        this.validators.push(new TextValidator());
    };
    InputListField.prototype.bindEvents = function () {
        _super.bindEvents.call(this);
    };
    InputListField.prototype.dispose = function () {
        _super.dispose.call(this);
    };
    InputListField.selector = "select";
    return InputListField;
})(Field);
exports.InputListField = InputListField;
//# sourceMappingURL=Form.js.map