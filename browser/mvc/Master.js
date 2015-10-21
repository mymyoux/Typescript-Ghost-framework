///<module="io"/>
///<file="IData"/>
///<file="Controller"/>
///<file="Template"/>
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var _this = this;
///<lib="ractive"/>
///<module="framework/ghost/promises"/>
///<module="framework/browser/debug"/>
var ghost;
(function (ghost) {
    var mvc;
    (function (mvc) {
        var _this = this;
        var Master = (function (_super) {
            __extends(Master, _super);
            function Master() {
                _super.call(this);
                this._firstActivation = true;
                this._activated = false;
                this._data = [];
                this._parts = [];
            }
            Master.prototype.navigation = function () {
                return ghost.browser.navigation.Navigation.instance;
            };
            Master.prototype.addData = function (name, value) {
                this._parts.push(null);
                if (typeof name == "string") {
                    this._data.push(new Data(name, value));
                }
                else {
                    //additional parts
                    if ((name.parts || name.ractive || name.name) && name.data) {
                        this._parts[this._parts.length - 1] = name;
                        name = name.data;
                        delete this._parts[this._parts.length - 1].data;
                    }
                    if (typeof name == "function") {
                        name = ghost.mvc.Model.get(name, true);
                    }
                    this._data.push(name);
                }
            };
            Master.prototype.getData = function (asked) {
                if (typeof asked == "function") {
                    for (var p in this._data) {
                        if (this._data[p] instanceof asked)
                            return this._data[p];
                    }
                }
                else if (typeof asked == "string") {
                    for (var p in this._data) {
                        if (this._data[p].name() == asked) {
                            if (this._data[p] instanceof Data)
                                return this._data[p].value;
                            else
                                return this._data[p];
                        }
                    }
                }
                else {
                    //index
                    return this._data[asked];
                }
                return null;
            };
            Master.prototype._setData = function () {
                var data = this.getInitialData();
                if (data)
                    data.forEach(this.addData, this);
                this.setData();
            };
            Master.prototype.setData = function () {
            };
            /**
             * Override this function to enable params mapping
             * @returns Array of string
             */
            Master.prototype.getParamsMapping = function () {
                return null;
            };
            Master.prototype.setParameters = function (params) {
                var mapping = this.getParamsMapping();
                if (mapping) {
                    if (!params) {
                        params = [];
                    }
                    this.paramsFromActivation = mapping.reduce(function (result, data, index) {
                        if (params.length > index) {
                            result[mapping[index]] = params[index];
                        }
                        return result;
                    }, {});
                }
                else {
                    this.paramsFromActivation = params;
                }
            };
            Master.prototype.getInitialData = function () {
                return null;
            };
            Master.prototype.getActivationParams = function () {
                return this.paramsFromActivation;
            };
            /**
             * Called when the controller is asked for activation
             * @protected
             */
            Master.prototype._preactivate = function (params) {
                var _this = this;
                this.setParameters(params);
                if (this._activated) {
                    //already activating/ed
                    return;
                }
                this._activated = true;
                Promise.series([this.initializeFirstData.bind(this), this.initializeView.bind(this), this.initializeData.bind(this), this.isActivated.bind(this), this.firstActivation.bind(this)]).
                    then(function () {
                    //if could have been turn off
                    if (_this.isActivated()) {
                        try {
                        }
                        finally {
                        }
                        _this.render();
                        _this.activation();
                    }
                    try { }
                    catch (error) {
                        console.error(error);
                        debugger;
                        //disallow es6promise to catch this error
                        setTimeout(function () {
                            throw error;
                        }, 0);
                    }
                });
            };
            /**
             * List of events
             * @type {{ACTIVATED: (ACTIVATED), DISACTIVATED: (DISACTIVATED)}}
             */
            Master.EVENTS = Controller.EVENTS;
            return Master;
        })(Controller);
        mvc.Master = Master;
        (function (error) {
            console.error("Master failed during preactivation", _this, error);
        });
        ;
    })(mvc = ghost.mvc || (ghost.mvc = {}));
})(ghost || (ghost = {}));
bindEvents();
void {};
unbindEvents();
void {};
_predisactivate();
void {
    if: function () { }, this: ._activated };
{
    ghost.events.Eventer.off(ghost.events.Eventer.APPLICATION_RESUME, this.resume, this);
    ghost.events.Eventer.off(ghost.events.Eventer.APPLICATION_PAUSE, this.pause, this);
    this._data.forEach(function (item, index) {
        var events = _this._parts[index] && _this._parts[index].events ? _this._parts[index].events : [ghost.mvc.Model.EVENT_CHANGE];
        var event;
        for (var p in events) {
            event = events[p];
            if (item instanceof ghost.events.EventDispatcher) {
                item.off(event, _this._onModelChange, _this);
            }
            else {
                for (var p in item) {
                    if (item[p] instanceof ghost.events.EventDispatcher) {
                        item[p].off(event, _this._onModelChange, _this);
                    }
                }
            }
        }
    });
    this.disactivate();
    this.unbindEvents();
    this.trigger(Master.EVENTS.DISACTIVATED);
    this.hideContainer();
    if (this.template) {
        ghost.browser.i18n.Polyglot.instance().off("resolved:" + this.getTranslationTemplate(), this._onTranslationChange, this);
        /*var listener:any = this.getBindedFunctions();
        if(listener)
        {
            for(var p in listener)
            {
                this.template.off(p, listener[p]);
                
            }
        }*/
        //TODO:maybe dont remove template
        this.template.teardown();
    }
    this._activated = false;
}
isActivated();
boolean;
{
    return this._activated;
}
initializeFirstData();
Promise( | boolean, {
    console: .log(this, this._data),
    if: function () { }, this: ._data.length });
{
    return true;
}
this._setData();
return true;
initializeView();
Promise( | boolean, {
    if: function () { } }, !this.templateData);
{
    //var _this:Master = this;
    var template = this._getTemplate();
    if (!template) {
        console.warn("no template for master:", this);
        return true;
    }
    var temp = Template.getTemplate(template);
    if (temp) {
        this.templateData = temp;
        console.log("already loaded:", this.name());
        return true;
    }
    var promise = new Promise(function (resolve, reject) {
        Template.load(template).then(function (template) {
            _this.templateData = template;
            if (!_this.templateData) {
                debugger;
            }
            console.log("loaded:", _this.name());
            resolve();
        }, reject);
        /*ghost.io.ajax({url:template, retry:ghost.io.RETRY_INFINITE})
        .then(
        function(result:any)
        {
            if(result.template)
            {
                result.template.url = template;
                _this.templateData = Template.setTemplate(result.template);

                resolve();

            }else
            {
                reject("no template");
            }
        },
        reject
        );*/
    });
    return promise;
}
return true;
initializeData();
Promise( | boolean, (_a = {
        var: params,
        any:  = this.getActivationParams(),
        var: promises,
        Promise: function () { }
    },
    _a[] =  = this._data.map(function (item, index) {
        if (item.retrieveData) {
            if (_this._parts[index] && _this._parts[index].condition) {
                if (!_this._parts[index].condition()) {
                    return null;
                }
            }
            if (_this._parts[index] && _this._parts[index].parts) {
                return item.retrieveData(_this._parts[index].parts, params);
            }
            var promise = item.retrieveData(null, params);
            if (_this._parts[index] && _this._parts[index].async === true) {
                return true;
            }
            return promise;
        }
        return null;
    }, this).filter(function (item) {
        return item != null;
    }),
    _a.return = Promise.all(promises),
    _a
), protected, firstActivation(), Promise( | boolean, {
    if: function () { } }, !this._firstActivation), {
    return: true
}, this._firstActivation = false);
return this.ready();
activation();
void {
    this: .bindEvents(),
    this: .activate(),
    this: .trigger(Master.EVENTS.ACTIVATED),
    ghost: .events.Eventer.on(ghost.events.Eventer.APPLICATION_RESUME, this.resume, this),
    ghost: .events.Eventer.on(ghost.events.Eventer.APPLICATION_PAUSE, this.pause, this)
};
pause();
void {};
resume();
void {};
getRootURL();
string;
{
    var pathname = window.location.pathname;
    var index = pathname.indexOf("/", 1);
    if (index > -1) {
        pathname = pathname.substring(0, index);
    }
    return window.location.protocol + "//" + window.location.host + (pathname.length > 1 ? pathname + "/" : pathname);
}
_getTemplate();
string;
{
    var template = this.getTemplate();
    if (!template) {
        return null;
    }
    return template;
}
getTemplate();
string;
{
    return null;
}
ready();
Promise( | boolean, {
    return: true
}, 
/**
 * Call when the master is activated
 */
public, activate(), void {
    super: .activate()
}, public, getContainer(), any, {
    if: function () { }, this: .$container && this.$container.length });
{
    return this.$container.get(0);
}
console.log("get container", this.name());
var $scope = $("[data-scope='" + this.scoping() + "']");
if ($scope.length) {
    var container = $scope.children("[data-container='" + this.name() + "']").get(0);
    if (!container) {
        $scope.append('<div data-container="' + this.name() + '"></div>');
    }
    this.$container = $scope.children("[data-container='" + this.name() + "']");
    container = this.$container.get(0);
    return container;
}
showContainer();
void {
    if: function () { }, this: .$container };
{
    this.$container.show();
}
hideContainer();
void {
    if: function () { }, this: .$container };
{
    this.$container.hide();
}
_onModelChange();
void {
    //console.log(arguments);
    //required due to custom events
    var: ractive = arguments[arguments.length - 1],
    var: name = arguments[arguments.length - 2],
    var: model = arguments[arguments.length - 3],
    var: data, any: ,
    if: function () { } };
!model;
{
    debugger;
}
if (model.toRactive) {
    data = model.toRactive(ractive);
}
else {
    if (model instanceof Data) {
        data = model.value;
    }
    else {
        if (model.toObject) {
            data = model.toObject();
        }
        else {
            debugger;
            //data = model;
            return;
        }
    }
}
this.template.set(name, data);
toRactive();
any;
{
    var _this = this;
    return this._data.reduce(function (previous, item, index) {
        if (!item.name || typeof item.name != "function") {
            //classical objects
            for (var p in item) {
                previous[p] = item[p];
            }
        }
        else {
            var ractiveString = _this._parts[index] ? _this._parts[index].ractive : undefined;
            var name = _this._parts[index] && _this._parts[index].name ? _this._parts[index].name : item.name();
            //models
            previous[name] = item.toRactive ? item.toRactive(ractiveString) : item instanceof Data ? item.value : item.toObject();
        }
        return previous;
    }, {});
}
render();
void {
    var: container, any:  = this.getContainer(),
    if: function (container) {
        var _this = this;
        this.showContainer();
        var options = {};
        //toRactive + listener on evnetdispatcher
        this._data.forEach(function (item, index) {
            var events = _this._parts[index] && _this._parts[index].events ? _this._parts[index].events : [ghost.mvc.Model.EVENT_CHANGE];
            var event;
            for (var p in events) {
                event = events[p];
                if (item instanceof ghost.events.EventDispatcher) {
                    //         item.off(event, this._onModelChange, this);
                    item.on(event, _this._onModelChange, _this, item, _this._parts[index] && _this._parts[index].name ? _this._parts[index].name : item.name(), _this._parts[index] && _this._parts[index].ractive ? _this._parts[index].ractive : null);
                }
                else {
                    for (var p in item) {
                        if (item[p] instanceof ghost.events.EventDispatcher) {
                            //   item[p].off(event, this._onModelChange, this);
                            item[p].on(event, _this._onModelChange, _this, item[p], _this._parts[index] && _this._parts[index].name ? _this._parts[index].name : item[p].name(), _this._parts[index] && _this._parts[index].ractive ? _this._parts[index].ractive : null);
                        }
                    }
                }
            }
        });
        var data = this.toRactive();
        data.trans = ghost.browser.i18n.Polyglot.instance().t.bind(ghost.browser.i18n.Polyglot.instance());
        var binded = this.getBindedFunctions();
        for (var p in binded) {
            data[p] = binded[p];
        }
        //not sure
        for (var p in binded) {
            options[p] = binded[p];
        }
        options.data = data;
        options.el = container;
        //ghost.browser.i18n.Polyglot.instance().on("resolved:"+this.getTranslationTemplate(), this._onTranslationChange, this);
        ghost.browser.i18n.Polyglot.instance().on("resolved", this._onTranslationChange, this);
        try {
            console.log("render:", this.name());
            if (!this.templateData) {
                debugger;
            }
            if (!this.templateData.isParsed()) {
                this.templateData.parse(options);
            }
            options.template = JSON.parse(JSON.stringify(this.templateData.parsed)); //Ractive["parse"](this.templateData.content, options.template);
            //debugger;
            this.template = new Ractive(options);
        }
        catch (error) {
            console.error(error);
            debugger;
        }
        var listener = this.getBindedFunctions(); //this.getBindedEventListeners();
        if (listener) {
            for (var p in listener) {
                this.template.on(p, listener[p]);
            }
        }
    }, else: {
        console: .warn("no container for ", this)
    }
};
getTranslationTemplate();
string;
{
    return this.getTemplate().split("/").slice(1, 2).join(".").toLowerCase();
}
_onTranslationChange();
void {
    if: function () { }, this: .template };
{
    //this.template.set("t",)
    this.template.set("trans", ghost.browser.i18n.Polyglot.instance().t.bind(ghost.browser.i18n.Polyglot.instance()));
}
getBindedFunctions();
any;
{
    return null;
}
var _a;
//# sourceMappingURL=Master.js.map