///<module="ghost/core"/>
///<lib="es6-promise"/>
/*
//TODO:add mozilla API and converts with Promises
module ghost.data
{
    class LocalForage
    {
        private _storage:any;
        /**
         * Constructor
         */
constructor();
{
    this._storage = ROOT.localforage;
}
getItem(key, string);
Promise < any >
    {
        return: function () { }, this: ._storage.getItem(key)
    };
key(id, string);
Promise < any >
    {
        return: function () { }, this: ._storage.key(id)
    };
setItem(key, string, value, any);
Promise < any >
    {
        return: function () { }, this: ._storage.setItem(key, value)
    };
removeItem(key, string);
Promise < any >
    {
        return: function () { }, this: ._storage.removeItem(key)
    };
clear();
Promise < any >
    {
        return: function () { }, this: ._storage.clear()
    };
hasItem(key, string);
Promise < any >
    {
        return: function () { }, this: ._storage.getItem(key) != null
    };
var localForage = new LocalForage();
var Foragehouse = (function () {
    /**
     * Constructor
     */
    function Foragehouse(name) {
        this._name = name;
        this._keys = [];
        if (localForage.hasItem(this._name + Foragehouse._LIST_KEY)) {
            this._keys = this.get(Foragehouse._LIST_KEY);
        }
        this._warehouses = {};
    }
    Foragehouse.prototype.war = function (name) {
        if (this._warehouses[name] == undefined) {
            this._warehouses[name] = new Foragehouse(this._name + "/" + name);
        }
        return this._warehouses[name];
    };
    Foragehouse.prototype.warehouse = function (name) {
        return this.war(name);
    };
    Foragehouse.prototype.get = function (key) {
        var value = localForage.getItem(this._name + key);
        if (value != undefined) {
            return JSON.parse(value);
        }
        return value;
    };
    Foragehouse.prototype.has = function (key) {
        return this._keys.indexOf(key) != -1;
    };
    Foragehouse.prototype.set = function (key, value) {
        if (value == null) {
            return this.remove(key);
        }
        if (!this.has(key)) {
            this._addKey(key);
        }
        return localForage.setItem(this._name + key, JSON.stringify(value));
    };
    Foragehouse.prototype.remove = function (key) {
        this._removeKey(key);
        return localForage.removeItem(this._name + key);
    };
    Foragehouse.prototype.clear = function () {
        while (this._keys.length > 0) {
            this.remove(this._keys[0]);
        }
    };
    Foragehouse.prototype._addKey = function (key) {
        if (this._keys.indexOf(key) == -1) {
            this._keys.push(key);
            localForage.setItem(this._name + Foragehouse._LIST_KEY, JSON.stringify(this._keys));
        }
    };
    Foragehouse.prototype._removeKey = function (key) {
        var index;
        if ((index = this._keys.indexOf(key)) != -1) {
            this._keys.splice(index, 1);
            console.log("remove key from keys : " + key);
            localForage.setItem(this._name + Foragehouse._LIST_KEY, JSON.stringify(this._keys));
        }
    };
    /**
     * @private
     */
    Foragehouse._LIST_KEY = "__list";
    return Foragehouse;
})();
exports.Foragehouse = Foragehouse;
    * /;
//# sourceMappingURL=Forage.js.map