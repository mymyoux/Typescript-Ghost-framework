///<file="User"/>
///<module="sgamecommon"/>
namespace ghost.sgame
{
    import Const = ghost.sgamecommon.Const;
    export class Room
    {
        public name:string;
        public appName:string;
        protected password:string;
        private users:User[];
        private usersIDs:string[];
        public constructor(appName:string, name:string, password:string = null)
        {
            this.name = name;
            this.appName = appName;
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
                user.addRoom(this.appName, this.name);
                this.users.push(user);
                this.usersIDs.push(user.id);
                this._bindUserEvents(user);
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
                this.users[index].removeRoom(this.appName, this.name);
                this.users.splice(index, 1);
                this.usersIDs.splice(index, 1);
                this._unbindUserEvents(user);
            }
        }
        public length():number
        {
            return this.users.length;
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
            user.off(Const.USER_DISCONNECTED, this.removeUser, this);
            user.off(Const.USER_CLASS_CHANGE, this._onUserChangeClass, this);
        }
        protected _bindUserEvents(user: User): void {
            user.once(Const.USER_CLASS_CHANGE, this._onUserChangeClass, this, user);
            user.once(Const.USER_DISCONNECTED, this.removeUser, this, user);
        }

    }
}
