//convert
 /* ghost.performance.Performance.*/
import {Performance} from "browser/performance/Performance";

///<module="performance"/>
///<module="debug"/>

    export class FastClickHelper
    {
        public static listen():void
        {
            //log.hide();
            //log.info("fast-click enabled");
            Performance.fastclick();
        }
    }
