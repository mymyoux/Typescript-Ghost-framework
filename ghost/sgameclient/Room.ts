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
            this.name = name;
            this.password = password;
            this.visibility = visibility;
            this.users = [];
            this.usersIDs = [];
            this.ready = false;
            this.buffer = [];
            this.application = application;
            this.data = {};
            super();
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
                this.write(Const.ROOM_COMMAND_USER_DATA, data, callback);
            }
        }
        public exit():void
        {
            this.application.leaveRoom(this.name);
        }
        public dispose():void
        {
            super.dispose();
            this.application = null;
            this.users.length = 0;
            this.usersIDs.length = 0;
            this.buffer.length = 0;
        }
    }
}
