//missing
import {IUser} from "ghost/sgameclient/IUser";
//convert
 /* ghost.utils.Maths.*/
import {Maths} from "ghost/utils/Maths";
//convert
 /* ghost.events.EventDispatcher
*/
import {EventDispatcher} from "ghost/events/EventDispatcher";
///<module="events"/>
///<module="sgamecommon"/>
///<module="utils"/>
//convert-files
import {Client} from "./Client";

    
    //convert-import
import {RoomManager} from "ghost/sgameclient/RoomManager";
    
    //convert-import
import {Room} from "ghost/sgameclient/Room";
    //convert-import
import {IApplicationMessage} from "ghost/sgamecommon/IApplicationMessage";
    //convert-import
import {Buffer} from "ghost/utils/Buffer";
    //convert-import
import {MFunction} from "ghost/utils/MFunction";
    //convert-import
import {Const} from "ghost/sgamecommon/Const";
    //convert-import
import {IApplicationData} from "ghost/sgamecommon/IApplicationData";
    export class Application extends EventDispatcher
    {
        private name:string;
        protected client:Client;
        protected roomManager:RoomManager;
        private connected:boolean;
        private connecting:boolean;
        private processing:boolean;
        private buffer:any[];

        private applicationConnected: boolean;
        public constructor(name:string, client:Client)
        {
            super();
            this.name = name;
            this.client = client;
            this.connected = false;
            this.connecting = false;
            this.processing = false;
            this.buffer = [];
            this.roomManager = new RoomManager(this);
            this.applicationConnected = false;
            //this.connect();
            if(this.client.isConnected())
            {
                this._onClientConnect();
            }
            this.bindEvents();
        }
        public getRoomManager():RoomManager
        {
            return this.roomManager;
        }

        public isConnected():boolean
        {
            return this.connected && this.client.isConnected();
        }
        public connect():void
        {
            if(!this.isConnected() && !this.connecting)
            {
                if(!this.client.isConnected())
                {

                    this.client.connect();
                }else
                {
                    //sync client & app statsu
                    this._onClientConnect();
                }
            }
        }
        public write(command:string, data:any, callback:Function = null):void
        {
            this.buffer.push({command:command , data:data, callback:callback});
            this.writeNext();
        }
        public writeRoom(room:Room, command:string, data:any, callback:Function = null):void
        {
            this.buffer.push({command:command , data:data, callback:callback, room:room.name});
            this.writeNext();
        }
        public writeRoomUser(room:Room, user:IUser, command:string, data:any, callback:Function = null):void
        {
            this.buffer.push({command:command , data:data, callback:callback, room:room.name, user:user.id});
            this.writeNext(); 
        }
        public createPrivateRoom(name:string, password:string = null, callback:Function = null):Room
        {
            return this._enterRoom(name, Const.ROOM_VISIBILITY_PRIVATE, password, callback);
        }
        public enterRoom(name: string, callback?: Function): Room;
        public enterRoom(name: string, visibility?: string, callback?: Function): Room;
        public enterRoom(name: string, visibility: any = Const.ROOM_VISIBILITY_PUBLIC, callback: Function = null): Room
        {
            if(typeof visibility == "function")
            {
                callback = <any>visibility;
                visibility = Const.ROOM_VISIBILITY_PUBLIC;
            }
            if(!this.isConnected())
            {
                this.connect();
            }
            return this._enterRoom(name, visibility, null, callback);
        }
        protected _enterRoom(name:string, visibility:string, password:string, callback:Function):Room
        {
            var room: Room;
            if (this.roomManager.hasRoom(name))
            {
                room = this.roomManager.getRoom(name);
                if (callback) {
                    callback(room);
                }
                return room;
            }
            room = this.roomManager.createRoom(name, password, visibility);
            this._roomConnectCall(room, callback);
            this.writeNext();
            return room;
        }
       
        public leaveRoom(name:string):void
        {
            this.roomManager.leaveRoom(name);
            this.buffer.push({command:Const.APPLICATION_COMMAND_LEAVE_ROOM, data:name});
            this.writeNext();
        }
        protected writeInternalData(targetApplication:string, command:string, data:any):void
        {
            this.client.internalData(this, targetApplication, command, data);
        }
        protected loginInternal(success:boolean):void
        {
            //TODO:si une callback deja en cours faire attention
            //a priori aucune repercution
            if(success)
            {
                this.connecting = false;
                this.connected = true;
                //this._onApplicationConnect();
                this._enterApplication();
            }else
            {
                console.warn("loginInternal", success);
            }
        }
        private bindEvents():void
        {
            // console.log("listen "+Const.MSG_APPLICATION+":"+this.name);
            this.client.on(Client.EVENT_CONNECT, this._onClientConnect.bind(this));
            this.client.on(Client.EVENT_RECONNECT, this._onReconnect.bind(this));
            this.client.on(Client.EVENT_DISCONNECT, this._onClientDisconnect.bind(this));
            this.client.on(Const.MSG_APPLICATION+":"+this.name, this._onData.bind(this));
            this.client.on(Const.MSG_APPLICATION+":"+Const.ALL_APP, this._onDatall.bind(this));
            this.client.on(Const.MSG_APPLICATION_INTERNAL+":"+Const.ALL_APP, this._onInternalData.bind(this));
            this.client.on(Const.MSG_APPLICATION_INTERNAL+":"+this.name, this._onInternalDataAll.bind(this));
            this.client.on(Const.EVENT_DISPOSE, this.dispose.bind(this));
        }
        private _onClientConnect(): void
        {
            this.connected = true;
            
            this._enterApplication();
        }
        private _onClientDisconnect():void
        {
            this.connected = false;
            this.applicationConnected = false;
            this.connecting = false;
        }
        private _enterApplication():void
        {
            
            if (!this.connecting && !this.applicationConnected)
            {
                this.connecting = true;
                this.client.write(Const.MSG_APPLICATION_IN, { app: this.name }, (success: boolean, data: any) => {
                        if (success) {
                            this.connecting = false;
                            this.applicationConnected = true;
                            this._onApplicationConnect();
                        } else {
                            console.log("!! ERROR NEED LOGIN");
                            if (data && data.app && data.command && data.error) {
                                this.writeInternalData(data.app, data.command, data.error);
                            } else {
                                this.writeInternalData(Const.LOGIN_APP, Const.LOGIN_COMMAND, data);
                            }
                            //    this.client._
                        }
                    }
                );
            }
        }
        protected _roomConnectCall(room: Room, callback: Function = null): void {
            this.buffer.push({
                command: Const.APPLICATION_COMMAND_ENTER_ROOM, data: { name: room.name, visibility: room.getVisibility(), password: room.getPassword() }, callback: (success: boolean, users: IUser[]) => {
                    console.log("ENTER ROOM " + name, callback);

                    if (success) {
                        room = this.roomManager.enterRoom(room);
                        room.clearUsers();
                        console.log(success, users);
                        if (users)
                            users.forEach(room.addUser, room);
                    }
                    if (callback) {
                        callback(room);
                    }
                }
            });
        }
        public leaveApplication():void
        {
            this.client.write(Const.MSG_APPLICATION_OUT, {app:this.name});
            this.dispose(); 
        }
        /**
         * Application connected;
         */
        protected _onApplicationConnect():void
        {
            //application connected
            this.applicationConnected = true;

            var buffer: any[] = this.buffer;
            this.buffer = [];
            var rooms: Room[] = this.roomManager.getRooms();
            rooms.forEach((room: Room): void=> {
                this._roomConnectCall(room);
                room.resendData();
            });
            if(buffer.length>0 || this.buffer.length)
            {
                //debugger; 
            }
            //remove app/room
            buffer.filter(function(data: any): boolean { 
                
                return data.command != Const.APPLICATION_COMMAND_ENTER_ROOM && (data.command != Const.MSG_APPLICATION || !data.data || data.data.command != Const.ROOM_COMMAND_USER_DATA);
              }).forEach((data: any): void=> { 
                  data.source = "connect";
                  this.buffer.push(data); });
            this.writeNext();
        }
        private _onInternalDataAll(source:Application, command:string, data:IApplicationData):void
        {
            this._onInternalData(source, command, data);
        }
        private _onInternalData(source:Application, command:string, data:IApplicationData):void
        {
            if(source !== this)
            {
                var name:string = command+"Internal";
                // console.log("try "+name);
                if(this[name] && typeof this[name] == "function")
                {
                    this[name](data);
                }else
                {
                    this._onData(command, <any>{data:data});
                }
            }
        }
        private _onDatall(command:string, data:IApplicationData):void
        {
            this._onData(command, data);
        }
        private _onDataRoom(command:string, room:Room, data:any):void
        {
            // console.log(">"+room.name+" ["+this.name+"] data", command, data);
            if(command == Const.ROOM_COMMAND_USER_MESSAGE)
            {
                room.onData(data.command, data.data);
            }else
            if(command == Const.ROOM_COMMAND_USER_ENTER)
            {
                room.addUser(data);
            }if(command == Const.ROOM_COMMAND_USER_LEAVE)
            {
                room.removeUserByID(data.id);
            }
        }
        protected _onData(command:string, data:IApplicationData):void
        {
            // console.log("["+this.name+"] data", command, data);
            if(data && data.room)
            {
                var room:Room = this.roomManager.getRoom(data.room);
                if(!room)
                {
                    return;
                }
                return this._onDataRoom(data.command, room, data.data);
            }
            var name:string = command+"Action";
          /*  if(data.command == Const.ROOM_COMMAND_USER_ENTER)
            {

            //force user to go to a room
                //this.roomManager.getRoom(data)
            }
            else
            if(data.command == Const.ROOM_COMMAND_USER_LEAVE)
            {
                console.log("LEAVE", data);
            }
            else*/
            if(this[name] && typeof this[name] == "function")
            {
                this[name](data.data);
            }else
            {
                console.warn("["+this.name+"]"+name+" doesn't exist", data);
            }
        }
        /*
        private _onConnect():void
        {
            console.log("connected");
            this.writeNext(); 
        }*/
        protected _onReconnect():void
        {
            /*
            var buffer: any[] = this.buffer;
            this.buffer = [];
            this._applicationConnectCall();
            var rooms:Room[] = this.roomManager.getRooms();
            rooms.forEach((room:Room):void=>
            {
                this._roomConnectCall(room);
            });
            //remove app/room
            buffer.forEach(this.buffer.push);
            //this.writeNext(true);    
            */
        }
        protected postDataCallbackTreatment(time:number, request:any, data:any):any
        {
            return data;
        }
        protected writeNext(): void
        protected writeNext(data?:any):void
        {
            if(!this.isConnected())
            {
                this.connect();
                return;
            }
            if (this.connecting) 
            {
                return;
            } 
            if (!this.applicationConnected)
            {
                return;
            }
            if(!this.processing)
            {
                if(!data)
                {
                    if(!this.buffer.length)
                    {
                        return;
                    }
                    data = this.buffer[0];
                }
                this.processing = true;
                var _self:Application = this;
                //console.log("[WRITE]-"+this.name, data);
                var request:any = {app:this.name, command:data.command, data:data.data};
                if(data.room)
                {
                    request.room = data.room;
                }
                if(data.user)
                {
                    request.user = data.user;
                }
                if (request.command == Const.ROOM_COMMAND_USER_DATA)
                {
                }
                if(request["_id"] == undefined)
                {
                    request["_id"] = Maths.getUniqueID();
                }
                var time: number = Date.now();
                this.client.write(Const.MSG_APPLICATION, request, function(success:boolean, error:string, args:any[])
                {
                    if(_self.buffer.length && _self.buffer[0] === data)
                    {

                        if(data.callback && args && args.length)
                        {
                            args = _self.postDataCallbackTreatment(time, data, args);
                        }
                        if(!success && error)
                        {
                            if(error == Const.ERROR_NEED_LOGIN)
                            {
                                console.log("ERROR NEED LOGIN from ", data);
                                return _self.writeInternalData(Const.LOGIN_APP, Const.LOGIN_COMMAND, args);
                            }
                            if(error == Const.ERROR_NEED_APPLICATION_ENTER)
                            {
                                return _self._enterApplication();
                            }
                        }
                        if(data.callback)
                        {

                            if(success)
                            {
                                data.callback.apply(null, [success].concat(args));
                            }else
                            {
                                data.callback(success, {type:error, data:args});
                            }
                            //data.callback.apply(null, Array.prototype.slice.call(arguments));
                        }

                        _self.processing = false;

                        _self.buffer.shift();
                        _self.writeNext();
                    }
                });
            }
        }
        public dispose():void
        {
            if(this.client)
            {
                this.client = null;
                this.roomManager.dispose();
                this.buffer.length = 0;
                this.trigger(Const.EVENT_DISPOSE);
                super.dispose();
            }
        }
        /**
         * Useful for ractive include
         */
        public toObject(): any {
            return this;
        }
    }
