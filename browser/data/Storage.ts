///<module="ghost/core"/>
namespace ghost.data
{
    class LocalStorage
    {
        private _storage:any;
        /**
         * Constructor
         */
        constructor()
        {
            this._storage = ROOT.localStorage;
        }
        /**
         * Gets Item by key
         * @param key string key
         * @returns {*} Value linked to the key
         */
        public getItem(key:string):any
        {
            return this._storage.getItem(key);
        }
        /**
         * Gets key at the index id
         * @param id
         * @returns {string} key
         */
        public key(id:string):string
        {
            return this._storage.key(id);
        }
        /**
         * Sets an item by key
         * @param key key of the item
         * @param value new item value
         * @returns {void}
         */
        public setItem(key:string, value:any):void
        {
            return this._storage.setItem(key, value);
        }
        /**
         * Removes an item by key
         * @param key key of the item
         * @returns {void}
         */
        public removeItem(key:string):any
        {
            return this._storage.removeItem(key);
        }
        /**
         * Clear local storage
         * @returns {void}
         */
        public clear():void
        {
            return this._storage.clear();
        }
        //not in the W3C standard
        /**
         * Checks if an item exists with the key given
         * @param key item's key
         * @returns {boolean}
         */
        public hasItem(key:string):boolean
        {
            return this._storage.getItem(key)!=null;
        }
    }
    var local:LocalStorage = new LocalStorage();
    export class Warehouse
    {
        /**
         * @private
         */
        private static _LIST_KEY:string = "__list";
        /**
         * @private
         */
        private _name:string;
        /**
         * @private
         */
        private _keys:any;
        /**
         * @private
         */
        private _warehouses:any;
        /**
         * Constructor
         */
        constructor(name:string)
        {
            this._name = name+"-";
            this._keys = [];
            if(local.hasItem(this._name+Warehouse._LIST_KEY))
            {
                this._keys  = this.get(Warehouse._LIST_KEY);
            }
            this._warehouses = {};
        }
        public war(name:string):Warehouse
        {
            if(this._warehouses[name] == undefined)
            {
                this._warehouses[name] = new Warehouse(this._name+"/"+name);
            }
            return this._warehouses[name];
        }
        public warehouse(name:string):Warehouse
        {
            return this.war(name);
        }
    
        public get(key:string):any
        {
            var value = local.getItem(this._name+key);
            if(value != undefined)
            {
                return JSON.parse(value);
            }
            return value;
        }
        public has(key:string):boolean
        {
            return this._keys.indexOf(key)!=-1;
        }
        public set(key:string, value:any):void
        {
            if(value == null)
            {
                return this.remove(key);
            }
            if(!this.has(key))
            {
                this._addKey(key);
            }
            return local.setItem(this._name+key, JSON.stringify(value));
        }
        public remove(key:string):void
        {
            this._removeKey(key);
            return local.removeItem(this._name+key);
        }
        public clear():void
        {
            while(this._keys.length>0)
            {
                this.remove(this._keys[0]);
            }
        }
        private _addKey(key:string):void
        {
            if(this._keys.indexOf(key)==-1)
            {
                this._keys.push(key);
                local.setItem(this._name+Warehouse._LIST_KEY, JSON.stringify(this._keys));
            }
        }
        private _removeKey(key:string):void
        {
            var index;
            if((index = this._keys.indexOf(key))!=-1)
            {
                this._keys.splice(index, 1);
                console.log("remove key from keys : "+key);
                local.setItem(this._name+Warehouse._LIST_KEY, JSON.stringify(this._keys));
            }
        }   
    }

}
namespace ghost
{
    export var cache:ghost.data.Warehouse = new ghost.data.Warehouse("root");
}