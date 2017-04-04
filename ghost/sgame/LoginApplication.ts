//missing
import {ICallback} from "ghost/sgame/ICallback";
//missing
import {User} from "ghost/sgame/User";
//missing
import {Server} from "ghost/sgame/Server";
//convert
 /* ghost.utils.Strings.*/
import {Strings} from "ghost/utils/Strings";
//convert-files
import {Application} from "./Application";
///<module="sgamecommon"/>

    //convert-import
import {Const} from "ghost/sgamecommon/Const";
    //convert-import
import {IApplicationData} from "ghost/sgamecommon/IApplicationData";
    //convert-import
import {IApplicationMessage} from "ghost/sgamecommon/IApplicationMessage";
    //convert-import
import {Maths} from "ghost/utils/Maths";
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
            return data + ":" + Strings.getUniqueToken(60);
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


