
type Constructor<T> = new(...args: any[]) => T;

export function Collection<T extends Constructor<{}>>( Model: T ) {
    return class extends Model {
        public models:T[];
        constructor(...args: any[]) {
            super(...args);
            this.models = [];
        }
        public clear():void
        {
            this.clearModels();
        }

        public clearModels()
        {
            //var models:T[]   = this.models.concat();
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
        public splice(index:number, howMany:number, ...models:T[]):T[]
        {
            return this.models.splice(index, howMany, ...models);
        }
        public unshift(...models:T[]):number
        {
            return this.models.unshift(...models);
        }
        public concat(...models:T[]):this
        {
            var cls:any = this.constructor;
            var collection:this = new cls();
            collection.models = this.models;
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
            return this.models.slice();
        }
    }
}