///<file="Server"/>
///<file="User"/>
///<module="sgamecommon"/>
namespace ghost.sgame
{
    import Const = ghost.sgamecommon.Const;
    import IApplicationMessage = ghost.sgamecommon.IApplicationMessage;
    export class Application
    {
        /**
         * Server
         */
        private server:Server;
        private users:User[];
        private users_ids:string[];
        protected name:string;

        public constructor(name:string, server:Server)
        {
            this.name = name;
            this.server = server;
            this.users = [];
            this.users_ids = [];
            this.bindEvents();
        }
        public bindEvents()
        {
            console.log("listen "+Const.MSG_APPLICATION+":"+this.name);
            this.server.on(Server.EVENT_DESTROYED, this.destroy.bind(this));
            this.server.on(Const.MSG_APPLICATION+":"+this.name, this._onData.bind(this))
            this.server.on(Const.MSG_APPLICATION_IN+":"+this.name, this._onEnter.bind(this))
            this.server.on(Const.MSG_APPLICATION_OUT+":"+this.name, this._onExit.bind(this))
        }
        public listen(port:number):void
        {
            this.server.listen(port);
        }
        public destroy():void
        {
            this.server = null;
        }
        public writeOne(user:User, command:string, data:any):void
        {
            user.socket.write(Const.MSG_APPLICATION, {command:command, app:this.name, data:data});
        }
        private dispatchOne(user:User, application:string, command:string, data:any):void
        {
            user.socket.write(Const.MSG_APPLICATION, {command:command, app:application, data:data});
        }
        private _onExit(data:IApplicationMessage, user:User):void
        {
            console.log("exit-["+this.name+"] ",data);
        }
        protected _onEnter(data:IApplicationMessage, user:User, callback:ICallback):void
        {

            if(user.isAllowed(this.name))
            {
                console.log("enter-["+this.name+"] ",data);
                callback.execute(true);
                this._addUser(user);
            }else
            {

              this._rejectUser(user, callback);
            }
        }
        protected _rejectUser(user:User, callback:ICallback = null):void
        {
            if(callback)
            {
                callback.execute(false, {
                    app:Const.LOGIN_APP,
                    command:Const.LOGIN_COMMAND,
                    error:"need_login"
                });
                //this.dispatchOne(user, Const.LOGIN_APP, Const.LOGIN_COMMAND, {});
            }else
            {
                this.writeOne(user, "login", {});
            }
        }
        private _onData(data:IApplicationMessage, user:User, icallback:ICallback):void
        {
            if(!user.hasApp(this.name))
            {
                console.warn("user is not in app : "+this.name);
                return;
            }
            //SI user pas existant ignorer
            console.log("data-["+this.name+"] ",data);
            var name:string = data.command+"Action";
            if(this[name] && typeof this[name] == "function")
            {
                this[name](data.data, user, icallback);
            }else
            {
                console.warn(name+" doesn't exist");
            }
        }
        private _addUser(user:User):void
        {
            user.addApp(this.name);
            if(this.users_ids.indexOf(user.id)!=-1)
            {
                console.warn("["+user.id+"] "+user.login+" already exists");
            }
            this.users.push(user);
            this.users_ids.push(user.id);
        }
        private _removeUser(user:User):void
        {
            var index:number = this.users.indexOf(user);
            if(index != -1)
            {
                this.users_ids.splice(index, 1);
                this.users.splice(index, 1);
            }
        }
    }



}