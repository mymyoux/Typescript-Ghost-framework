//missing
import {Application} from "ghost/revelation/Application";



    export interface IMiddleWare
    {
        path:string;
        setOptions(data:any):void;
        setApplication(application:Application):boolean|Promise<any>;
    }
