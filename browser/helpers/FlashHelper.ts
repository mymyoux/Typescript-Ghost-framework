///<lib="jquery"/>
namespace ghost.browser.helpers
{
    export class FlashHelper
    {
        public static listen():void
        {
            $(document).on("click", ".flash-messages li", function()
            {
               $(this).remove();
            });
        }
    }
}
