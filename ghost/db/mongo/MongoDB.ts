///<file="mongo/Table"/>
///<module="framework/ghost/utils"/>
module ghost.db.mongo
{
	export class MongoDB
	{
		private static MONGO:any = require("mongojs");
		public db:any;
		private tables:Table[];
		private hashTables:any;
		public constructor()
		{
			this.tables = [];
			this.hashTables = {};
		}
		public setOptions(options:IMongoDBConnection):void
		{
			var connectionString:string = options.url;
			if(!ghost.utils.Strings.endsWith(options.url, "/"))
			{
				connectionString += "/";
			}
			connectionString += options.database;
			if(options.login)
			{
				connectionString = options.login + ( options.password? ":"+options.password : "") + "@" + connectionString;
			} 
			this.db = MongoDB.MONGO(connectionString);
		}
		public addTables(tables:Table[]):void
		{
			if(!tables)
			{
				return;
			}
			this.tables =	this.tables.concat(tables);
			tables.forEach(function(table:Table)
			{
				table.setDatabase(this);
				this.hashTables[table.getName()] = table;
			}, this);
		}
		public addTable(table:Table):void
		{
			table.setDatabase(this);
			this.hashTables[table.getName()] = table;
			this.tables.push(table);
		}
		public getTable(name:string):Table
		{
			if(!this.hashTables[name])
			{
				var table:DefaultTable = new DefaultTable();
				table.setName(name);
				console.log("No table named ["+name+"] default class used");
				this.addTable(table);
			}
			return this.hashTables[name];
		}
	}
	export interface IMongoDBConnection
	{
		url:string;
		database:string;
		login?:string;
		password?:string;
	}
}