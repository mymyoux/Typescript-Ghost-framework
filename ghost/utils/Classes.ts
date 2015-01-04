///<reference path="../core/core.class.d.ts"/>
module ghost.utils
{
    export class Classes
    {
        public static getName(cls:Function):string
        {
            var funcNameRegex = /function (.{1,})\(/;
            var results  = (funcNameRegex).exec(cls+"");
            return (results && results.length > 1) ? results[1] : "";
        }
        /**
         * Tests if a class exists
         * @param name Class name
         * @return true or false
         */
        public static exists(name:string):boolean
        {
            if(!name)
            {
                return false;
            }
            var root:any = ROOT;
            var names:string[] = name.split(".");
            var len:number = names.length;
            for(var i:number=0; i<len; i++)
            {
                root = root[names[i]];
                if(!root)
                {
                    return false;
                }
            }
            return true;
        }
        /**
         * Tests if a class exists
         * @param name Class name
         * @return class constructor
         */
        public static get(name:string):any
        {
            if(!name)
            {
                return null;
            }
            var root:any = ROOT;
            var names:string[] = name.split(".");
            
            var len:number = names.length;
            for(var i:number=0; i<len; i++)
            {
                root = root[names[i]];
                if(!root)
                {
                    return root;
                }
            }
            return root;
        }
        public static isArray(variable:any):boolean
        {
            return Object.prototype.toString.call( variable ) === '[object Array]';
        }
    }
}