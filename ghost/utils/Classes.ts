//convert
 /* ghost.core.Root.*/
import {Root} from "ghost/core/Root";
import { Strings } from "ghost/utils/Strings";

    export class Classes
    {
        public static getName(cls:any):string
        {
            //es6
       
            var clsText:string = cls+"";
            var funcNameRegex = /function ([^\(]{1,})\(/;
            var results  = (funcNameRegex).exec(clsText);
            if (results && results.length > 1)
            {
                return results[1];
            }
            var funcNameRegex = /class ([^\({]{1,}){/;
            var results  = (funcNameRegex).exec(clsText);
            if(results != null && (results && results.length > 1) )
            {
                return Strings.trim(results[1]);
            }
            if(cls && cls.constructor && cls.constructor.name)
            {
                return cls.constructor.name;
            }
            return "";
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
            var root:any = Root.getRoot();
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
            if (typeof require === "function" && typeof require["specified"] === "function") {
                return require(name);
            }
            var root:any = Root.getRoot();
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
