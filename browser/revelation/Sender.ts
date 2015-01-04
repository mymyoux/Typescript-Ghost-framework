module ghost.browser.revelation
{
	export class Sender
	{
		
		/**
		 * @protected
		 * @type {Controller}
		 */
		public controller:Controller;
		private application:Application;
		constructor(controller:Controller)
		{
			this.controller = controller;
			this.application = Application.getApplication(this.controller.getApplicationName());
			this.application.addSender(this);
		}
		public sendModel(model:ghost.revelation.Model, keys:string[], callback:Function = null):void
		{
			this.application.write(ghost.revelation.ApplicationMessage.ACTION_MODEL,model.toObject(keys), callback);
		}
		public getName():string
		{
			return this.controller.getName();
		}
		/*
		public sendCollection(model:ghost.revelation.Model, keys:string[]):void
		{
			this.application.write(ghost.revelation.ApplicationMessage.ACTION_MODEL,model.toObject(keys));
		}*/
		public callAction(action:string, data:any, callback:Function = null):void
		{
			if(!action || action.substring(0, 2)=="__")
			{
				throw new Error("action can't be null or starts with __");
			}
			this.application.writeController(this.getName(), action, data, callback);
		}
		public _onMessage(message:ghost.revelation.ApplicationMessage):void
		{
			if(this.controller[message.action+"Action"])
			{
				this.controller[message.action+"Action"].call(this.controller, message.data);
			}else
			{
				if(this[message.action+"Action"])
				{
					this[message.action+"Action"].call(this, message.data);
				}else
				{

					this.onMessage(message.action, message.data);
				}
			}
		}
		public onMessage(action:string, message:ghost.revelation.ApplicationMessage):void
		{

		}


	}

}