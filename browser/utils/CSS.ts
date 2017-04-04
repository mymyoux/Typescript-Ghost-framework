//convert
 /*	ghost.core.Root.*/
import {Root} from "ghost/core/Root";
///<module="ghost/core"/>


	export class CSS
	{
		public static clickScript():void
		{
			Root.getRoot().$(function()
			{
				Root.getRoot().$(document).on("click",".clicable,.clickable",function()
				{
					Root.getRoot().$(this).addClass("click");
				});
				Root.getRoot().$(document).on("mousedown",".clicable,.clickable",function()
				{
					Root.getRoot().$(this).addClass("mousedown");
				});
				Root.getRoot().$(document).on("mouseup",".clicable,.clickable",function()
				{
					Root.getRoot().$(this).removeClass("mousedown");
				});
			});
		}
	}
