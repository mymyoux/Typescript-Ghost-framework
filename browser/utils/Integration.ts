//convert
 /*	ghost.core.Root.*/
import {Root} from "ghost/core/Root";

	export class Integration
	{
		public static loadPages(pages:string[], selector:string, $container:JQuery):void
		{
			if(pages.length == 0)	
			{
				return;
			}
			var page:string = pages.shift();
			if(page.indexOf(".")==-1)
			{
				page+=".html";
			}/*
			var $div = $("<div></div>");
			$div.load( page+" "+selector, function( response, status, xhr ) {
			  if ( status == "error" ) {
			    var msg = "Sorry but there was an error: ";
			    console.error( msg + xhr.status + " " + xhr.statusText );
			  }else
			  {
			  	console.log("ok good");
			  	console.log(response);
			  }
			});
			$div.children().append("page2");
			console.log($div.html());
			$container.append($div.children());
			Integration.loadPages(pages, selector, $container);
			return;*/
			Root.getRoot().$.ajax(page,{async:false})
			  .done(function(data) {
			  		try
			  		{
			  			var $page:JQuery = Root.getRoot().$(data);
			  			
		  			}catch(error)
		  			{
						throw new Error("Page : "+page+" can't be parsed");  				
		  			}
		  			var $selector:JQuery = $page.filter(selector);
		  			if($selector.length == 0)
		  			{
		  				$selector = $page.find(selector);
		  			}
		  			if($selector.length == 0)
		  			{
		  				throw new Error("Page : "+page+" doesn't have selector : "+selector);  				
		  			}
		  			$selector.addClass("page2");
		  			$container.append($selector);
		  			Integration.loadPages(pages, selector, $container);
			    	
			  })
			  .fail(function() {
			    throw new Error("Page : "+page+" doesn't exist");

			  })
			  .always(function() {
			    
			  });
		}
	}
