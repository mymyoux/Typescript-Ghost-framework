namespace ghost.browser.mvc
{

	export interface IPartRequest {
		method?: string;
		url?: string;
		data?: any;
        /**
         * If set to false, it will replay the ajax request each times. default:true
         */
		cache?: boolean;
        /**
         * If set to true, it will erase data each times the part is requested. default:false
         */
		reset?: boolean;

	}
}
