namespace ghost.sgamecommon
{
    export interface IApplicationMessage
    {
        app:string;
        command:string;
        data?:any;
    }
}