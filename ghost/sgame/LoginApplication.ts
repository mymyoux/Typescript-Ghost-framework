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
            setTimeout(()=>
            {
                user.addRight("app");
                user.login = "mymyoux"+Maths.randBetween(0, 100);
                user.id = this.generateTokenFromData(Maths.randBetween(0, 100));
                icallback.success({id:user.id, login:user.login});
            }, 0);
        }
        protected _onEnter(data:IApplicationMessage, user:User, callback:ICallback):void
        {
            user.addApp(this.name);
            callback.success();
        }
        /**
         * Generate an unique id from a non unique resource
         * @param  {any}    data non unique vlaue
         * @return {string}      Unique id for an user id
         */
        protected generateTokenFromData(data:any):string
        {
            return data + ":" + ghost.utils.Strings.getUniqueToken(60);
        }
        /**
         * Checks if the current user is already connected
         * @param  {string}  id user id
         * @return {boolean}    true or false
         */
        protected hasUser(id:string):boolean
        {
            return this.server.hasUser(id);
        }
    }


}
