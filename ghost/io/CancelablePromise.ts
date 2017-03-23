///<lib="Promise"/>
namespace ghost.io {
	export class CancelablePromise<T>// extends Promise<T>
	{
		protected promise: Promise<T>;
		public constructor(method: any) {
			var promise: any = new Promise(method);
			CancelablePromise.extends(promise);

			return promise;
		}
		public static extends(promise: any): void {
			promise.canceled = false;
			promise.cancel = CancelablePromise.prototype.cancel.bind(promise);
			promise.then = CancelablePromise.prototype.then.bind(promise);
			promise.setAjax = CancelablePromise.prototype.setAjax.bind(promise);
		}
		public canceled: boolean = false;
		private $ajax: any;
		public cancel(): void {
			if (this.$ajax) {
				this.$ajax.abort();
				this.setAjax(null);
			}

			this.canceled = true;
		}
		public setAjax($ajax: any): void {
			this.$ajax = $ajax;
		}
		public then(resolve?: Function, reject?: Function): CancelablePromise<T> {
			var promise: any = Promise.prototype.then.call(this, resolve, reject);
			CancelablePromise.extends(promise);
			return promise;
		}
		public catch: (callback: Function) => CancelablePromise<T>;
		public done: () => CancelablePromise<T>;
		public fail: (callback: Function) => CancelablePromise<T>;
		public always: (callback: Function) => CancelablePromise<T>;
	}
}
