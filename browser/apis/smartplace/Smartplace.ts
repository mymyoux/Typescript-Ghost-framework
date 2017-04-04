//convert
 /*>ghost.browser.io.ajax(*/
import {ajax} from "browser/io/Ajax";
///<module="io"/>

    export class Smartplace
    {
        private static BASE_URL:string = "https://cloud.smartplace.pro/api_call/"
        public getContacts():Promise<any>
        {
            return <any>ajax(Smartplace.BASE_URL+"contact/contacts/");
        }
    }
