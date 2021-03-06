//missing
import {Client} from "ghost/sgameclient/Client";
//missing
import {IUser} from "ghost/sgameclient/IUser";

//convert-files
import {Application} from "./Application";
///<module="sgamecommon"/>

    //convert-import
import {Const} from "ghost/sgamecommon/Const";
    //convert-import
import {IApplicationData} from "ghost/sgamecommon/IApplicationData";
    export class LoginApplication extends Application
    {
        public user:IUser;
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
            this.write(Const.LOGIN_COMMAND, {token:this.user.token}, (success:boolean, data:any = null)=>
            {
                if(success)
                {
                    if(data.id)
                        this.user.id = data.id;
                    if(data.login)
                        this.user.login = data.login;
                    this.writeInternalData(Const.ALL_APP, Const.LOGIN_COMMAND, success);
                    this.user["write"] = this.write.bind(this, Const.USER_CUSTOM_VAR);
                }else
                {
                    console.warn("LOGIN FAILED", data); 
                }
            });
        }
        public loginInternal(data:any):void
        {
            this.loginAction(data);
        }
    }
