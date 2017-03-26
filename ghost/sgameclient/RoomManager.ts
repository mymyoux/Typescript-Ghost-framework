///<module="sgamecommon"/>
///<file="Room"/>

namespace ghost.sgameclient
{
    //tsc:uncomment
    //import Application = ghost.sgameclient.Application;
    import Const = ghost.sgamecommon.Const;
    export class RoomManager
    {
        private rooms:any;
        private publics:Room[];
        private application: Application;
        protected _length: number;
        public constructor(application:Application)
        {
            this.rooms = {};
            this.publics = [];
            this.application = application;
            this._length = 0;
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
        public hasRoom(name:string):boolean
        {
            return this.rooms[name] != undefined;
        }
        public createRoom(name: string, password: string, visibility: string): Room
        {
            if (this.rooms[name])
            {
                return this.rooms[name];
            }
            this._length++;
            return this.rooms[name] = new Room(name, password, visibility, this.application);
        }
        public leaveRoom(name:string):void
        {
            if(!this.rooms[name])
            {
                //nothing to do
                return;
            }
            this._length--;
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
        public length():number
        {
            return this._length;
        }
        public dispose():void
        {
            if(this.application)
            {
                var rooms:Room[] = this.getRooms();
                while(rooms.length)
                {
                    rooms.shift().dispose();
                }
                this.rooms = {};
                this.application = null;
                this._length = 0;
            }
        }
    }
}
