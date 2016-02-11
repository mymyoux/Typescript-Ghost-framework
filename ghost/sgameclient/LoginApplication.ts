///<file="Application"/>
///<module="sgamecommon"/>
namespace ghost.sgameclient
{
    import Const = ghost.sgamecommon.Const;
    import IApplicationData = ghost.sgamecommon.IApplicationData;
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
        protected writeNext(): void
        protected writeNext(data?: any): void
        { 
            debugger;
            if(data)
            {
                debugger;
            }
            super.writeNext();
        }
        public write(command: string, data: any, callback: Function = null): void {
            debugger;
            super.write(command, data, callback);
        }
        public writeRoom(room: Room, command: string, data: any, callback: Function = null): void {
            debugger;
            super.writeRoom(room, command, data, callback);
        }
        public writeRoomUser(room: Room, user: IUser, command: string, data: any, callback: Function = null): void {
            debugger;
            super.writeRoomUser(room, user, command, data, callback);
        }
    }
}
