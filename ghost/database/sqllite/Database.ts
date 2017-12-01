export class Database 
{
    public db:any;
    public constructor(db:any)
    {
        this.db = db;
    }
    public compile(request:string):any
    {
        return (params?:any):Promise<any>=>
        {
            return  this.run(request, params);
        };
    }
    public run(request:string, params?:any):Promise<any>
    {
        return new Promise<any>((resolve:any, reject:any):void=>
        {
            this.log(request, params);
            this.db.run(request, params, function(error)
            {
                if(error)
                {
                    console.error("[DB-ERROR]", error); 
                    return reject(error);
                }
                if(this.lastId!=undefined)
                {
                    resolve(this.lastId);
                }else{
                    resolve();
                }
            });
        });
    }
    public get(request:string, params?:any):Promise<any>
    {
        return new Promise<any>((resolve:any, reject:any):void=>
        {
            this.log(request, params);
            this.db.get(request, params, function(error, row)
            {
                if(error)
                {
                    console.error("[DB-ERROR]", error); 
                    return reject(error);
                }
                resolve(row);
            });
        });
    }
    public all(request:string, params?:any):Promise<any>
    {
        return new Promise<any>((resolve:any, reject:any):void=>
        {
            this.log(request, params);
            this.db.all(request, params, function(error, rows)
            {
                if(error)
                {
                    console.error("[DB-ERROR]", error); 
                    return reject(error);
                }
                resolve(rows);
            });
        });
    }
    public close():Promise<any>
    {
        return new Promise<any>((resolve:any, reject:any):void=>
        {
            this.db.close(function(error)
            {
                if(error)
                {
                    console.error("[DB-ERROR]", error); 
                    return reject(error);
                }
                resolve();
            });
        });
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