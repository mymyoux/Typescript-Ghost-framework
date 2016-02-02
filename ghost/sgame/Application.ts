///<file="Server"/>
///<file="User"/>
///<file="Room"/>
///<file="RoomManager"/>
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
        protected roomManager:RoomManager; 
        private users:User[];
        private users_ids:string[];
        protected name:string;

        public constructor(name:string, server:Server)
        {
            this.name = name;
            this.server = server;
            this.users = [];
            this.users_ids = [];
            this.roomManager = new RoomManager();
            this.bindEvents();
        }
        public bindEvents()
        {
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
            console.log("["+this.name+"] exit : "+user.login,data);
        }
        protected _onEnter(data:IApplicationMessage, user:User, callback:ICallback):void
        {
            console.log("["+this.name+"] enter : "+user.login);
            if(user.isAllowed(this.name))
            {
                callback.success();
                this._addUser(user);
            }else
            {

              this._rejectUser(user, callback);
            }
        }
        protected _rejectUser(user:User, callback:ICallback = null):void
        {
            console.log("["+this.name+"] reject : "+user.login);
            if(callback)
            {
                callback.error(Const.ERROR_NEED_LOGIN, {
                    app:Const.LOGIN_APP,
                    command:Const.LOGIN_COMMAND
                });
                //this.dispatchOne(user, Const.LOGIN_APP, Const.LOGIN_COMMAND, {});
            }else
            {
                this.writeOne(user, "login", {});
            }
        }

        private _onEnterRoom(room:{name:string, visibility:string, password:string}, user:User, icallback:ICallback):void
        {
            console.log("["+this.name+"] room enter : "+user.login, room);

            if(!room || !room.name)
            {
                icallback.error(Const.ERROR_BAD_FORMAT);
            }else
            {
                var success: boolean = this.isAllowedInRoom(room, user);
                if(success)
                    success = this.roomManager.addUserToRoom(room.name, room.visibility, room.password, user);
                var currentRoom:Room = this.roomManager.getRoom(room.name);
                if(success)
                {
                    icallback.success(currentRoom.getUsersInformation());
                }else
                {
                    icallback.error(Const.ERROR_ROOM_ENTER_FAILED);
                }
                if(!success) {
                    return;
                }
                var users:User[] = currentRoom.getUsers();
                console.log("["+this.name+"] room users : "+user.login, currentRoom.getUsersInformation());
                if(!users)
                {
                    return;
                }
                for(var p in users)
                {
                    this.writeOne(users[p], Const.ROOM_COMMAND_USER_ENTER,  {room:room.name, data:{id:user.id,login:user.login}});
                }
                this.onEnterRoom(room, user);
            }
        }
        private _onLeaveRoom(room:string, user:User, icallback:ICallback):void
        {
            console.log("["+this.name+"] rooom leave : "+user.login, room);
            this.onLeaveRoom(<any>this.roomManager.getRoom(room), user);
            this.roomManager.removeUserFromRoom(room, user);
        }
        private _onDataRoom(roomname:string, command:string, data:IApplicationMessage, user:User, id_recipient:string, icallback:ICallback):void
        {
            console.log(">"+roomname+" ["+this.name+"] data : "+user.login, data);
            var room:Room = this.roomManager.getRoom(roomname);
            if(!room || !room.hasUser(user))
            {
                return icallback.error(Const.ERROR_ROOM_NEED_ENTER, {room:roomname});
            }
            if(id_recipient && !room.hasUser(id_recipient))
            {
                return icallback.error(Const.ERROR_ROOM_RECIPIENT_UNKNOWN, {room:roomname, user:id_recipient});
            }
            icallback.success();
            var users:User[] = room.getUsers();
            if(!users)
            {
                return;
            }
            //one recipient
            if(id_recipient)
            {
                var recipient:User = room.getUser(id_recipient);
                console.log("WRITE ALONE MESSAGE TO "+recipient.login, {command:Const.ROOM_COMMAND_USER_MESSAGE, room:room.name, sender:user.id, data:data});
                this.writeOne(recipient, Const.MSG_APPLICATION, {command:Const.ROOM_COMMAND_USER_MESSAGE, room:room.name, sender:user.id, data:{command:command, data:data}});
            }else
            for(var p in users)
            {
                //all
                if(users[p] != user)
                {
                    console.log("WRITE MESSAGE TO "+users[p].login, {command:Const.ROOM_COMMAND_USER_MESSAGE, room:room.name, sender:user.id, data:data});
                    this.writeOne(users[p], Const.MSG_APPLICATION, {command:Const.ROOM_COMMAND_USER_MESSAGE, room:room.name, sender:user.id, data:{command:command, data:data}});
                }
            }
        }
        private _onData(data:IApplicationMessage & {room:string, user:string}, user:User, icallback:ICallback):void
        {
            if(!data)
            {
                icallback.error(Const.ERROR_BAD_FORMAT, {app:this.name});
                return;
            }
            console.log("["+this.name+"] data : "+user.login, data);
            if(!user.hasApp(this.name))
            {
                console.warn("user is not in app : "+this.name);
                if(!user.isAllowed(this.name))
                {
                    icallback.error(Const.ERROR_NEED_LOGIN, {app:this.name});
                }else
                {
                    icallback.error(Const.ERROR_NEED_APPLICATION_ENTER, {app:this.name});
                }
                return;
            }
            //SI user pas existant ignorer
            var name:string = data.command+"Action";
            if(data.command == Const.APPLICATION_COMMAND_ENTER_ROOM)
            {
                this._onEnterRoom(data.data, user, icallback);
            }
            else
            if(data.command == Const.APPLICATION_COMMAND_LEAVE_ROOM)
            {
                this._onLeaveRoom(data.data, user, icallback);
            }
            else
            {
                if(data.room)
                {
                    return this._onDataRoom(data.room, data.command, data.data, user, data.user, icallback);
                }
                if(this[name] && typeof this[name] == "function")
                {
                    this[name](data.data, user, icallback);
                }else
                {
                    console.warn(name+" doesn't exist");
                }
            }
        }
        private _addUser(user:User):void
        {
            console.log("["+this.name+"] add : "+user.login);
            user.addApp(this.name);
            if(this.users_ids.indexOf(user.id)!=-1)
            {
                console.warn(this.name+"["+user.id+"] "+user.login+" already exists");
            }
            this.users.push(user);
            this.users_ids.push(user.id);
            this.onEnter(user);
        }
        private _removeUser(user:User):void
        {
            console.log("["+this.name+"] remove : "+user.login);
            var index:number = this.users.indexOf(user);
            if(index != -1)
            {
                this.users_ids.splice(index, 1);
                this.users.splice(index, 1);
                this.onLeave(user);
            }
        }

        //to override
        protected onEnter(user:User):void
        {

        }
        protected onLeave(user: User): void {

        }
        protected isAllowedInRoom(room: { name: string, visibility?: string, password?: string }, user: User): boolean {
            return true;
        }
        protected onEnterRoom(room: { name: string, visibility?: string, password?: string }, user: User): void {

        }
        protected onLeaveRoom(room: Room, user: User): void {

        }
    }



}
