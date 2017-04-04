


    
    export class LinkHelper 
    {
        public static listen():void
        {
            $(document).on("mousedown", ".click", function(event)
            {
                $(this).addClass("mousedown");

            });
            $(document).on("mouseup", ".click", function(event)
            {
                $(this).removeClass("mousedown");
            });
            $(document).on("click", ".click", function(event)
            {
                $(this).siblings().removeClass("selected");
                $(this).addClass("selected");
                // add selected for all click children
                $(this).children('.click').addClass("selected");
            });
      $(document).on("click", ".link-inside", function(event, originalEvent = null)
            { 
              if(originalEvent)
              {
                  //already triggered
                  return;
              }
                //debugger;
               var $a:JQuery = $(this).find("a");
               event.stopPropagation();
                if($a.length>1)
                {
                    var len:number = $a.length;
                    for(var i = 0;i<len; i++)
                    {
                        if($a.eq(i).parents(".link-inside").get(0) === event.currentTarget)
                        {0
                            $a = $a.eq(i);
                            break;
                        }
                    }
                    if($a.length>1)
                    {
                        $a = $a.eq(0);
                    }
                }
               if($a.attr("href"))
               {
                   if ($a.attr("target") || event.metaKey || event.ctrlKey)
                   {
                       window.open($a.attr("href"), $a.attr("target"));
                   }else
                   {
                       $a.trigger("click", event.originalEvent);
                   }
               }
            });
        }
    }
