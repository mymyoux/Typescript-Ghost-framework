var sqllite3 = require("sqllite3");
var fs = require("fs");
var path = require("path");
import {Database} from "./sqllite/Database";
export class SQLLite
{
    private static _instance:SQLLite;
    public static instance():SQLLite
    {
        return this._instance;
    }
    public static db(name?:string):any
    {
        return SQLLite.instance().db(name);
    }
    protected dirname:string;
    protected dbOptions:string;
    protected database:any;
    protected databases:any = {};
    public constructor(dirname:string, options?:any)
    {
        SQLLite._instance = this;
        this.dirname = dirname;
        this.dbOptions = options;
        //create directory if not exists
        if(!fs.existsSync(dirname))
        {
            fs.mkdirSync(dirname);
        }
        
    }
    public createDB(name:string):Promise<any>
    {
        return new Promise<any>((resolve:any, reject:any):void=>
        {

            var full_path:string = path.join(this.dirname, name)+".json";
            console.log("SQLLite:\t"+full_path);
            var database:any;
            //TODO:remove
            // if(fs.existsSync(full_path))
            // {
            //     fs.unlinkSync(full_path);
            // }
            database = new Database(new sqllite3.Database(full_path, null, function(error)
            {
                if(!error)
                    resolve();
                else
                    reject(error);
            }));
            if(!this.database)
            {
                this.database = database;
            }
            this.databases[name] = this.database;
        });
    }
    public db(name?:string):any
    {
        if(!name)
            return this.database;
        return this.databases[name];
    }
}
