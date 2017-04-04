

	export class Root
	{
		protected static _root: any;
		public static getRoot()
		{
			if (Root._root)
			{
				return Root._root;
			}
			try {
				Root._root = window;
				window["ROOT"] = Root._root;
				Root._root._isNode = false;
			} catch (error) {
				try {

					Root._root = eval("global");
					Root._root.ROOT = Root._root;
				} catch (error) {

				}
				Root._root._isNode = true;
			}
			return Root._root;
		}
	}
