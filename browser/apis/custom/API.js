var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ghost;
(function (ghost) {
    var browser;
    (function (browser) {
        var apis;
        (function (apis) {
            var API = (function (_super) {
                __extends(API, _super);
                function API() {
                    _super.apply(this, arguments);
                }
                return API;
            })(es6);
            apis.API = API;
            -promise;
            {
                _instance: API();
                instance();
                API < any >
                    {
                        if: function () { } };
                !API._instance;
                {
                    API._instance = new APICustom();
                }
                return API._instance;
            }
            _controller: string;
            _action: string;
            _id: string;
            config(options, IAPIOptions);
            T;
            {
                return this;
            }
            controller(controller, string);
            T;
            {
                return this;
            }
        })(apis = browser.apis || (browser.apis = {}));
    })(browser = ghost.browser || (ghost.browser = {}));
})(ghost || (ghost = {}));
var APICustom = (function (_super) {
    __extends(APICustom, _super);
    function APICustom() {
        _super.apply(this, arguments);
    }
    APICustom.prototype.test = function () { };
    return APICustom;
})(API);
exports.APICustom = APICustom;
var custom = new APICustom();
custom.controller("test").config({}).test();
//# sourceMappingURL=API.js.map