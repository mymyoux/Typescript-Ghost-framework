///<file="Model.ts"/>
///<module="api"/>
namespace ghost.mvc
{
	import API = ghost.browser.api.APIExtended;
    import APIExtended = ghost.browser.api.APIExtended;
	export class ModelAPI extends Model
	{
		private requests: any;
		
		public constructor() {
            super();
            this.requests = {};
            
        }
		public cache(): ghost.browser.data.LocalForage {
            return ghost.forage.war(this.name() + '_model');
        }
        protected onPartData(name: string, data: any): void {
            if (name == Model.PART_DEFAULT)
                this.readExternal(data);
        }
        protected _getRequest(part?: string, params?: any): APIExtended {
            if (typeof part !== "string") {
                part = Model.PART_DEFAULT;
            }

            if (!this.requests[part]) {
                this.requests[part] = this.getRequest(part, params);
                this.requests[part].on(API.EVENT_DATA_FORMATTED, this.onPartData.bind(this, part));
            }

            return this.requests[part];
        }
        protected getAPIData(part?: string): any {
            var api: APIExtended = this._getRequest(part);
            if (api) {
                return api.getAPIData();
            }
            return null;
        }

        public clear(): void//:Promise<any>
        {
			this._changed = [];
            this.firstData = true;
            this.requests = {};
        }
		public first(): Promise<any> {
            var promise: Promise<any> = new Promise((resolve: any, reject: any): void=> {
                if (!this.firstData) {
                    return resolve();
                }
                this.once(ghost.mvc.Model.EVENT_FIRST_DATA, () => {
					resolve();
                });
            });
            return promise;
        }
        protected controller():string
        {
			return this.name();
        }
		public request(name: string): APIExtended {
            return API.request().name("models_" + this.controller() + "_" + this.name() + "_" + name);
        }
		protected hasPart(name: string, params: any = null): boolean {
            return this._partsPromises[name]  || this.getRequest(name, params) != null;//name == "default";
        }
		protected getPartPromise(name: string, params: any = null): Promise<any> | boolean {
            if (!this.hasPart(name, params)) {
                return null;
            }
            if (!this._partsPromises[name]) {
                var request: APIExtended = this._getRequest(name, params); //this.getRequest(name, params);



				//  this.requests[name] = request;

                this._partsPromises[name] = new Promise<any>((accept, reject) => {
                    var _self: any = this;
                    request
                        .then(function() {
                            _self._partsPromises[name] = true;
                            accept.call(null, { data: Array.prototype.slice.call(arguments), read: false });

                        }, reject);
                });
            }
            return this._partsPromises[name];
        }
        public retrieveData(data: string[] = [Model.PART_DEFAULT], params: any = null): Promise<any> {
            if (!data) {
                data = [Model.PART_DEFAULT];
            }
            var _this: Model = this;
            var promise: Promise<any> = new Promise<any>(function(accept: any, reject: any): void {

                var failed: boolean = false;
                var promises: Promise<any>[] = data.map(function(name: string) {
                    if (this.hasPart(name, params)) {
                        return this.getPartPromise(name, params);
                    } else {
                        //reject Promise
                        failed = true;
                        reject(new Error(name + " is not a correct part's name"));
                        return null;
                    }
                }, _this);
                if (failed) {
                    return;
                }
				Promise.all(promises).then(function(values: any[]) {
                    //TODO:weird le data.read devrait être dans le filter ?
                    values.filter(function(data: any): boolean { return data !== true && !data.read ? true : false; }).map(function(data: any) {
                        data.read = true;
                        return data.data[0];
					})//.forEach(this.readExternal, _this);
                    accept();
                }.bind(_this), reject);
            });
            return promise;
        }
		protected getRequestInstance(part?: string, params?: any): APIExtended {
			return this._getRequest(part, params); 
        }
		protected getRequest(name: string, params: any = null): APIExtended {
			throw new Error("You need to override #getRequest()");
            switch (name) {
                case Model.PART_DEFAULT:
                    break;
            }
            return null;
        }
	}
}
