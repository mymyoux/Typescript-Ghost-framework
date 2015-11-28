namespace ghost.level.data
{
    ///
    /**
     * HashMap
     */
    export class HashMap<KEY, VALUE>
    {
        public values:VALUE[];
        public keys:KEY[];
        public constructor()
        {
            this.values = [];
            this.keys = [];
        }
        public clear():void
        {
            this.keys.length = 0;
            this.values.length = 0;
        }
        public has(key:KEY):boolean
        {
           return this.keys.indexOf(key)!=-1;
        }
        public get(key:KEY):VALUE
        {
            var index:number = this.keys.indexOf(key);
            if(index != -1)
            {
                return this.values[index];
            }else
            {
                return null;
            }
        }
        public set(key:KEY, value:VALUE):void
        {
            var index:number = this.keys.indexOf(key);
            if(index == -1)
            {
                index = this.keys.length;
                this.keys.push(key);
            }
            this.values[index] = value;
        }
        public remove(key:KEY):void
        {
            var index:number = this.keys.indexOf(key);
            if(index != -1)
            {
                this.values.splice(index, 1);
                this.keys.splice(index, 1);
            }
        }
        public size():number
        {
            return this.keys.length;
        }
        public toArray():VALUE[]
        {
            return this.values.slice();
        }
    }
}

