
///<module="sgamecommon"/>
//convert-files
import {Room} from "./Room";


      
    //convert-import
import {User} from "ghost/sgame/User";
    //convert-import
import {Const} from "ghost/sgamecommon/Const";
    export class RoomManager
    {
        private rooms:any;
        private publics:Room[];
        private appName: string;
        public constructor(appName:string)
        { 
            this.appName = appName;
            this.rooms = {}; 
            this.publics = [];
        }
        public addUserToRoom(name:string, visibility:string, password:string, user:User):boolean
        {
            if(!this.rooms[name])
            {
                ///no password for public channels
                if(visibility == Const.ROOM_VISIBILITY_PUBLIC)
                {
                    password = null;
                }
                this.createRoom(name, visibility, password);
            }
           return this.rooms[name].addUser(user, password);
        }

        private createRoom(name:string, visibility:string, password:string):void
        {
            this.rooms[name] = new Room(this.appName, name, password);
            if(visibility == Const.ROOM_VISIBILITY_PUBLIC)
            {
                this.publics.push(this.rooms[name]);
            }
        }
        public removeUserFromRoom(name:string, user:User):void
        {
            if(!this.rooms[name])
            {
                //nothing to do
                return;
            }
            var room:Room = this.rooms[name];
            room.removeUser(user);
            if(room.length() == 0)
            {
                delete this.rooms[name];
                var index:number;
                if((index = this.publics.indexOf(room)) != -1)
                {
                    this.publics.splice(index, 1);
                }
            }
        }
        public getRoom(name: string, createIfNoExists: boolean = false):Room
        {
            if (createIfNoExists && !this.rooms[name])
            {
                this.createRoom(name, Const.ROOM_VISIBILITY_PUBLIC, null);   
            }
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
    }
