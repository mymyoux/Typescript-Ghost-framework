import { Strings } from "ghost/utils/Strings";

export class Database 
{
    public db:any;
    public constructor(db:any)
    {
        this.db = db;
    }
    public put(...params)
    {
        console.log("DATABASE PUT:", params);
        params = this._clearParams(params);
        return this.db.put(...params);
    }
    public post(...params)
    {
        params = this._clearParams(params);
        return this.db.post(...params);
    }
    private _clearParams(p:any[]):any[]
    {
        if(!p)
            return p;
        var params:any;
        for(var q in p)
        {
            params = p[q];
            var keys:string[] = Object.keys(params).filter((item)=>Strings.startsWith(item,"__"));
            for(var k of keys)
            {
                delete params[k];
            }

        }
        return p;
    }
    public async get(...params)
    {
        try{

            params = this._clearParams(params);
            var result = await this.db.get(...params);
            return result;
        }catch(error)
        {
            return null;
        }
    }
    public getRaw(...params)
    {
        params = this._clearParams(params);
        return this.db.get(...params);
    }
    public info()
    {
        return this.db.info();
    }
    public async find(...params)
    {
        try{
            var result = await this.db.find(...params);
            if(result && result.docs)
            {
                return result.docs;
            }
            return result;
        }catch(error)
        {
            return [];
        }
    }
    public async findOne(...params)
    {
        var results:any[] = await this.find(...params);
        if(results.length)
            return results[0];
        return null;
    }
    public async all(...params)
    {
        try{
            if(!params.length)
            {
                params = [{include_docs:true}];
            }
            var result = await this.db.allDocs(...params);
            if(result && result.rows)
            {
                return result.rows.map((item)=>item.doc);
            }
            return result;
        }catch(error)
        {
            return [];
        } 
    }
    public remove(...params)
    {
        params = this._clearParams(params);
        return this.db.remove(...params);
    }
    public getIndexes(...params)
    {
        return this.db.getIndexes(...params);
    }
    public createIndex(...params)
    {
        return this.db.createIndex(...params);
    }
    public deleteIndex(...params)
    {
        return this.db.deleteIndex(...params);
    }
}