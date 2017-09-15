export interface IAPIOptions
{
    url?:string;
    token?: string; 
    id_user?: number; 
    cache?: string; 
    jsonp?: boolean;
    asObject?:boolean;
    // request retry number|boolean : nb retry max|infinite retry
    retry?: any;
    // reexecute the request on next session
    reexecute?:boolean;
    // how many session max to retry the request
    reexecute_session?:number;
}
