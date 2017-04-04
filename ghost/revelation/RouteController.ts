//missing
import {Application} from "ghost/revelation/Application";
//convert
 /* ghost.core.CoreObject
*/
import {CoreObject} from "ghost/core/CoreObject";

    

	export class RouteController extends CoreObject
	{
		public static IGNORED:string[] = ["getClassName","getFullClassName","getUniqueInstance"];
		protected app:Application;
		private _name:string;
		public setApplication(application:Application):void
		{
			this.app = application;
		}
		public ready():void
		{
			
		}
		public name():string
		{
			if(!this._name)
			{
				this._name = this.getClassName().replace(/route/gi,"");
				this._name = this._name.substring(0,1).toLocaleLowerCase()+this._name.substring(1);
			}
			return this._name
		}
		public prefix():string
		{

			return this.name();
		}
	}
