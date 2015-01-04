///<module="ghost/events"/>
///<module="ghost/utils"/>
module ghost.revelation
{
	export class Model extends ghost.events.EventDispatcher
	{
		public static CHANGE:string = "change";
		public static CHANGED:string = "changed";
		/**
		 * @protected
		 * @type {any}
		 */
		public _data:any;
		private _timeout:NodeTimer = <any>-1;
		private _changed:string[];
		private _name:string;
		constructor()
		{
			super();
			if(!this._data)
			{
				this._data = {};
			}
			this._changed = [];
		}
		public set(key:string, value:any):void
		{
			this._data[key] = value;
			this._triggerUpdate(key);

		}
		public getID():string
		{
			if(!this.hasID())
			{
				this._generateID();
			}
			return this._data.id;
		}
		public getFullClassName():string
		{
			throw new Error("You must override this function and set a complete class name return");
			return null;
		}
		public hasID():boolean
		{
			return this._data.id != null;
		}
		public setID(value:string):void
		{
			this.set("id", value);
		}
		public get(key:string):any
		{
			return this._data[key];
		}
		public _triggerUpdate(key:string):void
		{
			this.trigger(Model.CHANGE, key);
			if(this._changed.indexOf(key)==-1)
				this._changed.push(key);
			if(<any>this._timeout == -1)
			{
				this._timeout = <any>setTimeout(()=>
				{
					this._timeout = <any>-1;
					var copy:string[] = this._changed;
					this._changed = [];
					this.trigger(Model.CHANGED, copy);

				},0);
			}
		}
		public getName():string
		{
			if(!this._name)
			{
				this._name = this.getClassName().replace(/model/gi,"");
			}
			return this._name;
		}
		private _generateID():void
		{
			if(!this.hasID())
			{
				this.setID(ghost.utils.Strings.getUniqueToken());
			}
		}
		public readExternal(input:any):void
		{
			this._data = input;
		}
		public writeExternal():any
		{
			return this.toObject();
		}
		public isValid(user:any, $set:any, $unset:any, callback:(error:Error)=>void):void
		{
			if(callback)
				callback(null);
		}
		public toObject(keys:string[] = null):any
		{
			if(!this.hasID())
			{
				this._generateID();
			}
			return this._data;
		}

	}
}