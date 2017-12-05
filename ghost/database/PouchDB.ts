var fs = require("fs");
var path = require("path");
import {Database} from "./pouchdb/Database";
var Pouch = require('pouchdb');
export class PouchDB
{
    private static _instance:PouchDB;
    public static instance():PouchDB
    {
        return this._instance;
    }
    public static db(name?:string):any
    {
        return PouchDB.instance().db(name);
    }
    protected dirname:string;
    protected dbOptions:string;
    protected database:any;
    protected databases:any = {};
    public constructor(dirname:string, options?:any)
    {
        PouchDB._instance = this;
        this.dirname = dirname;
        this.dbOptions = options;
        //create directory if not exists
        if(!fs.existsSync(dirname))
        {
            fs.mkdirSync(dirname);
        }
        Pouch.on("error", function(error)
    {
        console.log("ERROR", error);
    })
        Pouch.on("openError", function(error)
    {
        console.log("EOPEN RROR", error);
    })
        //Pouch.debug.enable('*');
        Pouch.plugin(require('pouchdb-find'));
        
        
    }
    public db(name:string):any
    {
        if(!this.databases[name])
        {
            return this.createDB(name);
        }
        return this.databases[name];
    }
    public createDB(name:string):any
    {
        var full_path:string = path.join(this.dirname, name);//+".json";
        console.log("PouchDB:\t"+full_path);
        var database:any;
        //TODO:remove
        // if(fs.existsSync(full_path))
        // {
        //     fs.unlinkSync(full_path);
        // }
        database = new Database(new Pouch(full_path,{auto_compaction: true}));
        if(!this.database)
        {
            this.database = database;
        }
        this.databases[name] = database;
        return database;
    }
}
