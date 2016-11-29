///<module="framework/ghost/data"/>
namespace ghost.services {
	import Configuration = ghost.data.Configuration;
	export class Env {
		public static isLocal(): boolean {
			return window.location.href.indexOf(".local") != -1 || window.location.href.indexOf("local.") != -1 || Configuration.get("is_local") == true;
		}
		public static isDebug():boolean{
			return Env.isLocal() || Configuration.get("is_debug") == true;
		}
	}
}
