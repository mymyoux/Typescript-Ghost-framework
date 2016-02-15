///<lib="jquery"/>
///<module="performance"/>
///<module="debug"/>
namespace ghost.browser.helpers
{
    export class CustomSelectHelper
    {
        public static listen():void
        {
            var listener:any;
            var target:any;
            /**
             * Click on li
             */
            $(document).on("click", ".custom-select li", function(event)
            {
                var $li = $(event.currentTarget);

                var $ul = $li.parent();
                if(!$ul.hasClass("selected"))
                {
                    return;
                }
                var $parent:JQuery = $li.parents(".custom-select");
                var $value:JQuery = $parent.find("data-value");
                var $p = $value.length?$value:$ul.children("p");
                //$p.text($li.text());
                if($ul.attr("data-static")===undefined)
                {

                    $p.html($li.html());
                }
                $p.attr("value", $li.attr("value"));
                if($ul.attr("data-multiple")===undefined)
                {
                    $ul.removeClass("selected mousedown");
                    if(listener)
                    {
                        $(document).off("click", "*", listener);
                        listener = null;
                        target = null;
                    }
                }
                $(this).trigger("change", $li.attr("value"));
                event.preventDefault();
                event.stopImmediatePropagation();
                return false;
            });
            /**
             * Click outside
             */
            $(document).on("click", ".custom-select", function(event)
            {
                var $element = $(event.currentTarget);
                var $ul = $element.find("ul");

                if(listener && target !== event.currentTarget)
                {
                    console.log("remove listener");
                    $(target).find("ul").removeClass("selected mousedown");
                    $(document).off("click", "*", listener);
                    listener = null;
                    target = null;
                }else
                {
                 ///   debugger;
                }
                if(!listener)
                {
                    console.log("add listener");
                    target = event.currentTarget;
                    listener =  function(e)
                    {
                        if(e.already_done)
                        {
                            return;
                        }
                        e.already_done = true;
                        if(!(e.target === event.currentTarget || ($ul.find(e.target).length && $ul.find("li").find(e.target).addBack("li").length)))
                        {
                            console.log("clicoutside")
                            $ul.removeClass("selected mousedown");
                            $(document).off("click", "*", listener);
                            listener = null;
                            target = null;
                            if($ul.find(e.target).length)
                                return false;
                            //e.preventDefault();
                        }
                    };
                    $(document).on("click", "*", listener);
                }
            });


        }
    }
}
