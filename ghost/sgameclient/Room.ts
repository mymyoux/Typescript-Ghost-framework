///<file="IUser"/>
///<module="events"/>
namespace ghost.sgameclient
{
    export class Room extends ghost.events.EventDispatcher
    {
        public static EVENT_DATA:string = "data";
        private users:IUser[];
        private usersIDs:string[];
        public name:string;
        private password:string;
        private visibility:string;
        public constructor(name:string, password:string, visibility:string)
        {
            this.name = name;
            this.password = password;
            this.visibility = visibility;
            this.users = [];
            this.usersIDs = [];
            super();
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
    }
}