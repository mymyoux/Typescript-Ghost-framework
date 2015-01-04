module ghost.browser.revelation.controllers
{
	export class TestController extends ghost.browser.revelation.Controller
	{
		constructor()
		{
			super();
		}
		public getApplicationName():string
		{
			return "Facebook";
		}
	}
}