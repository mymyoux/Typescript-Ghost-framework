module ghost.browser.revelation.applications
{
	export class FacebookApplication extends ghost.browser.revelation.Application
	{
		constructor(client:ghost.browser.revelation.Client)
		{
			super("Facebook", client);
		}
		public getLoginHelper():LoginHelper
		{
			if(this._loginHelper)
			{
				return this._loginHelper;
			}
			return new ghost.browser.revelation.logins.FacebookHelper();
		}
	}
}