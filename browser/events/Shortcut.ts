//convert
 /* ghost.events.Eventer.*/
import {Eventer} from "ghost/events/Eventer";
///<module="ghost/events"/>
  

    export function ready(callback:Function):void
    {
        
        Eventer.once(Eventer.APPLICATION_READY, callback);
    }
    export function $ready(callback:Function):void
    {

        Eventer.once(Eventer.$APPLICATION_READY, callback);
    }
