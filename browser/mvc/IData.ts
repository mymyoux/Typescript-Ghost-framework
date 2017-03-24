///<module="events"/>
namespace ghost.browser.mvc
{
	import EventDispatcher = ghost.events.EventDispatcher;
	export interface IData
	{
		name():string;
		value:any;
	}
	export interface IDataParts
	{
		parts():string[];
		data:Data;
	}
	export class Data
	{
		private _name:string;
		constructor(name:string, public value:any)
		{
			this._name = name;
		}
		public name():string
		{
			return this._name;
		}
	}
}
