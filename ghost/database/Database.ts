///<lib="sequelize"/>
///<lib="node"/>
///<lib="es6-promise"/>

namespace ghost.database
{
    var Sequelize = require("Sequelize");
    export class Database
    {
        private static _instance:Database;
        public static instance():Database
        {
            return Database._instance;
        }
        protected db:any;
        public constructor(database:string, host:string, username:string, password:string, dialect:string = "mysql", options:any = null)
        {
            Database._instance = this;
            this.db = new Sequelize(database, username, password, {host:host, dialect:dialect}, options);
            this.initDefine();
        }
        protected initDefine():void
        {

        }
        protected define(table:string, schema:any, options:any):any
        {
            return this[table] = this.db.define(table, schema, options);
        }
    }
}