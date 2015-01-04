///<module="ghost/events"/>
module ghost
{  

    export function ready(callback:Function):void
    {
        
        ghost.events.Eventer.once(ghost.events.Eventer.APPLICATION_READY, callback);
    }
    export function $ready(callback:Function):void
    {

        ghost.events.Eventer.once(ghost.events.Eventer.$APPLICATION_READY, callback);
    }
}