namespace ghost
{
    export class _Constant
    {
        public debug:boolean = true;
        public cordovaEmulated:boolean = false;
        public set(key:string, value:any)
        {
			this[key] = value;
        }
        public has(key:string):boolean
        {
			return this[key] != undefined;
        }
        public get(key:string):any
        {
			return this[key];
        }
        public readExternal(data:any)
        {
        	for(var key in data)
        	{
				this[key] = data[key];
        	}
        }
    }
    export var constants:_Constant = new _Constant();
}
