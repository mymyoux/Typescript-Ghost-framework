///<file="IUser"/>
///<module="events"/>
namespace ghost.sgameclient
{
    import Const = ghost.sgamecommon.Const;
    import Objects = ghost.utils.Objects;
    export class Room extends ghost.events.EventDispatcher
    {
        public static EVENT_DATA:string = "data";
        public static EVENT_READY:string = "ready";
        private users:IUser[];
        private usersIDs:string[];
        public name:string;
        private password:string;
        private visibility:string;
        protected ready: boolean;
        protected application: Application; 
        private buffer: any[];
        protected data:any;
        public constructor(name:string, password:string, visibility:string, application:Application)
        {
            super(); 
            this.name = name;
            this.password = password;
            this.visibility = visibility;
            this.users = [];
            this.usersIDs = [];
            this.ready = false;
            this.buffer = [];
            this.application = application;
            this.data = {};
        }
        public getVisibility():string
        {
            return this.visibility;
        }
        public getPassword():string
        {
            return this.password;
        }
        public enter():void
        {
            this.ready = true;
            var buffer: any;
            while(this.buffer.length)
            {
                buffer = this.buffer.shift();
                if (buffer.func == "write")
                {
                    this.write(buffer.command, buffer.data, buffer.callback);
                }else
                if (buffer.func == "writeUser") {
                    this.writeUser(buffer.user, buffer.command, buffer.data, buffer.callback);
                }
            }
            this.trigger(Room.EVENT_READY);
        }
        public addUser(user:IUser)
        {
            console.log("["+this.name+"]add user:", user);
            if(this.users.indexOf(user)==-1)
            {
                this.users.push(user);
                this.usersIDs.push(user.id);
            }
        }
        public removeUser(user:IUser)
        {
            console.log("["+this.name+"]remove user:", user);
            var index:number;
            if((index=this.users.indexOf(user))!=-1)
            {
                this.users.splice(index, 1);
                this.usersIDs.splice(index, 1);
            }
        }
        public clearUsers():void
        {
            this.users.length = 0;
            this.usersIDs.length = 0;
        }
        public getUser(id:string):IUser
        {
            var index:number;
            if((index=this.usersIDs.indexOf(id))!=-1)
            {
                return this.users[index];
            }
            return null;
        }
        public removeUserByID(id:string):void
        {
            console.log("["+this.name+"]remove id:", id);
            var index:number;
            if((index=this.usersIDs.indexOf(id))!=-1)
            {
                this.users.splice(index, 1);
                this.usersIDs.splice(index, 1);
            }
        }
        public onData(command:string, data:any):void
        {
            this.trigger(Room.EVENT_DATA, command, data);
            this.trigger(command, data);
        }
        public getUsers():IUser[]
        {
            return this.users;
        }
        public length():number
        {
            return this.users.length;
        }
        public command(command: string, data: any, callback: Function = null):void
        {
            this.write(Const.ROOM_COMMAND_INTERNAL, {command:command, data:data}, callback);
        }
        public write(command: string, data: any, callback: Function = null): void {
            if (!this.ready)
                this.buffer.push({ func: "write", command: command, data: data, callback: callback });
            else 
            {
                this.application.writeRoom(this, command, data, callback);
            }
        }
        public writeUser(user: IUser, command: string, data: any, callback: Function = null): void {
            if (!this.ready)
                this.buffer.push({ func: "writeUser", user: user, command: command, data: data, callback: callback });
            else
                this.application.writeRoomUser(this, user, command, data, callback);
        }
        public setData(data: any, callback:Function = null):void
        {
            var result:any = Objects.merge(this.data, data);
            if (!Objects.deepEquals(result, this.data))
            {
                this.data = result;
                data.source = "setData";
                data.id_set_data = ghost.utils.Maths.getUniqueID();
                this.write(Const.ROOM_COMMAND_USER_DATA, data, callback);
            }
        }
        public resendData():void
        {
            if (this.data && !this.buffer.length)
            {
                var data: any = ghost.utils.Objects.clone(this.data);
                data.id_resend = ghost.utils.Maths.getUniqueID();
                data.source = "resend";
                this.write(Const.ROOM_COMMAND_USER_DATA, data);
            }
        }
        public exit():void
        {
            this.application.leaveRoom(this.name);
        }

        public dispose():void
        {
            if(this.application)
            {
                this.application = null;
                //user can be share between many rooms
                /*this.users.forEach(function(user:any)
                {
                    if(user.dispose)
                        user.dispose();
                });*/
                this.users.length = 0;
                this.usersIDs.length = 0;
                this.buffer.length = 0;
                this.data = null;

                super.dispose();
            }
        }
    }
}
