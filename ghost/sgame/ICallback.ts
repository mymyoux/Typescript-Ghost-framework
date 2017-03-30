
namespace ghost.sgame
{
   
    export interface ICallback
    {
        called:boolean;
        handled:boolean;
        success:Function;
        error:Function;
    }

}
