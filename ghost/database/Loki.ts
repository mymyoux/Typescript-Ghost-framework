    var loki = require("lokijs");
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
        public constructor(path:string, options?:any)
        {
            Loki._instance = this;
            this.loki = new loki(path, options);
        }
    }
