import {Model as ModelClass, ModelLoadRequest} from "./Model";
import {Arrays} from "ghost/utils/Arrays";
import {IBinaryResult} from "ghost/utils/IBinaryResult";
import {API2} from "browser/api/API2";
import {Inst} from "./Inst";
import {IModelConfig, Model} from "./Model";
import {Buffer} from "ghost/utils/Buffer";
import {Objects} from "ghost/utils/Objects";

export type Constructor<T extends ModelClass> = new(...args: any[]) => T;

export function Collection<X extends Constructor<ModelClass>>( A:X ) {
    type T =  typeof A.prototype;
    return class _Collection extends A {
        public static PATH_GET:()=>ModelLoadRequest =
        ()=>new ModelLoadRequest("%root-path%/list", {'%id-name%':'%id%'}, {replaceDynamicParams:true});
        
        public models:T[] = [];
        private _request:API2;
        protected _modelClass:any;
        constructor(...args: any[]) {
            super(...args);
            this._modelClass = A;//eval('_super');
            this.models = [];
        }
        public isFullLoaded():boolean
        {
            var apiData:any =this.request().getAPIData()
            if(apiData && apiData.paginate && apiData.paginate.full)
                return true;
            return false;
        }
        public createModel():T
        {
            return new this._modelClass();
        }
        public isSameCollection(collection:any):boolean
        {
            return collection._modelClass === this._modelClass;
        }
        public clear():void
        {
            this._request = null;
            this.clearModels();
        }
        public resetPaginate():void{
            this.request().reset();
        }
        public reset():void{
            this.clear();
            this.resetPaginate();
        }
        protected getRootPath():string
        {
            return super.getModelName();
        }
        public getModelName():string
        {
            if(!this._modelName)
            {
                var name:string = super.getModelName();
                name =  name.replace('collection', '').toLowerCase();
                if(typeof this == "function")
                    return name+(name.substr(-1, 1)=="s"?"":"s");
                this._modelName = name;
            }
            return this._modelName + (this._modelName.substr(-1, 1)=="s"?"":"s");
        }
        public clearModels()
        {
            this.models     = [];
        }
        public remove(model:T):void
        {
           var index:number = this.models.indexOf(model);
           if(index != -1)
           {
               this.models.splice(index, 1);
           }
        }
        public getModel(index:number):T
        {
            return this.models[index];
        }
        public getModelByID(id:number):T
        {
            for(var p in this.models)
            {
                if((<any>this.models[p]).getID()==id)
                    return this.models[p];
            }
            for(var p in this.models)
            {
                if(this.models[p].isSameCollection && this.models[p].isSameCollection(this))
                {
                    var model = this.models[p].getModelByID(id)
                    if(model)
                    {
                        return model;
                    }
                }
            }
            return null;
        }
        public pop():T
        {
            return this.models.pop();
        }
        public push(...models:T[]):number
        {
            return this.models.push(...models);
        }
        public reverse():T[]
        {
            return this.models.reverse();
        }
        public shift():T
        {
            return this.models.shift();
        }
        public sort(compareFunction?:(a: T, b: T) => number):T[]
        {
            return  this.models.sort(compareFunction);
        }
        public splice(index?:number, howMany?:number, ...models:T[]):T[]
        {
            return this.models.splice(index, howMany, ...models);
        }
        public unshift(...models:T[]):number
        {
            return this.models.unshift(...models);
        }
        public size():number
        {
            return this.models.length;
        }
        public empty():boolean
        {
            return this.size() == 0;
        }
        public concat(...models:T[]):this
        {
            var cls:any = this.constructor;
            var collection:this = new cls();
            collection.models = this.models;
            collection.push(...models);
            return collection;
        }
        public slice(begin:number, end?:number):T[]
        {
            return this.models.slice(begin, end);
        }
        public indexOf(model:T):number
        {
            return this.models.indexOf(model);
        }
        public lastIndexOf(model:T):number
        {
            return this.models.lastIndexOf(model);
        }
        public forEach(callback:(value: T, index: number, array: T[]) => void, thisArg?:any):void
        {
            return this.models.forEach(callback, thisArg);
        }
        public every(callback:(value: T, index: number, array: T[]) => boolean, thisObject?:any):boolean
        {
            return this.models.every(callback, thisObject);
        }
        public some(callback:(value: T, index: number, array: T[]) => boolean, thisObject?:any):boolean
        {
            return this.models.some(callback, thisObject);
        }
        public filter(callback:(value: T, index: number, array: T[]) => boolean, thisObject?:any):T[]
        {
            return this.models.filter(callback, thisObject);
        }
        public map(callback:(value: T, index: number, array: T[]) => any[], thisObject?:any):any[]
        {
            return this.models.map(callback, thisObject);
        }
        public reduce(callback:(previousValue: T, nextValue:T, index: number, array: T[]) => boolean, initialValue?:any):any
        {
            return this.models.reduce(callback, initialValue);
        }

        public toArray():T[]
        {
            return this.splice();
        }
         protected _path(path:string):string
        {
            var path:string = super._path(path);
            return path.replace('collection', '');
        }
        public unselect():this 
        {
            for(var p in this.models)
             {
                 if(this.models[p].models)
                 {
                     for(var q in this.models[p].models)
                     {
                         this.models[p].models[q].selected = false;
                        }
                }else{

                    this.models[p].selected = false;
                }
             }
             return this;
        }
        public request(config?:any):API2
        {
            if(!this._request)
            {
                if(!config)
                    config = {};
                var tmp : any;
                config.execute = false;
                this._request = <API2>this.load(this.constructor["PATH_GET"], null,config);
                config.execute = tmp;
                this._request.on(API2.EVENT_DATA, this.prereadExternal, this, this._request.getPath(), this._request);
            }
            var path:any = this.constructor["PATH_GET"];
            if(typeof path == "function")
                path = path();
            var params:any = {};
            if(path.params)
            {
                for(var p in path.params)
                {
                    if(params[p] == undefined)
                        params[p] = path.params[p];
                }
                path = path.path;
            }
            if(this._request["model_config"].replaceDynamicParams)
            {
                path = this.replace(<string>path);
                if(params)
                {
                    var k:string;
                    for(var p in params)
                    {
    
                        if(Model.regexp.test(params[p]))
                        {
                            params[p] = this.replace(params[p]);
                            if(params[p] == "undefined")
                            {
                                delete params[p];
                            }
                        }
                        if(Model.regexp.test(p))
                        {
                            k =  this.replace(p);
                            if(k!=p)
                            {
                                params[k] = params[p];
                                delete params[p];
                            }
                        }
                    }
    
                }
            }
            for(var p in params)
            {
                if(!this._request.hasParam(p))
                    this._request.param(p, params[p]);
            }

            return this._request;
        }
        public async loadGet(params?:any, config?:IModelConfig&{execute:false}):Promise<any>
        {
            var tmp:any = config;
            var request:API2 =  this.request(config);
            if(tmp)
            {
                config = Objects.clone(request["model_config"]);
                for(var p in tmp)
                    config[p] = tmp[p];
                
            }else
            {
                config = request["model_config"];
            }
           
            if(request.hasNoPaginate())
            {
                if(this._pathLoaded[request.getPath()] && config.ignorePathLoadState !== true)
                {
                    var promise:any = this._pathLoaded[request.getPath()];
                    if(!promise || typeof promise == "boolean")
                        {
                            promise= new Promise<any>((resolve, reject)=>
                            {
                                resolve();
                            }).then(function(){});
                        }
                    return promise; 
                    
                }
            }else{
                //useful if two calls are made before one gets a result so we don't know if there is any paginate
                if(this._pathLoaded[request.getPath()] && (!config || config.ignorePathLoadState !== true))
                {
                    if(typeof this._pathLoaded[request.getPath()] != "boolean")
                    {
                        try{

                            await this._pathLoaded[request.getPath()];
                        }catch(error)
                        {
                            //if request failed or been cancelled
                        }
                    }
                }
            }
            for (var key in params)
            {
                request.param(key, params[key]);
            }
            var promise:any =  request.then(function(data)
            { 
                return data;
            });
            if(config.execute === false)
            {
                return <any>request;
            }
            if(config.marksPathAsLoaded !== false)
            {
                this._pathLoaded[request.getPath()]  = promise; 
            }
            return promise;
        }
        
        protected prereadExternal(data:any, ...args)
        {
            if(data && data.data)
                data = data.data;
            this.readExternal(data, ...args);
        }
       public readExternal(input:any[], path?:any, api?:API2):void
        {
            if(!input)
                return;
            if(input["data"])
            {
                input = input["data"];
            }
            if(!Arrays.isArray(input))
            {

                //readExternal for collection like models
                if(!path || path.allowNoArray === true)
                {
                    var data:any = input;
                    input = input["models"];   
                    delete data.models;
                    super.readExternal(data);
                }else{
                    input = [input];
                }
            }
            if(input)
            {

                if(!input.length || !input.forEach)
                {
                    //needed to not break the flow
                    this.triggerFirstData();
                    this._trigger(this.constructor["EVENT_FORCE_CHANGE"]);
                    return;
                }
                input.forEach(function(rawModel:any):void
                {
                    if(!rawModel)
                    {
                        return;
                    }
                    if(rawModel.__class)
                    {
                        //TODO:check id too
                        var model:T = Inst.get(rawModel.__class);
                        this.prepareModel(model);
                        model.readExternal(rawModel);
                        this.push(model);
                    }else
                    {
                        if(typeof rawModel == "object")
                        {
                            var cls:any = this._modelClass;//A;
                            var model:T;
                            if(rawModel)
                            {
                                if(this['__isUnique'])
                                {
                                    
                                    if(rawModel && rawModel.id != undefined)
                                    {
                                        model = this.getModelByID(rawModel.id );
                                    }else
                                    {
                                        var id:string = this.getIDName();
                                        if(rawModel[id])
                                        {
                                            model = this.getModelByID(rawModel[id]);
                                        }

                                    }
                                }
                            }
                            //TODO:handle unique/sort collections
                            if(!model)
                            {
                                if(rawModel && rawModel.models)
                                {
                                    model  = Inst.get(Collection(cls));
                                }else{
                                    //TODO: this createModel ?
                                    //model  = Inst.get(cls);
                                    model = this.createModel();
                                }
                                 this.prepareModel(model);
                                model.readExternal(rawModel);
                                this.push(model);
                            }else
                            {
                                //TODO:transform existing model into collection if rawModel.models exists
                                this.prepareModel(model);
                                model.readExternal(rawModel);
                            }
                        }else
                        {
                            console.error("RawModel must be object, given ", rawModel);
                        }
                    }
                    
                }, this);
                this.triggerFirstData();
                this._trigger(this.constructor["EVENT_FORCE_CHANGE"]);
            }
        }
        protected prepareModel(model:T):void
        {
            
        }
        

        public next(quantity:number):API2
        public next():API2
        public next(quantity?:number):API2
        {
            var request:any = this.request();
            return request.next(quantity);
        }
        public nextAll(quantity:number):API2
        public nextAll():API2
        public nextAll(quantity?:number):API2
        {
             var request:any = this.request();
            return request.nextAll(quantity);
        }
        public previous(quantity:number):API2
        public previous():API2
        public previous(quantity?:number):API2
        {
            var request:any = this.request();
            return request.previous(quantity);
        }
        public previousAll(quantity:number):API2
        public previousAll():API2
        public previousAll(quantity?:number):API2
        {
            var request:any = this.request();
            return request.previousAll(quantity);
        }
    }
}
export function Unique<X extends Constructor<ModelClass>>( Model: X) {
    type T =  typeof Model.prototype;
    return class Unique extends Model {
        protected __isUnique:boolean = true;
        public models:T[] = [];
        private _unicity:string[] = [];
        private _keys:string[] = [];
        public unicity(key:string | string[]):void
        {
            if(!Arrays.isArray(key))
            {
                key = <any>[key];
            }
            this._unicity = <any>key;
            if(this.models.length)
            {
                this._buildKeys();
            }
        }
        public clear():void
        {
            super["clear"]();
            this._buildKeys();
        }

        private _buildKeys():void
        {
            this._keys = [];
            for(let model of this.models)
            {
                this._keys.push(this._getUnicityKey(model));
            }
        }
        private _hasUnicity():boolean
        {
            return this._unicity && this._unicity.length>0;
        }
        protected _registerKey(model:T):void
        {
            if(!this._hasUnicity())
                return;
            var index:number = this.models.indexOf(model);
            this._keys.splice(index, 0, this._getUnicityKey(model));
        }
        public indexOf(model:T):number
        {
            if(this._hasUnicity())
            {
                var key:string = this._getUnicityKey(model);
                return this._keys.indexOf(key);
            }
            return this.models.indexOf(model);
        }
        public lastIndexOf(model:T):number
        {
            if(this._hasUnicity())
            {
                var key:string = this._getUnicityKey(model);
                return this._keys.lastIndexOf(key);
            }
            return this.models.lastIndexOf(model);
        }
        private _getUnicityKey(model:T):string
        {
            if(this._unicity.length == 1)
            {
                return model[this._unicity[0]];
            }else{
                return this._unicity.map(function(key:string):any
                {
                    return model[key];
                }).join('-');
            }
        }
        public push(...models:T[]):number
        {
            var index:number;
            var model:T;
            for(var p in models)
            {
                model = models[p];
                if((index = this.indexOf(model))==-1)
                {
                    super["push"](model);
                    this._registerKey(model);
                }
            }
            return this.models.length;
        }
        public unshift(...models:T[]):number
        {
            var index:number;
            var model:T;
            for(var p in models)
            {
                model = models[p];
                if((index = this.indexOf(model))==-1)
                {
                    super["unshift"](model);
                    this._registerKey(model);
                }
            }
            return this.models.length;
        }
        public splice(index:number, howMany:number, ...models:T[]):T[]
        {
            var id:number;
            var model:T;
            var modelsToSplice:T[] = [];
            for(var p in models)
            {
                model = models[p];
                //TODO:check borns
                if((id = this.indexOf(model))==-1 || id<index || id>index+howMany)
                {
                    modelsToSplice.push(model);
                }
            }
            var result:T[] = super["splice"](index, howMany, ...modelsToSplice);
            this._keys.splice(index, howMany);
            for(var model of models)
            {
                this._registerKey(model);
            }
            return result;
        }


        public remove(model:T):void
        {
           var index:number = this.models.indexOf(model);
           if(index != -1)
           {
               this.models.splice(index, 1);
               this._keys.splice(index, 1);
           }
        }
        public pop():T
        {
            this._keys.pop();
            return this.models.pop();
        }
        public shift():T
        {
            this._keys.shift();
            return this.models.shift();
        }
        public sort(compareFunction?:(a: T, b: T) => number):T[]
        {
            var result:T[] = super["sort"](compareFunction);
            this._buildKeys();
            return result;
        }
    }
}
export function Sorted<X extends Constructor<ModelClass>>( Model: X ) {
    type T =  typeof Model.prototype;
    return class Sorted extends Model {
        protected __isSorted:boolean = true;
        public models:T[];
        private _order:string[];
        private _orderDirection: number[];
        protected _isFullLoaded:boolean;
        constructor(...args: any[]) {
            super(...args);
            if(this["__isUnique"] === true)
            {
                throw new Error('Unique Mixin must be used before Sorted mixin');
            }
        }
         public push(...models:T[]):number
        {
            var index:number;
            var model:T;
            for(var p in models)
            {
                model = models[p]
                if(!this.models.length)
                {
                    super["push"](model);
                    continue;
                }
                if((index = this.models.indexOf(model))==-1)
                {
                    //if list ordonned
                    if(this._order)
                    {
                        var result:IBinaryResult = Arrays.binaryFindArray(this.models, model, this._order, this._orderDirection);
                        if(result.index == undefined)
                        {
                            //handle order
                               if (result.order > 0)
                               {
                                   super["push"](model);
                               }else
                               {
                                   super["unshift"](model);
                               }
                        }else
                        {
                             super["splice"](result.index, 0, model);
                        }
                    }else
                    {
                        super["push"](model);
                    }
                }else
                {
                    console.warn("already into collection:", model);
                }
            }

            return this.models.length;
        }
        public unshift(...models:T[]):number
        {
            if(this._order)
                return this.push(...models);
            return super["unshift"](...models);
        }
        public splice(index:number, howMany:number, ...models:T[]):T[]
        {
            if(!this._order)
                return super["unshift"](...models);
            var splicedModels:T[] = super["splice"](index, howMany);
            this.push(...models);
            return splicedModels;
        }
        public sort(compareFunction?:(a: T, b: T) => number):T[]
        {
            throw new Error('you must not use sort function in sorted collection - use .order() instead');
        }
        public order(order:string | string[], direction:number|number[] = 1):void
        {
            this._order = <string[]>(Arrays.isArray(<any>order) ? order : [order]);
            this._orderDirection = <number[]>(Arrays.isArray(<any>direction) ? direction : [direction]);
            while(this._orderDirection.length<this._order.length)
            {
                this._orderDirection.push(this._orderDirection[this._orderDirection.length-1]);
            }
            if(this.models.length)
            {
                super["sort"]((modelA:T, modelB:T):number=>
                {
                    for (var i: number = 0; i < this._order.length; i++)
                    {
                        if (modelA[this._order[i]] > modelB[this._order[i]] || (modelA[this._order[i]]!=null && modelB[this._order[i]]==null))
                        {
                            return this._orderDirection[i] > 0 ? -1 : 1;
                        }
                        if (modelA[this._order[i]] < modelB[this._order[i]] || (modelB[this._order[i]]!=null && modelA[this._order[i]] == null))
                        {
                            return this._orderDirection[i]> 0 ? 1 : -1;
                        }

                    }
                    return 0;
                });
            };

        }
         protected detectedFullLoad(api:API2):void
        {
            if(!api)
            {
                return;
            }
            var apidata : any = api.getAPIData();
            var request: any;
            if(api)
            {
                request = api.getLastRequest();
            }
            if (request && request.data && request.data.paginate && request.data.paginate.direction != undefined && request.data.paginate.key)
            {
                if (Objects.deepEquals(this._order, request.data.paginate.key) && Objects.deepEquals(this._orderDirection, request.data.paginate.direction))
                {
                    if (apidata && apidata.paginate && apidata.paginate.limit && length < apidata.paginate.limit) {
                        if (request.data.paginate.next || (!request.data.paginate.next && !request.data.paginate.previous))
                        {
                            this._isFullLoaded = true;
                        }
                    }
                }
            }
        }
         public request():API2
        {
            var request:API2 = super["request"]();
            if(this._order && !this._orderDirection)
            {
                this._orderDirection = [];
                while(this._orderDirection.length<this._order.length)
                {
                    this._orderDirection.push(-1);
                }
            }
            if(this._order)
                request.order(this._order, this._orderDirection);
            return request;
        }

    }
}
