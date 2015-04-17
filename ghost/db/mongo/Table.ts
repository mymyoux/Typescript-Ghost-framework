///<module="utils"/>
///<file="mongo/Model"/>
module ghost.db.mongo
{
	export class Table
	{
		protected modelClass:any;
		private database:MongoDB;
		private collection:any;
		public constructor()
		{

		}
		public getName():string
		{
			return "table";
		}
		public setDatabase(database:MongoDB):void
		{
			//register database
			this.database = database;
			this.collection = this.database.db.collection(this.getName());
		}
		public setModel(model:any):void
		{
			//register model
			this.modelClass = model;
		}
		protected hydrate(data:any):any
		{
			//hydrate data
			if(ghost.utils.Arrays.isArray(data))
			{
				//array
				return data.map(this.hydrate, this);
			}
			if(!data)
			{
				return null;
			}
			var newModel:any = new this.modelClass();
			newModel.readExternal(data);
			return newModel;
		}
		public findOne(request?:any, columns?:any):Promise<any>
		{
			var promise:Promise<any> = new Promise<any>((resolve, reject)=>
			{


				this.collection.findOne(request, columns, (errors, result:any):void=>
				{
					console.log(resolve);
					console.log(reject);
					console.log(this.hydrate);
					if(errors)
					{
						reject(errors);
						return;
					}
					resolve(this.hydrate(result));
				} );
			});
			return promise;
		}
		public find(request?:any, columns?:any):MongoPromise
		{
			var request:any;
			var callback:any;
			var promise:MongoPromise = new MongoPromise((resolve, reject)=>
			{

				console.log("****", this);
				request = this.collection.find(request, columns);
				callback = (errors:any, result:any):void=>
				{
					if(errors)
					{
						reject(errors);
						return;
					}
					resolve(this.hydrate(result));
				}
			});
			console.log("REQUEST", request);
			console.log(callback);
			promise.setRequest(request, callback);
			return promise;
		}
	}
	export class DefaultTable extends Table
	{
		private name:string;
		protected modelClass:any = Model;
		public setName(name:string):void
		{
			this.name = name;
		}
		public getName():string
		{
			return this.name;
		}
	}
	export class MongoPromise
	{
		private callback:(resolve:(value?:any)=>void, reject:(reason?:any)=>void)=>void;
		private promise:Promise<any>;
		private request:any;
		private requestCallback:any;
		constructor(callback:(resolve:(value?:any)=>void, reject:(reason?:any)=>void)=>void)
		{
			this.callback = callback;
			this.promise = new Promise<any>(callback);
		}
		public setRequest(request:any, callback:any):void
		{	
			this.request = request;
			this.requestCallback = callback;
		}
		public then(resolve:any, reject:any):Promise<any>
		{
			this.request.toArray(this.requestCallback);
			return this.promise.then(resolve, reject);
		}
		public limit(value:number):MongoPromise
		{
			console.log("limit:"+value);
			this.request = this.request.limit(value);
			return this;
		}
		public skip(value:number):MongoPromise
		{
			this.request = this.request.skip(value);
			return this;
		}
	}
}