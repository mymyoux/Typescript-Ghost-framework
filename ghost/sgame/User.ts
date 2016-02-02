///<module="events"/>
///<file="Socket"/>
namespace ghost.sgame
{
    import Const = ghost.sgamecommon.Const;
    export class User extends ghost.events.EventDispatcher
    {
        private rights:string[];
        public socket:Socket;
        private apps:any;
        private rooms:any;
        public id:string;
        public login:string;
        public constructor()
        {
            super(); 
            this.rights = [];
            this.apps = {};
            this.rooms = {};
        }
        public hasApp(name:string):boolean
        {
            return this.apps[name] != undefined;
        }
        public addApp(name:string):void
        {
            this.apps[name] = true;
        }
        public removeApp(name:string):void
        {
            delete this.apps[name];
        }
        public addRoom(name:string):void
        {
            this.rooms[name] = true;
        }
        public removeRoom(name:string):void
        {
            delete this.rooms[name];
        }
        public addRight(right:string):void{
            if(this.rights.indexOf(right)==-1)
                this.rights.push(right);
        }
        public removeRight(right:string):void
        {
            var index:number = this.rights.indexOf(right);
            if(index!=-1){
                this.rights.splice(index, 1);
            }
        }
        public isAllowed(right:string):boolean
        {
            return this.rights.indexOf(right)!=-1;
        }
        public destroy():void
        {
            this.socket.destroy();
            super.destroy();
        }
        public setUserClass(cls:any):User  
        {
            //maybe only change the prototype
            //should only happend at early state of the user 
            var user: User = new cls();
            user.id = this.id;
            user.login = this.login;
            user.socket = this.socket;
            for (var p in this.rooms) {
                if (this.rooms[p] === true)
                    user.addRoom(p);
            }
            for (var p in this.apps) {
                if (this.apps[p] === true)
                    user.addApp(p);
            }
            this.rights.forEach(user.addRight.bind(user));
            this.trigger(Const.USER_CLASS_CHANGE, user);
            return user;
        }
        public inspect(): any {
            var data: any = {};
            for (var p in this) {
                if (this.hasOwnProperty(p))
                    if (p.substring(0, 1) != "_" && p !="socket") {
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
