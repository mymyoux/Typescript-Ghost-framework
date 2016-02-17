///<module="io"/>
namespace ghost.browser.apis.smartplace
{
    export class Smartplace
    {
        private static BASE_URL:string = "https://cloud.smartplace.pro/api_call/"
        public getContacts():Promise<any>
        {
            return <any>ghost.io.ajax(Smartplace.BASE_URL+"contact/contacts/");
        }
    }
}
