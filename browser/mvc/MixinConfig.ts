namespace ghost.browser.mvc
{

	export class MixinConfig {
		public mixin: any;
		public config: any;
		public constructor(mixin: any, config: any = null) {
			this.mixin = mixin;
			this.config = config;
		}
	}
}
