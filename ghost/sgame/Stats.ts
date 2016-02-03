///<module="events"/>
///<file="Socket"/>
namespace ghost.sgame {
	var json2: any = require("JSON2");
	var util: any = require("util");
    import Const = ghost.sgamecommon.Const;
    import log = ghost.logging.log;
    export class Stats extends ghost.events.EventDispatcher {
		private static _instance: Stats;
		public static instance():Stats
		{
			return Stats._instance;
		}
		public users: User[];
		public apps: Application[];
		public constructor()
		{
			super();
			Stats._instance = this;
		}
		public inspect(): any {
            var data: any = {};
            for (var p in this) {
                if (this.hasOwnProperty(p))
                    if (p.substring(0, 1) != "_") {
						if (typeof this[p] == "object" && this[p].inspect)
						{
							data[p] = this[p].inspect();
						}else
						{
	                        data[p] = this[p];
						}
                    }
            }
            if(data.users)
            {
				data.users = data.users.map(function(user) {
					return user.inspect();
				});
            }
            if(data.apps)
            {
				data.apps = data.apps.map(function(app) {
					return app.inspect();
				});
            }
            data = this._cleanData(data);
            return data;
        }
        private _cleanData(data:any, done:any[] = null, doneClean:any[] = null):void
        {
			if (done == undefined)
			{
				done = [];
			}
			if (doneClean == undefined)
			{
				doneClean = [];
			}
			var index: number;
			if((index=done.indexOf(data)) !=-1)
			{
				return doneClean[index];
			}
			done.push(data);
			var newData: any = util.isArray(data)?[]:{};

        	for(var p in data)
        	{
        		if(!data.hasOwnProperty(p))
        		{
					continue;
        		}
        		if(p.substring(0, 1) == "_")
        		{
				//	delete data[p];
					continue;
        		}
        		if(typeof data[p] == "object")
        		{
					if (data[p] && data[p].inspect) {
						newData[p] = this._cleanData(data[p].inspect(), done, doneClean);
					}else
					{
						newData[p] = this._cleanData(data[p], done, doneClean);
					}
        		}else
        		{
					newData[p] = data[p];
        		}
        	}
			doneClean.push(newData);
			return newData;
        }
        public toJSON():any
        {
			return json2.decycle(this.inspect());
        }
    }
}
