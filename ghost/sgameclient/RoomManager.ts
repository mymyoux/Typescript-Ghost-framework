///<module="sgamecommon"/>
///<file="Room"/>

namespace ghost.sgameclient
{
    import Const = ghost.sgamecommon.Const;
    export class RoomManager
    {
        private rooms:any;
        private publics:Room[];
        private application: Application;
        public constructor(application:Application)
        {
            this.rooms = {};
            this.publics = [];
            this.application = application;
        }
        public enterRoom(room:Room):Room
        public enterRoom(name:string, password?:string, visibility?:string):Room
        public enterRoom(room:any, password?:string, visibility?:string):Room
        {
            var name: string = typeof room == "string"?room:room.name;
            if (this.rooms[name] && this.rooms[name] !== room) {
                this.rooms[name].dispose();
            }
            if(typeof room == "string")
            {
               this.rooms[name] = this.createRoom(room, password, visibility);
            }else
            {
                this.rooms[name] = room;
            }
            this.rooms[name].enter();
            return this.rooms[name];
        }
        public createRoom(name: string, password: string, visibility: string): Room
        {
            if (this.rooms[name])
            {
                return this.rooms[name];
            }
            return new Room(name, password, visibility, this.application);
        }
        public leaveRoom(name:string):void
        {
            if(!this.rooms[name])
            {
                //nothing to do
                return;
            }
            this.rooms[name].dispose();
            delete this.rooms[name];
        }
        public getRoom(name:string):Room
        {
            return this.rooms[name];
        }
        public getRooms():Room[]
        {
            var rooms:Room[] = [];
            for(var p in this.rooms)
            {
                rooms.push(this.rooms[p]);
            }
            return rooms;
        }
        public dispose():void
        {
            var rooms:Room[] = this.getRooms();
            while(rooms.length)
            {
                rooms.shift().dispose();
            }
            this.rooms = {};
        }
    }
}
