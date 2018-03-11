



///<module="logging"/>


    //convert-import
    var mysql = require("mysql2/promise");
    export class Mysql
    {
        private static _instance:Mysql;
        public static instance():Mysql
        {
            if(!Mysql._instance)
            {
                Mysql._instance = new Mysql();
            }
            return Mysql._instance;
        }
        public static async createConnection(options:any)
        {
            return this.instance().createConnection(options);
        }
        public static async execute(...params)
        {
            return this.instance().execute(...params);
        }

        protected _connection:any;
        public async createConnection(options:any)
        {
            this._connection = await mysql.createConnection(options);
            return this._connection;
        }
        public async execute(...params)
        {
            return  this._connection.execute(...params);
        }
        
    }
