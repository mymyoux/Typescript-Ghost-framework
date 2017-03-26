namespace ghost.browser.mvc {
	export class Data {
		private _name: string;
		constructor(name: string, public value: any) {
			this._name = name;
		}
		public name(): string {
			return this._name;
		}
	}
}
