///<lib="jquery"/>
///<module="performance"/>
///<module="debug"/>
namespace ghost.browser.helpers
{
    export class MaxCharactersHelper
    {
        private static listeners:IListener[] = [];
        public static listen(root:any = document):void
        {
            var listener:IListener =
            {
                element:root,
                listener:function()
                {
                    var $element:JQuery = $(this);
                    var $counter:JQuery = $(this).siblings(".counter");
                    var max:number = parseInt($counter.attr("data-max"), 10);
                    if(!isNaN(max))
                    {
                        var count:number = max - $element.val().length;
                        if(count<0)
                        {
                            if($element.hasClass("force"))
                            {
                                $element.val($element.val().substring(0, max));
                                count = 0;
                            }else
                            {
                                $element.parent().addClass("counter_error");
                            }
                        }else
                        {
                            $element.parent().removeClass("counter_error");
                        }
                        $counter.text(""+count);
                    }
                }
            };
            MaxCharactersHelper.listeners.push(listener);
            $(listener.element).on("keyup", ".max-characters", listener.listener);
            $(listener.element).on("domChanged", ".max-characters", listener.listener);
        }
        public static unlisten(root:any = document):void
        {
            for(var i:number=MaxCharactersHelper.listeners.length-1; i>-1; i--)
            {
                if(MaxCharactersHelper.listeners[i].element === root)
                {
                    $(MaxCharactersHelper.listeners[i].element).off("keyup", ".max-characters", MaxCharactersHelper.listeners[i].listener);
                    $(MaxCharactersHelper.listeners[i].element).off("domChanged", ".max-characters", MaxCharactersHelper.listeners[i].listener);
                    MaxCharactersHelper.listeners.splice(i, 1);
                }
            }
        }
    }
    interface IListener
    {
        element:any;
        listener:any;
    }
}
