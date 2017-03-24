///<module="events"/>
namespace ghost.browser.mvc {
	import EventDispatcher = ghost.events.EventDispatcher;
	export interface IModel extends EventDispatcher {
		readExternal(input: any): void;
		toObject(): any;
	}
}
