///<lib="jquery"/>
namespace ghost.browser.helpers
{
    export class MissingPictureHelper
    {
        public static listen():void
        {
           window["ppicture"] = MissingPictureHelper.displayDefaultPicture;
        }
        public static displayDefaultPicture(img:any, type:number = 1):void
        {
            switch(type)
            {
                case 1:
                default:
                $(img).attr("src", "css/img/default-avatar.svg");
            }
        }
    }
}
