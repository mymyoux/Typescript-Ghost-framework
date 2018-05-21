//convert
 /*/ghost.utils.Maths.*/
import {Maths} from "ghost/utils/Maths";




/*

window.onerror = function(err, url, line){
    alert(err + '\n on page: ' + url + '\n on line: ' + line);
};*/

    /**
     * CoreObject
     */
    export class CoreObject 
    {
        /**
         * Classname
         */
        private _className:string;
        //protected __instance:number;
        //private static __id:number = 0;
        constructor()
        {
            //TODO:remove instances
            //this.__instance = CoreObject.__id++;//Maths.getUniqueID();
        }
        
        /**
         * Gets current Classname
         * @returns {string}
         */
        public getClassName():string
        {
            if(!this._className)
            {
                if(typeof this == "object")
                {
                    if(this["constructor"]["name"])
                    {
                        this._className = this["constructor"]["name"];
                    }else
                    {
                        var funcNameRegex = /function ([^\(]{1,})\(/;
                        var results  = (funcNameRegex).exec(this["constructor"].toString());
                        this._className = (results && results.length > 1) ? results[1] : "";
                    }
                }else{

                    if(this["name"])
                    {
                       return this["name"];
                    }else
                    {
                        var funcNameRegex = /function ([^\(]{1,})\(/;
                        var results  = (funcNameRegex).exec(this["toString"]());
                        return (results && results.length > 1) ? results[1] : "";
                    }
                }
            }
            return this._className;
        }
        public static getClassName():string
        {
                if(typeof this == "object")
                {
                    if(this["constructor"]["name"])
                    {
                        return  this["constructor"]["name"];
                    }else
                    {
                        var funcNameRegex = /function ([^\(]{1,})\(/;
                        var results  = (funcNameRegex).exec(this["constructor"].toString());
                        return (results && results.length > 1) ? results[1] : "";
                    }
                }else{

                    if(this["name"])
                    {
                       return this["name"];
                    }else
                    {
                        var funcNameRegex = /function ([^\(]{1,})\(/;
                        var results  = (funcNameRegex).exec(this["toString"]());
                        return (results && results.length > 1) ? results[1] : "";
                    }
                }
        }
        public getFullClassName():string
        {
            throw new Error("you must implement getFullClassName method before using it");
        }
        // public getUniqueInstance():number
        // {
        //     return this.__instance;
        // }
        public dispose():void
        {

        }
    }
