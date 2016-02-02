///<module="events"/>
///<file="Socket"/>
namespace ghost.sgame {
	var json2: any = require("JSON2");
    import Const = ghost.sgamecommon.Const;
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
            return data;
        }
        public toJSON():any
        {
			return json2.decycle(this.inspect());
        }
    }
}
