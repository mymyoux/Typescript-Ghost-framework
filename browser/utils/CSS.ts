///<module="ghost/core"/>
///<lib="jquery"/>
namespace ghost.utils
{
	export class CSS
	{
		public static clickScript():void
		{
			ghost.core.Root.getRoot().$(function()
			{
				ghost.core.Root.getRoot().$(document).on("click",".clicable,.clickable",function()
				{
					ghost.core.Root.getRoot().$(this).addClass("click");
				});
				ghost.core.Root.getRoot().$(document).on("mousedown",".clicable,.clickable",function()
				{
					ghost.core.Root.getRoot().$(this).addClass("mousedown");
				});
				ghost.core.Root.getRoot().$(document).on("mouseup",".clicable,.clickable",function()
				{
					ghost.core.Root.getRoot().$(this).removeClass("mousedown");
				});
			});
		}
	}
}
