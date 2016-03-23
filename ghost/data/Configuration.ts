///<module="utils"/>
namespace ghost.data
{
	export class Configuration
	{
		private static data: any = {};
		public static merge(key: string, value: any): void;
		public static merge(data: any): void;
		public static merge(key: string, data?: any): void
		{
			if(typeof key == "string")
			{
				if (Configuration.data[key])
				{
					Configuration.data[key] = ghost.utils.Objects.merge(Configuration.data[key], data);
				}else
				{
					Configuration.data[key] = data;
				}
			}else
			{
				data = <any>key; 
				Configuration.data = ghost.utils.Objects.merge(Configuration.data, data);
			}
		}
		public static has(key: string): boolean
		{
			return Configuration.data[key] != undefined;
		}
		public static get(key: string): any {
			return Configuration.data[key] != undefined ? Configuration.data[key] : null;
		}
		public static set(key: string, value: any): void
		{
			Configuration.data[key] = value;
		}
	}
}
