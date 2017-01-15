namespace ghost.db
{
	export class Mongo
	{
		public static create(config:any):Mongo
		{
			var str: string = "";
			if(config.user)
			{
				str += config.user;
			}
			if(config.password)
			{
				str += ":" + config.password;
			}
			if(config.host)
			{
				if(str)
				{
					str += "@";
				}
				str += config.host;
			}
			if (config.database)
			{
				if(str)
				{
					str += "/";
				}
				str += config.database;
			}
			var mongo: Mongo = new Mongo(str);
			mongo = new ROOT.Proxy(mongo, mongo);
			return mongo;
		}
		protected db: any;
		public constructor(connectionString:string)
		{
			var mongojs = require('mongojs');
			this.db = mongojs(connectionString);
		}
		public get(target, name:string):any
		{
			return target.db.collection(name);
		} 
	}
}
