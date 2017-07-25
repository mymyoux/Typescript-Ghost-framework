    var loki = require("lokijs");
    var fs = require("fs");
    var path = require("path");
    export class Loki
    {
        private static _instance:Loki;
        private loki:any;
        public static instance():Loki
        {
            return Loki._instance;
        }
        public static db():any
        {
            return Loki.instance().loki;
        }
        public constructor(pathDb:string, options?:any)
        {
            Loki._instance = this;
            var dirname:string = path.dirname(pathDb);
            //create directory if not exists
            if(!fs.existsSync(dirname))
            {
                fs.mkdirSync(dirname);
            }
            this.loki = new loki(pathDb, options);
        }
    }
