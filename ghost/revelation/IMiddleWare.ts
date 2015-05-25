module ghost.revelation
{
    export interface IMiddleWare
    {
        path:string;
        setOptions(data:any):void;
        setApplication(application:Application);
    }
}