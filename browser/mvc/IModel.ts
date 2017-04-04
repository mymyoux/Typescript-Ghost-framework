
///<module="events"/>

	//convert-import
import {EventDispatcher} from "ghost/events/EventDispatcher";
	export interface IModel extends EventDispatcher {
		readExternal(input: any): void;
		toObject(): any;
	}
