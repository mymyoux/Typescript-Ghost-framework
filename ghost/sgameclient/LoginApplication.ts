///<file="Application"/>
///<module="sgamecommon"/>
namespace ghost.sgameclient
{
    import Const = ghost.sgamecommon.Const;
    import IApplicationData = ghost.sgamecommon.IApplicationData;
    export class LoginApplication extends Application
    {
        protected user:IUser;
        public constructor(client:Client, user:IUser)
        {
            super(Const.LOGIN_APP, client)
            this.user = user;
        }
        public loginAction(data:any):void
        {
            if(!this.user || !this.user.token)
            {
                console.warn("user doesn't have token", this.user);
                return;
            }
            this.write(Const.LOGIN_COMMAND, {token:this.user.token}, (success:boolean, error:any = null)=>
            {
                if(success)
                {
                    console.log("login success");
                    this.writeInternalData(Const.ALL_APP, Const.LOGIN_COMMAND, success);
                }else
                {
                    console.warn("LOGIN FAILED", error);
                }
            });
        }
        public loginInternal(data:any):void
        {
            this.loginAction(data);
        }


    }
}