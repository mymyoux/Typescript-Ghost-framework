namespace ghost.utils
{

	export class MFunction {
		private _function: any;
		private _params: any;
		private _scope: any;
		constructor() {

		}
		public getFunction(): any {
			return this._function;
		}
		public setFunction(value: any): void {
			this._function = value;
		}
		public getParams(): any {
			return this._params;
		}
		public setParams(value: any): void {
			this._params = value;
		}
		public getScope(): any {
			return this._scope;
		}
		public setScope(value: any): void {
			this._scope = value;
		}
		public call(scope?: any): any {
			if (!scope) {
				scope = this._scope;
			}
			return this._function.apply(scope, this._params != null && this._params.length > 0 ? this._params : null);
		}
		public toString(): string {
			return "[MFunction params=\"" + this._params + "\" scope=\"" + this._scope + "\" function=\"" + this._function + "\"]";
		}
	}
}
