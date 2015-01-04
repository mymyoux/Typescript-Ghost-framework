///<module="browser/apis"/>
module ghost.browser.revelation.logins
{
	export class FacebookHelper extends ghost.browser.revelation.LoginHelper
	{
		constructor()
		{
			super();
		}
		public login(callback:(data:any)=>void)
		{
			console.log("LOGIN data to give");
			console.log(ghost.browser);
			ghost.browser.apis.Facebook.ready({
                    appId: "652505044790654",
                    status     : true,
                    xfbml      : false,
                    permissions:[ghost.browser.apis.Facebook.PERMISSIONS.EMAIL, ghost.browser.apis.Facebook.PERMISSIONS.USER.LIKES]
                },function(success:boolean, data:any)
				{
					if(success)
					{
						callback(data.authResponse);
					}else
					{
						//todo !
					}

				});
		}
	}
}