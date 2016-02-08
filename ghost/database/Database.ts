///<lib="sequelize"/>
///<lib="node"/>
///<lib="es6-promise"/>
///<module="logging"/>

namespace ghost.database
{
    import log = ghost.logging.log;
    var Sequelize = require("sequelize");
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
            if(!options)
            {
                options = {};
            }
            if(!options.dialect)
            {
                options.dialect = dialect;
            }
            if (!options.host) {
                options.host = host;
            }
            this.db = new Sequelize(database, username, password, options);
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
