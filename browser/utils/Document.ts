namespace ghost.browser.utils
{
	export class Document
	{
		public static getSelectedText():string
		{
			var text = "";
			try
			{
				if (window.getSelection) {
					text = window.getSelection().toString();
				} else if ((<any>document).selection && (<any>document).selection.type != "Control") {
					text = (<any>document).selection.createRange().text;
				}
				
			}catch(error)
			{
				
			}
			return text;
		}
	}
}
