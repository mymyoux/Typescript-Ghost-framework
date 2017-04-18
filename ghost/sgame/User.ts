///<module="events"/>
///<file="Socket"/>
namespace ghost.sgame
{
    //tsc:uncomment
    //import Room = ghost.sgame.Room;
    import Const = ghost.sgamecommon.Const;
    import log = ghost.logging.log;
    import Objects = ghost.utils.Objects;
    export class User extends ghost.events.EventDispatcher
    {
        private rights:string[];
        public socket:Socket;
        private apps:any;
        public id:string;
        public login:string;
        public ip:string;
        public constructor()
        {
            super(); 
            this.rights = [];
            this.apps = {};
        }
        public setSocket(socket:Socket):void
        {
            if(this.socket)
            {
                this.socket.off(Socket.EVENT_DISCONNECTED, this.onDisconnected, this);
            }
            this.socket = socket; 
            
            if(this.socket) 
            {
                this.socket.once(Socket.EVENT_DISCONNECTED, this.onDisconnected, this);
                try
                {
                    //console.log('config ip', this.socket.socket[""]);
                    this.ip = this.socket["socket"]["handshake"].address;
                }catch(error)
                {

                }
            }
        }
        public write(command:string, data:any):void
        {
            if(this.socket)
            {
                this.socket.write(command, data);
            }
        }
        protected onDisconnected():void
        {
            this.trigger(Const.USER_DISCONNECTED);
            this.dispose(); 
        }
        public hasApp(name:string):boolean
        {
            return this.apps[name] != undefined;
        }
        public addApp(name:string):void
        {
            this.apps[name] = {
                name:name,
                inside: true,
                rooms:{}
            };
        }
        public removeApp(name:string):void
        {
            delete this.apps[name];
        }
        public addRoom(appName:string, name:string):void
        {
            if (!this.apps[appName])
            {
                //log.warn("user:"+this.id+" try to go in the room "+name+" but is not in the app "+appName);
                return;
            }
            this.apps[appName].rooms[name] = {
                inside:true,
                data:{}
            };
        }
        public getRooms(appName: string):string[]
        {
            if (!this.apps[appName] || !this.apps[appName].rooms) {
                return [];
            }
            var keys: string[] = [];
            for (var p in this.apps[appName].rooms)
            {
                keys.push(p);
            }
            return keys;

        }
        public onSetCustomData(room:Room, data:any):void
        {
            if (this.apps[room.appName] && this.apps[room.appName].rooms[room.name])
            {
                var roomraw: any = this.apps[room.appName].rooms[room.name];
                roomraw.data = Objects.mergeObjects(roomraw.data, data);
            }
        }
        public setCustomData(room: Room, data: any): void
        {
            if (this.apps[room.appName] && this.apps[room.appName].rooms[room.name]) {
                var roomraw: any = this.apps[room.appName].rooms[room.name];
                roomraw.data = Objects.mergeObjects(roomraw.data, data);
            }
        }
        public getCustomData(room:Room):any
        public getCustomData(room: Room, name: string): any
        public getCustomData(appName:string, name:string):any
        public getCustomData(appName:any, name?:string):any
        {
            if(typeof appName == "string")
            {
                var roomraw: any = this.apps[appName].rooms[name];
                return roomraw.data;
            }
            var room:Room = <any>appName;
            if (this.apps[room.appName] && this.apps[room.appName].rooms[room.name]) {
                var roomraw: any = this.apps[room.appName].rooms[room.name];
                return name ? (roomraw.data? roomraw.data[name] : null) : roomraw.data;
            }
            return null;
        }
        public removeRoom(appName:string, name:string):void
        {
            if (!this.apps[appName]) {
                //log.warn("user:" + this.id + " try to leave the room " + name + " but is not in the app " + appName);
                return;
            }
            delete this.apps[appName].rooms[name];
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
            if(this.socket)
            this.socket.destroy();
            super.destroy();
        }
        public dispose():void
        {
            this.destroy(); 
            super.dispose();
        }
        public setUserClass(cls:any):User  
        {
            //maybe only change the prototype
            //should only happend at early state of the user 
            var user: User = new cls();
            user.id = this.id;
            user.login = this.login;
            user.setSocket(this.socket);
            for (var p in this.apps) 
            {
                if (this.apps[p].inside)
                {
                    user.addApp(this.apps[p].name);
                    for(var q in this.apps[p].rooms)
                    {
                        user.addRoom(this.apps[p].name, q);
                    }
                }
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
    interface IApp
    {
        name:string;
        in:boolean;
        rooms:any;
    }
}
