///<module="io"/>
module ghost.browser.apis.smartplace
{
    export class Smartplace
    {
        private static BASE_URL:string = "https://cloud.smartplace.pro/api_call/"
        public getContacts():Promise<any>
        {
            return ghost.io.ajax(Smartplace.BASE_URL+"contact/contacts/");
        }
    }
}