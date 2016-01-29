///<file="Application"/>
///<module="sgamecommon"/>
namespace ghost.sgame
{
    import Const = ghost.sgamecommon.Const;
    import IApplicationData = ghost.sgamecommon.IApplicationData;
    import IApplicationMessage = ghost.sgamecommon.IApplicationMessage;
    import Maths = ghost.utils.Maths;
    export class LoginApplication extends Application
    {
        public constructor(server:Server)
        {
            super(Const.LOGIN_APP, server);
        }
        public loginAction(data:any, user:User, icallback:ICallback):void
        {
            if(icallback)
            {
                icallback.handled = true;
            }
            console.log("loginAction");
            setTimeout(function()
            {
                console.log("ok");
                user.addRight("app");
                user.login = "mymyoux"+Maths.randBetween(0, 100);
                user.id = "couceouceokoekte"+Maths.randBetween(0, 100);
                icallback.success({id:user.id, login:user.login});
            }, 0);
        }
        protected _onEnter(data:IApplicationMessage, user:User, callback:ICallback):void
        {
            user.addApp(this.name);
            callback.success();
        }
    }


}
