///<module="ghost/core"/>
///<lib="jquery"/>
namespace ghost.utils
{
	export class CSS
	{
		public static clickScript():void
		{
			ROOT.$(function()
			{
				ROOT.$(document).on("click",".clicable,.clickable",function()
				{
					ROOT.$(this).addClass("click");
				});
				ROOT.$(document).on("mousedown",".clicable,.clickable",function()
				{
					ROOT.$(this).addClass("mousedown");
				});
				ROOT.$(document).on("mouseup",".clicable,.clickable",function()
				{
					ROOT.$(this).removeClass("mousedown");
				});
			});
		}
	}
}