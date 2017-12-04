var alasql = require("alasql");
var fs = require("fs");
var path = require("path");
import {Database} from "./alasql/Database";
export class AlaSQL
{
    private static _instance:AlaSQL;
    public static instance():AlaSQL
    {
        return this._instance;
    }
    public static db(name?:string):any
    {
        return AlaSQL.instance().db(name);
    }
    protected dirname:string;
    protected dbOptions:string;
    protected database:any;
    protected databases:any = {};
    public constructor(dirname:string, options?:any)
    {
        AlaSQL._instance = this;
        this.dirname = dirname;
        this.dbOptions = options;
        //create directory if not exists
        if(!fs.existsSync(dirname))
        {
            fs.mkdirSync(dirname);
        }
        
    }
    public createDB(name:string):any
    {
        if(arguments.length == 1)
        {
            setTimeout(()=>
        
            {
                this.createDB.apply(this, [name, 1]);
            }, 3000);
            return;
        }
        var full_path:string = path.join(this.dirname, name)+".json";
        console.log("AlaSQL:\t"+full_path);
        var database:any;
        //TODO:remove
        // if(fs.existsSync(full_path))
        // {
        //     fs.unlinkSync(full_path);
        // }
        database = new Database(new alasql.Database(name));
        if(!fs.existsSync(full_path))
        { 
            fs.writeFileSync(full_path,'{"tables":{}}','utf-8');
            //alasql("CREATE FILESTORAGE DATABASE "+name+"(\""+full_path+"\")");
            //alasql("ATTACH FILESTORAGE DATABASE "+name+"(\""+full_path+"\")");
        } 
        // if(!fs.existsSync(full_path))
        // { 
        // //    alasql("CREATE FILESTORAGE DATABASE "+name+"(\""+full_path+"\")");
        //     //alasql("ATTACH FILESTORAGE DATABASE "+name+"(\""+full_path+"\")");
        // }else{
            try{
                debugger;
                alasql("ATTACH FILESTORAGE DATABASE "+name+"(\""+full_path+"\")");
            }catch(error)
            {
                debugger;
            }
        //}
        // var create:string = "CREATE TABLE history (id INT AUTOINCREMENT, history_id INT, server_id INT, db_id INT, type STRING, data STRING,  created_time TIMESTAMP, updated_time TIMESTAMP)";
        // console.log(create);
        // try{

        //     database.exec(create) // AUTOINCREMENT, history_id INT, server_id INT, database_id INT, type STRING, value STRING, created_time TIMESTAMP, updated_time TIMESTAMP
        //     console.log(database);
        // }catch(error)
        // {
        //     console.log("error");
        //     console.error(error);
        //     debugger;
        // }
        if(!this.database)
        {
            this.database = database;
        }
        this.databases[name] = this.database;
    }
    public db(name?:string):any
    {
        if(!name)
            return this.database;
        return this.databases[name];
    }
}
