///<lib="sequelize"/>
///<lib="node"/>
///<lib="es6-promise"/>
///<module="logging"/>

namespace ghost.database
{
    import log = ghost.logging.log;
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
            this.db = new Sequelize(database, username, password, {host:host, dialect:dialect, logging:log.info}, options);
            this.initDefine();
            this.initRelations();
        }
        protected initDefine():void
        {

        }
        protected initRelations(): void
        {

        }
        protected define(table:string, schema:any, options:any):any
        {
            return this[table] = this.db.define(table, schema, options);
        }
    }
}
