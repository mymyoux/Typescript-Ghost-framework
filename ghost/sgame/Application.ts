///<file="Server"/>
///<file="User"/>
///<file="Room"/>
///<file="RoomManager"/>
///<module="sgamecommon"/>
namespace ghost.sgame
{
    import Const = ghost.sgamecommon.Const;
    import IApplicationMessage = ghost.sgamecommon.IApplicationMessage;
    import log = ghost.logging.log;
    export class Application
    {
        /**
         * Server
         */
        protected server:Server;
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
            this.roomManager = new RoomManager(this.name);
            this.bindEvents();

            this.server.addApp(this);
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
            if(this.server)
            {
                this.server.removeApp(this);
                this.server = null;
            }
        }
        public writeOne(user:User, command:string, data:any):void
        {
            user.write(Const.MSG_APPLICATION, {command:command, app:this.name, data:data});
        }
        public writeRoomOne(user: User, room:Room, command: string, data: any)
        {
            this.writeOne(user, Const.MSG_APPLICATION, { command: Const.ROOM_COMMAND_USER_MESSAGE, room: room.name, data: { command: command, data: data } });
        }
        private dispatchOne(user:User, application:string, command:string, data:any):void
        {
            user.write(Const.MSG_APPLICATION, {command:command, app:application, data:data});
        }
        private _onExit(data:IApplicationMessage, user:User):void
        {
        }
        protected _onEnter(data:IApplicationMessage, user:User, callback:ICallback):void
        {
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
            this.onLeaveRoom(<any>this.roomManager.getRoom(room), user);
            this.roomManager.removeUserFromRoom(room, user);
        }
        protected onCustomDataRoom(room:Room, user:User, data:any):void
        {
            log.info("> " + room.name + " Custom data:" + user.login, data);
            user.onSetCustomData(room, data);
        }
        protected onCustomRoomCommand(room: Room, user: User, data: any, id_recipient: string, icallback: ICallback): void {
            
            if(data.method && this["onRoom"+data.method])
            {

                this["onRoom" + data.method](room, user, data.data, id_recipient);
                icallback.success();
            }else 
            {
                log.warn("on custom room command doesn't exist :" + data.method);
                icallback.error(Const.ERROR_ROOM_COMMAND_CUSTOM_METHOD, { room: room.name });
            }
        }
        private _onDataRoom(roomname:string, command:string, data:IApplicationMessage, user:User, id_recipient:string, icallback:ICallback):void
        {
            log.info(">" + roomname + " [" + this.name + "] data["+command+"]>"+id_recipient+"< : " + user.login, data);
            var room:Room = this.roomManager.getRoom(roomname);
            if(!room || !room.hasUser(user))
            {
                return icallback.error(Const.ERROR_ROOM_NEED_ENTER, {room:roomname});
            }
            if(id_recipient && !room.hasUser(id_recipient))
            {
             
                return icallback.error(Const.ERROR_ROOM_RECIPIENT_UNKNOWN, {room:roomname, user:id_recipient});
            }
     
        
            if (command == Const.ROOM_COMMAND_CUSTOM_METHOD) {
                return this.onCustomRoomCommand(room, user, data, id_recipient, icallback);
            }
            icallback.success();
            //custom data
            if (command == Const.ROOM_COMMAND_USER_DATA)
            {
                this.onCustomDataRoom(room, user, data);
                return;
            }

            var users:User[] = room.getUsers();
            if(!users)
            {
                return;
            }
            //one recipient
            if(id_recipient)
            {
                var recipient:User = room.getUser(id_recipient);
                log.info(">WRITE ALONE MESSAGE TO " + recipient.login, { command: Const.ROOM_COMMAND_USER_MESSAGE, room: room.name, sender: user.id, data: data });
                this.writeOne(recipient, Const.MSG_APPLICATION, {command:Const.ROOM_COMMAND_USER_MESSAGE, room:room.name, sender:user.id, data:{command:command, data:data}});
            }else
            for(var p in users)
            {
                //all
                if(users[p] != user)
                {
                    log.info(">WRITE MESSAGE TO "+users[p].login, {command:Const.ROOM_COMMAND_USER_MESSAGE, room:room.name, sender:user.id, data:data});
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
            log.error("[" + this.name + "]");
            if(user.id != undefined)
                log.info("id:" + user.id);
            if (user["id_user"] != undefined)
                log.info("id_user:" + user["id_user"]);
            if (data.room != undefined)
                log.info("room:" + data.room);
            if (data.user != undefined)
                log.info("to_user:"+data.user);
            log.info(data);
            if(!user.hasApp(this.name))
            {
                log.warn("user is not in app : "+this.name);
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
                    log.warn(name+" doesn't exist");
                }
            }
        }
        private _addUser(user:User):void
        {
            user.addApp(this.name);
            if(this.users_ids.indexOf(user.id)!=-1)
            {
                log.warn(this.name+"["+user.id+"] "+user.login+" already exists");
            }
            this.users.push(user);
            this.users_ids.push(user.id);
            this._bindUserEvents(user);
            this.onEnter(user);
        }
        private _removeUser(user:User):void
        {
            var index:number = this.users.indexOf(user);
            if(index != -1)
            {
                this.users_ids.splice(index, 1);
                this.users.splice(index, 1);
                this.onLeave(user);
                this._unbindUserEvents(user);
            }
        }
        protected _onUserChangeClass(newUser: User, user: User): void {
            this._unbindUserEvents(user);
            var index: number = this.users.indexOf(user);
            if (index != -1) {
                this.users[index] = newUser;
                this._bindUserEvents(newUser);
            }
        }
        protected _unbindUserEvents(user: User): void {
            user.off(Const.USER_DISCONNECTED, this._removeUser, this);
            user.off(Const.USER_CLASS_CHANGE, this._onUserChangeClass, this);
        }
        protected _bindUserEvents(user: User): void {
            user.on(Const.USER_CLASS_CHANGE, this._onUserChangeClass, this, user);
            user.on(Const.USER_DISCONNECTED, this._removeUser, this, user);
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
        public inspect(): any {
            var data: any = {};
            for (var p in this) {
                if (this.hasOwnProperty(p))
                    if (p.substring(0, 1) != "_" && p != "server") {
                        if (typeof this[p] == "object" && this[p].inspect) {
                            data[p] = this[p].inspect();
                        } else {
                            data[p] = this[p];
                        }
                    }
            }
            return data;
        }
    }



}
