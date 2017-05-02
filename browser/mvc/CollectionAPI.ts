//convert
 /* ghost.browser.data.LocalForage
*/
import {LocalForage} from "browser/data/Forage";
//convert
 /*(ghost.utils.Objects.*/
import {Objects} from "ghost/utils/Objects";
//convert
 /* ghost.core.applyMixins(*/
import {applyMixins} from "ghost/core/applyMixins";
//convert-files
import {Collection} from "./Collection";
//convert-files
import {IModel} from "./IModel";
//convert-files
import {MixinConfig} from "./MixinConfig";
///<module="api"/>

    //convert-import
import {APIExtended as API} from "browser/api/APIExtended";
    //convert-import
import {APIExtended} from "browser/api/APIExtended";
import {API2} from "browser/api/API2";
    //convert-import
import {Arrays} from "ghost/utils/Arrays";
    //convert-import
import {IBinaryResult} from "ghost/utils/IBinaryResult";
    
    //convert-import
import {Model} from "browser/mvc/Model";
    /**
     * Collection API class
     */
    export class CollectionAPI<T extends IModel> extends Collection<T>
    {
        protected is_fully_load:boolean = false;
        private _order:string[];
        private _orderDirection: number[];
        protected requests:any;
        protected _cache: number = 0;
        protected _lastPart: string;
        protected _mixins: any[];
        public constructor()
        {
            super();
            this.requests = {};
        }

        public cache(): LocalForage
        {
            return LocalForage.instance().war(this.name() + '_collection');
        }
        protected refresh():void
        {
            if (this.requests[Collection.PART_DEFAULT])
            {
                //exists
                this.previousAll().done();
            }
        }
        public order(order:string | string[], direction:number|number[] = 1):void
        {
            this._order = <string[]>(Arrays.isArray(<any>order) ? order : [order]);
            this._orderDirection = <number[]>(Arrays.isArray(<any>direction) ? direction : [direction]);
            while(this._orderDirection.length<this._order.length)
            {
                this._orderDirection.push(this._orderDirection[this._orderDirection.length-1]);
            }
            if(this.length())
            {
                this.sort((modelA:T, modelB:T):number=>
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

        public isFullyLoad() : boolean
        {
            return this.is_fully_load;
        }
        protected _onPartData(name:string, data):void
        {
            this._lastPart = name;
            return this.onPartData(name, data);
        }
        protected onPartData(name:string, data:any):void
        {
            if(name == Model.PART_DEFAULT)
                this.readExternal(data);
        }
        public getRequestInstance(part?: string, params?: any): APIExtended {
            return this._getRequest(part, params);
        }
        protected _getRequest(part?:string, params?:any ):APIExtended
        {
            if (typeof part !== "string")
            {
                part = Model.PART_DEFAULT;
            }

            if (!this.requests[part])
            {
                this.requests[part] = this.getRequest(part, params);
                this.requests[part].on(API.EVENT_DATA_FORMATTED, this._onPartData.bind(this, part));
            }

            return this.requests[part];
        }
        protected getAPIData(part?:string):any
        {
            var api:APIExtended = this._getRequest(part);
            if(api)
            {
                return api.getAPIData();
            }
            return null;
        }

        public clear() : void//:Promise<any>
        {
            this._changed         = [];
            this.firstData        = true;
            this.requests         = {};
            this.is_fully_load    = false;
            super.clear();
        }
        public first():Promise<any>
        {
            var promise:Promise<any> = new Promise((resolve:any, reject:any):void=>
            {
                if(!this.firstData)
                {
                    return resolve();
                }
                this.once(Collection.EVENT_FIRST_DATA, ()=>
                {
                   resolve();
                });
            });
            return promise;
        }
        public next(part:string, quantity:number):APIExtended
        public next(quantity:number):APIExtended
        public next():APIExtended
        public next(part:any = null, quantity?:number):APIExtended
        {
            if(typeof part == "number")
            {
                quantity = part;
                part = null;
            }
            var request:any = this._getRequest(part);
            if(request)
            {
                return request.next(quantity);
            }

            return null;
        }
        public nextAll(part:string, quantity:number):APIExtended
        public nextAll(quantity:number):APIExtended
        public nextAll():APIExtended
        public nextAll(part:any = null, quantity?:number):APIExtended
        {
            if(typeof part == "number")
            {
                quantity = part;
                part = null;
            }
            var request:any = this._getRequest(part);
            if(request)
            {
                return request.nextAll(quantity);
            }
            return null;
        }
        public previous(part:string, quantity:number):APIExtended
        public previous(quantity:number):APIExtended
        public previous():APIExtended
        public previous(part:any = null, quantity?:number):APIExtended
        {
            if(typeof part == "number")
            {
                quantity = part;
                part = null;
            }
            var request:any = this._getRequest(part);
            if(request)
            {
                return request.previous(quantity);
            }
            return null;
        }
        public previousAll(part:string, quantity:number):APIExtended
        public previousAll(quantity:number):APIExtended
        public previousAll():APIExtended
        public previousAll(part:any = null, quantity?:number):APIExtended
        {
            if(typeof part == "number")
            {
                quantity = part;
                part = null;
            }
            var request:any = this._getRequest(part);
            if(request)
            {
                return request.previousAll(quantity);
            }
            return null;
        }
        protected hasPart(name:string, params:any = null):boolean
        {
            return this._partsPromises[name] || this.getRequest(name, params)!=null;//name == "default";
        }

        public retrieveData(data:string[] = [Collection.PART_DEFAULT], params:any = null):Promise<any>
        {
            if(!data)
            {
                data = [Collection.PART_DEFAULT];
            }
            var _self:Collection<any> = this;
            var promise:Promise<any> = new Promise<any>((accept:any, reject:any):void=>
            {

                var failed:boolean = false;
                var promises:Promise<any>[] = <any>data.map((name:string)=>
                {
                    if(this.hasPart(name, params))
                    {
                        return this.getPartPromise(name, params);
                    }else
                    {
                        //reject Promise
                        failed = true;
                        reject(new Error(name+" is not a correct part's name"));
                        return null;
                    }
                });
                if(failed)
                {
                    return;
                }
               Promise.all(promises).then(function(values:any[])
                {
                    //TODO:weird le data.read devrait être dans le filter ? MAIS VA TE FAIRE FOUTRE CHROME
                    values.filter(function(data:any):boolean{ return data!==true && !data.read?true:false;}).map(function(data:any){
                        data.read = true;
                        return data.data[0];})//.forEach(this.readExternal, _self);
                    accept();
                }.bind(_self), reject);
            });
            return promise;
        }

        protected getPartPromise(name:string, params:any = null):Promise<any>|boolean
        {
            if(!this.hasPart(name, params))
            {
                return null;
            }
            if(!this._partsPromises[name])
            {
                var request: APIExtended = this._getRequest(name, params); //this.getRequest(name, params);



              //  this.requests[name] = request;

                this._partsPromises[name] = new Promise<any>((accept, reject)=>
                {
                    var _self:any = this;
                    request
                        .then(function()
                        {
                            _self._partsPromises[name] = true;
                            accept.call(null, {data:Array.prototype.slice.call(arguments),read:false});

                        },reject);
                });
            }
            return this._partsPromises[name];
        }

        /**
         * Gets default controller for api request
         * @returns {string}
         */
        protected controller():string
        {
            return this.name();
        }
        protected getRequest(name: string, params: any = null): APIExtended
        {
            switch(name)
            {
                case Model.PART_DEFAULT:
                    return this.request(name).controller(this.controller()).action(this.name());
            }
            return null;
        }
        public request(name: string): any {
            return API.request().name("controller_" + this.controller()+"_"+this.name() + "_" + name);
        }
        public getModelByID(id:any):T
        {
            var id_name:string = this.getModelIDName();
            var len:number = this._models.length;
            for(var i:number=0; i < len; i++)
            {
                if(this._models[i] && this._models[i][id_name] == id)
                {
                    return this._models[i];
                }
            }
            return null;
        }
        protected getModelIDName():string
        {
            var cls:any = this.getDefaultClass();
            if(typeof cls.getIDName != "function")
            {
                debugger;
                throw new Error("[API ERROR] Child class must have a static method getIDName()");
            }
           return cls.getIDName();
        }
        /**
         * @protected
         * @type {[type]}
         */
        public _onChange( model:T):void
        public _onChange(key:string, model:T):void
        public _onChange(key:any, model?:T):void
        {
            if(arguments.length)
                model = arguments[arguments.length - 1];

            if(model)
            {
                this._triggerUpdate(model);
            }else
            {
                debugger;
            }
        }
        protected _triggerUpdateAll()
        {
            super._triggerUpdateAll();
            if (this._order)
            {

            }
        }
        /**
      * @protected
      * @type {[type]}
      */
        public _add(model: T): void {

            super._add(model);
            if(this._cache && model)
            {
                var index: number = this._models.indexOf(model);
                if(index<this._cache && (<any>model).serialize)
                {
                    this.cache().setItem("model" + index, (<any>model).serialize()).then(function() {
                        debugger;
                    }, function() {
                            debugger;
                        });
                }
            }


        }
        private t = 0;
        public push(...models:T[]):number
        {
            var index:number;
            var model:T;
            for(var p in models)
            {
                model = models[p]
                if(!this._models.length)
                {
                    this._models.push(model);
                    this._add(model);
                    continue;
                }
                if((index = this._models.indexOf(model))==-1)
                {
                    //if list ordonned
                    if(this._order)
                    { 
                        var result:IBinaryResult = Arrays.binaryFindArray(this._models, model, this._order, this._orderDirection);
                        if(result.index == undefined)
                        {
                            //handle order

                               if (result.order > 0)
                               {
                                   this._models.push(model);
                               }else
                               {
                                   this._models.unshift(model);
                               }
                        }else
                        {
                            ///test before remove this false
                            
                            // if(false && result.index == this._models.length)
                            // {
                            //     this._models.push(model);
                            // }else
                            // {
                            //     this._models.splice(result.index, 0, model);
                            //     /*
                            //     debugger; splice doesnt seems to work with ractive.0.8
                            //     var temp1 = this._models.slice(0, result.index);
                            //     var temp2 = this._models.slice(result.index);
                            //     temp1.push(model);
                            //     this._models =  temp1.concat(temp2);*/
                            // }
                             this._models.splice(result.index, 0, model);
                            /*

                            if (this._orderDirection > 0) {
                                this._models.splice(result.index, 0, model);
                            }else
                            {
                                this._models.splice(result.index+1, 0, model);
                            }*/
                        }
                    }else
                    {
                        this._models.push(model);
                    }
                    this._add(model);
                }else
                {
                    console.warn("already into collection:", model);
                }
            }

            return this.length();
        }

        private detectFullyLoad( length : number ) : void
        {
            if (!this._lastPart)
            {
                return;
            }
            var apidata : any = this.getAPIData();
            var request: any;
            var api: APIExtended = this._getRequest(this._lastPart);
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
                            this.is_fully_load = true;
                            this.trigger(Collection.EVENT_CHANGE);
                        }
                    }
                }
            }

          
        }

        public getMixins(): any[] {
            return null;
        }

        public readExternal(input:any[]):void
        {
            if(input)
            {

                if(!input.length || !input.forEach)
                {
                    //needed to not break the flow
                    this.detectFullyLoad( 0 );
                    this.triggerFirstData();
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
                        var model:T = <any>Model.get(rawModel.__class);
                        model.readExternal(rawModel);
                        this.push(model);
                    }else
                    {
                        if(typeof rawModel == "object")
                        {
                            var cls:any = this.getDefaultClass();
                            var id:string = this.getModelIDName();
                            var model:T;
                            if(rawModel && rawModel[id] != undefined)
                            {
                                model = this.getModelByID(rawModel[id] );
                            }
                            if(!model)
                            {
                                model  = <any>Model.get(cls);
                                if (this._mixins != undefined || this.getMixins())
                                {
                                    if(!this._mixins)
                                        this._mixins = this.getMixins();
                                    this._mixins.forEach((mixin:any)=>
                                    {
                                        if(mixin instanceof MixinConfig)
                                        {
                                            applyMixins(model, [mixin.mixin], mixin.config);
                                        }else{
                                            applyMixins(model, [mixin]);
                                        }
                                    });
                                    /*var mixins: any[] = this.getMixins();
                                    for(var p in mixins)
                                    {
                                        applyMixins()
                                    }*/
                                }

                                model.readExternal(rawModel);
                                this.push(model);
                            }else
                            {
                                model.readExternal(rawModel);
                            }

                         //   this.trigger(Collection.EVENT_CHANGE, model);
                        }else
                        {
                            console.error("RawModel must be object, given ", rawModel);
                        }
                    }
                }, this);
                this.detectFullyLoad( input.length );
                this.triggerFirstData();
                this.trigger(Collection.EVENT_CHANGE);
            }
        }
        public toRactive():any
        {
            return this;
        }
    }
