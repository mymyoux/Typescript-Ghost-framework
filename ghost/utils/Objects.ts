module ghost.utils
{
    export class Objects
    {
        public static deepEquals(a:any, b:any):boolean
        {
            if(typeof a != typeof b)
            {
                return false;
            }
            if(typeof a == "object")
            {
                for(var p in a)
                {
                    if(!Objects.deepEquals(a[p], b[p]))
                    {
                        return false;
                    }
                }
                for(var p in b)
                {
                    if(!Objects.deepEquals(a[p], b[p]))
                    {
                        return false;
                    }
                }
                return true;
            }else
            {
                return a == b;
            }
        }
        public static clone(obj:any, ignore?:string, hidePrivate?:boolean):any;
        public static clone(obj:any, ignore?:string[], hidePrivate?:boolean):any;
        public static clone(obj:any, ignore?:any, hidePrivate:boolean = false):any
        {
            //console.log(obj);
            if(ignore)
            {
                if(typeof ignore == "string")
                {
                    ignore = [ignore];
                }
            }
            // Handle the 3 simple types, and null or undefined
            if (null == obj || "object" != typeof obj) return obj;
        
            // Handle Date
            if (obj instanceof Date) {
                var copy:Date = new Date();
                copy.setTime(obj.getTime());
                return copy;
            }
        
            // Handle Array
            if (obj instanceof Array) {
                var copy_array:any[] = [];
                for (var i = 0, len = obj.length; i < len; i++) {
                    copy_array[i] = Objects.clone(obj[i], null, hidePrivate);
                }
                return copy_array;
            }
        
            // Handle Object
            if (obj instanceof Object) {
                var copy_object:any = {};
                for (var attr in obj) {

                    if (obj.hasOwnProperty(attr) && (!ignore || ignore.indexOf(attr)==-1) && (!hidePrivate || attr.substring(0, 1) != "_"))
                    {
                        if(attr == "data")
                        {
                            debugger;
                        }

                        copy_object[attr] = Objects.clone(obj[attr], null, hidePrivate);
                    }
                }
                return copy_object;
            }
        
            throw new Error("Unable to copy obj! Its type isn't supported.");
        }
        public static makeNestedObject(data:any, name:string):any
        {
            var names:string[] = name.split(".");
            var len:number = names.length;
            for(var i:number=0; i<len; i++)
            {
                if(!data[names[i]])
                {
                    data[names[i]] = {};
                }
                data = data[names[i]];
            }
            return data;
        }
    }
}