///<lib="sequelize"/>
///<lib="node"/>
///<lib="Promise"/>
///<module="logging"/>

namespace ghost.database
{
    import log = ghost.logging.log;
    var Sequelize = require("sequelize");
    var mysql = require("mysql");
    export class Database
    {
        private static _instance:Database;
        public static instance():Database
        {
            return Database._instance;
        }
        protected db:any;
        protected sql:any;
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
            this.sql = mysql.createConnection({
                host: options.host,
                user: username,
                database: database,
                password: password
            });

            this.initDefine();
            this.initRelations(); 
        }
        public query(query:string, params:any[],callback:any)
        public query(query:string,callback:any)
        public query(query:string, params:any[],callback?:any)
        {
            this.sql.query.apply(this.sql, Array.prototype.slice.call(<any>arguments));
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
