///<module="ghost/core"/>
///<module="ghost/revelation"/>
module ghost.browser.revelation
{
	export class Controller extends ghost.core.CoreObject
	{
		/**
		 * protected
		 * @type {any}
		 */
		public sender:any;
		/**
		 * @protected
		 * @type {Model[]}
		 */
		public _models:ghost.revelation.Model[];
		private _name:string;
		constructor()
		{	
			super();
			this._models = [];
			this.sender = this.getSender();
		}
		public getSender():any
		{
			if(!this.sender)
			{
				this.sender = new Sender(this);
			}
			return this.sender;
		}
		public getName():string
		{
			if(!this._name)
			{
				this._name = this.getClassName().replace(/controller/gi,"");
			}
			return this._name;
		}
		public getApplicationName():string
		{
			return this.getClassName();
		}

		public onModelChanged(keys:string[], model:ghost.revelation.Model):void
		{
			this.sender.sendModel(model, keys);
		}
		public addModel(model:ghost.revelation.Model):void
		{
			if(this._models.indexOf(model)==-1)
			{
				this._models.push(model);
				model.on(ghost.revelation.Model.CHANGED, this.onModelChanged, this, model);
			}
		}
		public removeModel(model:ghost.revelation.Model):void
		{
			var index:number = this._models.indexOf(model);
			if(index!=-1)
			{
				this._models.splice(index, 1);
				model.off(ghost.revelation.Model.CHANGED, this.onModelChanged, this);
			}
		}
		public getModel(index:number):ghost.revelation.Model
		public getModel(name:string):ghost.revelation.Model
		public getModel(object:any):ghost.revelation.Model
		{
			switch(typeof object)
			{
				case "string":
					var len:number = this._models.length;
					for(var i:number=0; i<len; i++)
					{
						if(this._models[i].getName()==object)
						{
							return this._models[i];
						}
					}
				break;
				case "number":
					return this._models[object];
				break;
				default:
					var len:number = this._models.length;
					for(var i:number=0; i<len; i++)
					{
						if(this._models[i] instanceof object)
						{
							return this._models[i];
						}
					}

			}
			return null;
		}
	}
}