export class Database 
{
    public db:any;
    public tables:any;
    public constructor(db:any)
    {
        this.db = db;
        this.tables = this.db.tables;
    }
    public compile(request:string):any
    {
        return (params?:any)=>
        {
            return  this.exec(request, params);
        };
    }
    public exec(request:string, params?:any):any
    {
        this.log(request, params);
        var result:any = this.db.exec(request, params);
        if(!result)
        {
            console.error("[DB-ERROR]"); 
        }
        return result;
    }
    protected log(request:string, data?:any):void
    {
        console.log("[DB]"+request, data);
    }
    protected lastId(table:string, column:string = "id"):number
    {
        return this.db.autoval(table, column);
    }
}