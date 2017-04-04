

	export class Model
	{
		protected data:any;
		public readExternal(data:any):void
		{
			this.data = data;
		}
		public writeExternal():any
		{
			return this.data;
		}
	}
