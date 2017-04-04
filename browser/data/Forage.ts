//convert
 /*(ghost.core.Hardware.*/
import {Hardware} from "ghost/core/Hardware";
///<module="ghost/core"/>

//TODO:add mozilla API and converts with Promises

     export class FakeLocalStorage
    {
        public _storage : any;
        /**
         * Constructor
         */
        constructor()
        {
            // super();
        }

        public instance():any
        {
            return this;
        }
        
        public getItem(key:string):Promise<any>
        {
            var promise:Promise<any> = new Promise<any>((resolve:any, reject:any):void=>
            {
                resolve( null );
            });
            return promise;
        }

        public setItem(key:string, value:string):Promise<any>
        {
            var promise:Promise<any> = new Promise<any>((resolve:any, reject:any):void=>
            {
                resolve( null );
            });
            return promise;
        }

        public key(key:string):Promise<any>
        {
            var promise:Promise<any> = new Promise<any>((resolve:any, reject:any):void=>
            {
                resolve( null );
            });
            return promise;
        }

        public removeItem(key:string):Promise<any>
        {
            var promise:Promise<any> = new Promise<any>((resolve:any, reject:any):void=>
            {
                resolve( null );
            });
            return promise;
        }

        public clear():Promise<any>
        {
            var promise:Promise<any> = new Promise<any>((resolve:any, reject:any):void=>
            {
                resolve( null );
            });
            return promise;
        }

        public keys():Promise<any>
        {
            var promise:Promise<any> = new Promise<any>((resolve:any, reject:any):void=>
            {
                resolve( [] );
            });
            return promise;
        }

        public iterate( func : any ):Promise<any>
        {
            var promise:Promise<any> = new Promise<any>((resolve:any, reject:any):void=>
            {
                resolve( undefined );
            });
            return promise;
        }
    }

    //convert-import
import {Root} from "ghost/core/Root";
    export interface ILocalForageOptions
    {
        debug?:boolean;
    }
    var _log:any = function(){};
    export class LocalForage
    {
        protected static _instance: LocalForage;
        private _storage:any;
        private _name:string;
        private _warehouses:any;
        private _data:any;
        private _keys:string[];
        private _sync:any;
        private _allSync:boolean;
        public static clearAllDebug(): void {
            //WARNING only used this on chrome for test
            console.warn("WARNING only used this on chrome for test");
            try {
                if (window.indexedDB && window.indexedDB["webkitGetDatabaseNames"]) {
                    window.indexedDB["webkitGetDatabaseNames"]().onsuccess = function(sender, args) {
                        if (!sender || !sender.target || !sender.target.result || !sender.target.result.length) {
                            return;
                        }
                        var len: number = sender.target.result.length;
                        for (var i = 0; i < len; i++) {
                            console.log("delete: " + sender.target.result[i]);
                            window.indexedDB.deleteDatabase(sender.target.result[i]);
                        }
                    };
                    console.log("all database deleted");
                }
            }catch(error)
            {
                console.error(error);
            }

        }
        public static config(options:ILocalForageOptions):void
        {
            if(options.debug === true)
            {
                _log = LocalForage.consolelog;
            }
        }
        private static consolelog(...args:any[]):void{
            console.log(args);
        }
        public static instance(): LocalForage {
            if (!LocalForage._instance) {
                LocalForage._instance = new LocalForage({ debug: false });
            }
            return LocalForage._instance;
        }
        /**
         * Constructor
         */
        constructor(config?:any);
        constructor(name:string, config?:any);
        constructor(name:any = "default", config?:any)
        {
            if(typeof name != "string")
            {
                config = name;
                name = "default";
            }
            if(config)
            {
                LocalForage.config(config);
                if(config.name)
                {
                    name = config.name;
                }
            }
            this._name = name;
            this._warehouses = {};

            if (Hardware.getOS() === 'iOS')
                this._storage = new FakeLocalStorage();
            else
                this._storage = Root.getRoot().localforage.createInstance({name:name});
            this._data = {}; 
            this._sync = {};

            if (false === Hardware.hasCookieEnable())
            {
                this._allSync = true;
                this._keys = [];
            }
            else
                this._allSync = false;
        }

        /**
         * Gets forage's name
         * @return {string} Forage's name
         */
        public name():string
        {
            return this._name;
        }
        /**
         * Gets Item by key
         * @param key string key
         * @returns {*} Value linked to the key
         */
        public getItem(key:string):Promise<any>
        {
            var promise:Promise<any> = new Promise<any>((resolve:any, reject:any):void=>
            {
                //no value
                if(!this._allSync && !this._sync[key])
                {
                    _log("get item from db:"+key);
                    this._storage.getItem(key).then((value:any):void=>
                    {
                        this.sync(key, value);
                        resolve(value);
                    }, reject);
                    return;
                }
                _log("has item from cache:"+key);
                //value already saved
                resolve(this._data[key]);
            });
            return promise;
        }
        private sync(key:string, value:any, updateKeys:boolean = true):void
        {
            _log("sync: "+key+"=", value);
            this._data[key] = value;
            this._sync[key] = true;
            if(this._keys && updateKeys)
            {
                _log("update keys frmobom "+key);
                var index:number = this._keys.indexOf(key);
                if(value!=null && index == -1)
                {
                    _log("add key: "+key);
                    this._keys.push(key);
                }else
                if(value == null && index !=-1)
                {
                    this._keys.splice(index, 1);
                    _log("remove key: "+key);
                }

            }
        }
        /**
         * Gets key at the index id
         * @param id
         * @returns {string} key
         */
        public key(id:string):Promise<string>
        {
            if(this._allSync)
            {
                return this._keys[id];
            }
            else
            {
                return <any>this._storage.key(id);
            }
            //TODO: mark as sync key from id
        }
        public iterate(func:Function):Promise<any[]>
        {
            return new Promise<any[]>((resolve:any, reject:any):void=>
            {

                if(this._allSync)
                {
                    _log("iterate from cache");
                    this._keys.every(function(key, index):boolean
                    {
                        var result:any = func(this._data[key], key, index+1);
                        return result === undefined;
                    }, this);
                    resolve();
                    return;
                }
                _log("iterate from db");
                var keys:string[] = [];
               this._storage.iterate((value, key, iterationNumber):any=>{
                 var result:any = func(value, key, iterationNumber);
                   this.sync(key, value, false);
                   keys.push(key);
                   return result;
               }).then((data:any)=>
               {
                   if(data === undefined)
                   {
                       this._allSync = true;
                       this._keys = keys;
                       _log("all iterate done - no db anymore");
                   }else
                   {
                       _log("iterate broken - still db");
                       var index:number;
                       for(var p in keys)
                       {
                           index = this._keys.indexOf(keys[p]);
                           if(index == -1)
                           {
                               this._keys.push(keys[p]);
                           }
                       }
                   }
                   resolve(data);
               }, reject);
            });
        }
        /**
         * Get Keys
         * @returns {Promise<string[]>|string[]|any|*}
         */
        public keys():Promise<string[]>
        {
            return new Promise<string[]>((resolve:any, reject:any):void=>
                {
                    if(this._keys)
                    {
                        _log("keys from cache");
                        resolve(this._keys);
                        return;
                    }
                    _log("keys from db");
                    this._storage.keys().then((keys:string[]):void=>
                    {
                        this._keys = keys;
                        resolve(keys);
                    }, reject);
                });
        }
        /**
         * Sets an item by key
         * @param key key of the item
         * @param value new item value
         * @returns {void}
         */
        public setItem(key:string, value:any):Promise<any>
        {
            this.sync(key, value); 
            return this._storage.setItem(key, value);
        }
        /**
         * Removes an item by key
         * @param key key of the item
         * @returns {void}
         */
        public removeItem(key:string):Promise<any>
        {
            this.sync(key, null);
            return this._storage.removeItem(key);
        }
        /**
         * Clear local storage
         * @returns {void}
         */
        public clear():Promise<any>
        {
            this._data = {};
            this._sync = {};
            this._keys = [];
            this._allSync = true;
            return <any>this._storage.clear();
        }
        //not in the W3C standard
        /**
         * Checks if an item exists with the key given
         * @param key item's key
         * @returns {boolean}
         */
        public hasItem(key:string):Promise<boolean>
        {
            var promise:Promise<boolean> = new Promise<boolean>((resolve:any, reject:any):void=>
            {
                if(!this._allSync && !this._sync[key])
                {
                    _log("has item from db:"+key);
                    //sync is done on getItem
                    this.getItem(key).then(function(data:any)
                    {
                        resolve(data!=null);
                    }, reject);
                    return;
                }
                _log("has item from cache:"+key);
                resolve(this._data[key] != null);
            });
            return promise;
        }
        public warehouse(name:string):LocalForage
        {
            return this.war(name);
        }
        public war(name:string):LocalForage
        {

            if(!this._warehouses[name])
            {
                this._warehouses[name] = new LocalForage(this._name+"/"+name);
            }
            return this._warehouses[name];
        }
    }
    


   // export var forage:ghost.data.Foragehouse = new ghost.data.Foragehouse("root");
    export var forage:LocalForage = new LocalForage({debug:false});
    

