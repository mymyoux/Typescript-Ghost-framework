///<file="User"/>
namespace ghost.sgame
{
    export class Room
    {
        public name:string;
        protected password:string;
        private users:User[];
        private usersIDs:string[];
        public constructor(name:string, password:string = null)
        {
            this.name = name;
            this.users = [];
            this.usersIDs = [];
            this.password = password;
        }
        public getUsers():User[]
        {
            return this.users;
        }
        public getUsersInformation():User[]
        {
            return this.users.map(function(user:User):any
            {
              return {id:user.id, login:user.login};
            }); 
        }
        public addUser(user:User, password:string = null):boolean
        {
            if(this.password && password != this.password)
            {
                return false;
            }
            var index:number = this.users.indexOf(user);
            if(index == -1)
            {
                user.addRoom(this.name);
                this.users.push(user);
                this.usersIDs.push(user.id);
            }
            return true;
        }
        public getUser(id:string):User
        {
            var index:number = this.usersIDs.indexOf(id);
            if(index != -1)
            {
                return this.users[index];
            }
            return null;
        }
        public hasUser(id:string):boolean;
        public hasUser(user:User):boolean;
        public hasUser(user:any):boolean
        {
            if(typeof user == "string")
                return this.usersIDs.indexOf(user)!=-1;
            else
                return this.users.indexOf(user)!=-1;
        }
        public removeUser(id:string):void;
        public removeUser(user:User):void;
        public removeUser(user:any):void
        {
            var index:number = typeof user == "string"? this.usersIDs.indexOf(user):this.users.indexOf(user);
            if(index != -1)
            {
                this.users[index].removeRoom(this.name);
                this.users.splice(index, 1);
                this.usersIDs.splice(index, 1);
            }
        }
        public length():number
        {
            return this.users.length;
        }
    }
}
