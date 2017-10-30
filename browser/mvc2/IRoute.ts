	export interface IRoute
	{
		starts_with?: string;
		type?: string;
		route?: any;//string or regexp
		base_route?: any;//string or regexp
		callback?:Function;
		scope?: string; 
		defaults?: any;
		params?: any;
		paramsNames?: any;
		priority?: number;
	}