///<lib="jquery"/>
///<module="performance"/>
///<module="debug"/>
namespace ghost.browser.helpers
{
    export class FastClickHelper
    {
        public static listen():void
        {
            log.hide();
            log.info("fast-click enabled");
            ghost.performance.Performance.fastclick();
        }
    }
}
