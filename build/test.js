var ghost;
(function (ghost) {
    var level;
    (function (level) {
        var data;
        (function (data) {
            var sub;
            (function (sub) {
                /**
                 * HashMap
                 */
                var HashMap = (function () {
                    function HashMap() {
                        this.values = [];
                        this.keys = [];
                    }
                    HashMap.prototype.clear = function () {
                        this.keys.length = 0;
                        this.values.length = 0;
                    };
                    HashMap.prototype.has = function (key) {
                        return this.keys.indexOf(key) != -1;
                    };
                    HashMap.prototype.get = function (key) {
                        var index = this.keys.indexOf(key);
                        if (index != -1) {
                            return this.values[index];
                        }
                        else {
                            return null;
                        }
                    };
                    HashMap.prototype.set = function (key, value) {
                        var index = this.keys.indexOf(key);
                        if (index == -1) {
                            index = this.keys.length;
                            this.keys.push(key);
                        }
                        this.values[index] = value;
                    };
                    HashMap.prototype.remove = function (key) {
                        var index = this.keys.indexOf(key);
                        if (index != -1) {
                            this.values.splice(index, 1);
                            this.keys.splice(index, 1);
                        }
                    };
                    HashMap.prototype.size = function () {
                        return this.keys.length;
                    };
                    HashMap.prototype.toArray = function () {
                        return this.values.slice();
                    };
                    return HashMap;
                })();
                sub.HashMap = HashMap;
            })(sub = data.sub || (data.sub = {}));
        })(data = level.data || (level.data = {}));
    })(level = ghost.level || (ghost.level = {}));
})(ghost || (ghost = {}));

var __extends = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
var ghost;
(function (ghost) {
    var level;
    (function (level) {
        var data;
        (function (data) {
            var t = data.sub.HashMap2X;
            var HashMap3 = (function (_super) {
                __extends(HashMap3, _super);
                function HashMap3() {
                    _super.apply(this, arguments);
                }
                return HashMap3;
            })(t);
            data.HashMap3 = HashMap3;
        })(data = level.data || (level.data = {}));
    })(level = ghost.level || (ghost.level = {}));
})(ghost || (ghost = {}));