var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<lib="jquery"/>
///<lib="es6-promise"/>
var ghost;
(function (ghost) {
    var io;
    (function (io) {
        var middlewares = [];
        function middleware(data) {
            if (!data) {
                return data;
            }
            var result;
            for (var p in middlewares) {
                if (!middlewares[p].keyword || data[middlewares[p].keyword]) {
                    if (middlewares[p].keyword) {
                        result = middlewares[p].callback(data[middlewares[p].keyword]);
                    }
                    else {
                        result = middlewares[p].callback(data);
                    }
                    if (result) {
                        data = result;
                    }
                }
            }
            return data;
        }
        any | void ;
        void {
            if: function () { }, typeof: data == "function" };
        {
            data = { callback: data };
        }
        middlewares.push(middleware);
    })(io = ghost.io || (ghost.io = {}));
})(ghost || (ghost = {}));
function removeMiddleware(middleware) {
    for (var p in middlewares) {
        if (middleware.id) {
            if (middlewares[p].id == middleware.id) {
                middlewares.splice(p, 1);
            }
        }
        else {
            if (middlewares[p].callback === middleware.callback && middlewares[p].keyword === middleware.keyword) {
                middlewares.splice(p, 1);
            }
        }
    }
}
exports.removeMiddleware = removeMiddleware;
exports.RETRY_INFINITE = -1;
function ajax(url, settings) {
    if (typeof url == "string") {
        if (!settings) {
            settings = {};
        }
        settings.url = url;
    }
    else {
        settings = url;
    }
    var $ajax;
    var promise = new CancelablePromise(function (resolve, reject) {
        $ajax = $.ajax(settings)
            .done(function (data, textStatus, jqXHR) {
            if (promise && promise.canceled) {
                return;
            }
            if (promise)
                promise.setAjax(null);
            data = middleware(data);
            if (data && data.success === false) {
                if (settings.retry === true) {
                    setTimeout(function () {
                        ajax(settings).then(resolve, reject);
                    }, 500);
                    return;
                }
                reject(data.error ? data.error : data);
                return;
            }
            if (settings.asObject) {
                resolve({ data: data, textStatus: textStatus, jqXHR: jqXHR });
            }
            else {
                resolve(data);
            }
        })
            .fail(function (jqXHR, textStatus, errorThrown) {
            if (promise && promise.canceled) {
                return;
            }
            if (settings.retry) {
                if (settings.retry !== exports.RETRY_INFINITE && settings.retry !== true) {
                    settings.retry = settings.retry - 1;
                }
                setTimeout(function () {
                    ajax(settings).then(resolve, reject);
                }, 500);
            }
            else {
                if (promise)
                    promise.setAjax(null);
                if (settings.asObject) {
                    reject({ errorThrown: errorThrown, textStatus: textStatus, jqXHR: jqXHR });
                }
                else {
                    reject(errorThrown);
                }
            }
        });
    });
    promise.setAjax($ajax);
    return promise;
}
exports.ajax = ajax;
var CancelablePromise = (function (_super) {
    __extends(CancelablePromise, _super);
    function CancelablePromise() {
        _super.apply(this, arguments);
        this.canceled = false;
    }
    CancelablePromise.prototype.cancel = function () {
        if (this.$ajax) {
            this.$ajax.abort();
            this.setAjax(null);
        }
        this.canceled = true;
    };
    CancelablePromise.prototype.setAjax = function ($ajax) {
        this.$ajax = $ajax;
    };
    return CancelablePromise;
})(Promise);
exports.CancelablePromise = CancelablePromise;
//# sourceMappingURL=Ajax.js.map