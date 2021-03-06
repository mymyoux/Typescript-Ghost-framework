//convert
 /* ghost.events.EventDispatcher
*/
import {EventDispatcher} from "ghost/events/EventDispatcher";
///<module="events"/>
///<module="sgamecommon"/>

    
    ///<reference path="typings/globals/socket.io/index.d.ts"/>;
    
    //convert-import
import {Const} from "ghost/sgamecommon/Const";
    //convert-import
import {log} from "ghost/logging/log";
    export class Socket extends EventDispatcher
    {
        public static EVENT_ERROR:string = "error";
        public static EVENT_DATA:string = "data";
        public static EVENT_DESTROYED:string = "destroy";
        public static EVENT_DISCONNECTED:string = "disconnected";

        private socket:any;
        private connected:boolean;

        public constructor(socket: any)
        {
            super();
            this.connected = true;  
            this.socket = socket;
            this.bindEvents();
        }
        public isConnected():boolean
        {
            return this.connected && this.socket.connected;
        }
        private bindEvents():void{
            this.socket.on('error', this._onError.bind(this));
            this.socket.on('event', this._onEvent.bind(this));
            this.socket.on('data', this._onData.bind(this));
            this.socket.on('disconnect',this._onDisconnect.bind(this));
            var onevent:any = this.socket["onevent"];
            var _self:Socket = this;
            this.socket["onevent"] =  function(packet) {
                var args = packet.data || [];
                onevent.call(_self.socket, packet);    // original call
                _self._onData.apply(_self,args);
            };
        }
        private _onError(error:any):void
        {
            //log.error("socketerror", error);
            if(error && error.stack)
            {
                //log.error(error.stack);
            }
        }
        private _onDisconnect():void
        {
            this.trigger(Socket.EVENT_DISCONNECTED);
        }
        private _onData(command:string, data:any):void
        {
            // log.debug(command+":", data);
            var callback:Function = null;
            if(typeof arguments[arguments.length-1] == "function")
            {
                callback = arguments[arguments.length-1];
            }
            this.trigger(Socket.EVENT_DATA, command, data, callback);
        }
        private _onEvent(data:any):void
        {
            //log.info("event", data);
        }

        public write(command:string, data:any):void
        {
            if(this.isConnected())
            {
                this.socket.emit(command, data);
            }
        }
        public destroy():void
        {
            this.socket.disconnect(true);
            this.trigger(Socket.EVENT_DESTROYED);
            super.destroy();
        }
    }
