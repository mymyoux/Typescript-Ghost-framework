///<module="sgamecommon"/>
///<file="Room"/>

namespace ghost.sgameclient
{
    import Const = ghost.sgamecommon.Const;
    export class RoomManager
    {
        private rooms:any;
        private publics:Room[];
        public constructor()
        {
            this.rooms = {};
            this.publics = [];
        }
        public enterRoom(name:string, password:string, visibility:string):Room
        {
            return this.rooms[name] = new Room(name, password, visibility);
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