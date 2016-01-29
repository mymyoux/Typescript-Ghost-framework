///<lib="socketio-client"/>
///<lib="node"/>
///<module="events"/>
///<module="utils"/>
namespace ghost.sgameclient
{
    import Buffer = ghost.utils.Buffer;
    import IApplicationData = ghost.sgamecommon.IApplicationData;
    import Const = ghost.sgamecommon.Const;
    export class Client extends ghost.events.EventDispatcher
    {
        public static EVENT_DATA:string = "data";
        public static EVENT_CONNECT:string = "connect";
        public static EVENT_EVENT:string = "event";
        public static EVENT_DISCONNECT:string = "disconnect";
        public static EVENT_ERROR:string = "error";
        public static EVENT_ERROR_CONNECTION:string = "error_connection";
        private url:string;
        private options: SocketIOClient.ConnectOpts;
        private socket:any;
        private buffer:Buffer;

        private disconnected:boolean;
        public constructor(url: string, options?: SocketIOClient.ConnectOpts)
        {
            super();
            this.disconnected = true;
            this.init(url, options);
            this.buffer = new Buffer();
        }
        public init(url: string, options?: SocketIOClient.ConnectOpts): void
        {
            this.url = url;
            this.options = options;
        }
        public isConnected():boolean
        {
            return !this.disconnected && !this.socket.disconnected;
        }
        public close():void
        {
            this.socket.close();
        }
        public reconnect():void
        {
            this.connect();
        }
        public connect():void
        {
            if(!this.socket)
                this._connect();
            else
            {
                if(!this.isConnected() || this.socket.disconnected)
                {
                    this.socket.connect();
                }else
                {
                    console.warn("Warn:socket already connected");
                }
            }
        }
        public write(command:string, data:any, callback:Function = null):void
        {
            //this.socket.emit(command, data);return;
            this.socket.emit(command, data, callback);

        }
        private _connect():void
        {
            //test
            if(typeof io == "undefined")
            {
                io = require("socket.io-client");
            }

            if(ROOT._isNode)
            {
                console.log("Node environment");
            }
            var socket = ROOT._isNode?require('socket.io-client')(this.url, this.options):io(this.url, this.options);
            socket.on('connect', this._onConnect.bind(this));
            socket.on('event', this._onEvent.bind(this));
       /*     socket.on('*', (data:any)=>{
                this.trigger("pong", data);
            });*/
            var onevent:any = socket.onevent;
            var _this:Client = this;
            socket.onevent =  function(packet) {
                var args = packet.data || [];
                onevent.call(socket, packet);    // original call
                _this._onData.apply(_this, args);
            };
            socket.io.on('error', function(){console.log("error", arguments)});
            socket.io.on('connect_error', function(error){console.log("connet_error", error);});
            socket.on('disconnect',this._onDisconnect.bind(this));

            this.socket = socket;
        }
        public internalData(source:Application, application:string, command:string, data:any):void
        {
            console.log("trigger "+Const.MSG_APPLICATION+":"+application, command, data);
            this.trigger(Const.MSG_APPLICATION_INTERNAL+":"+application, source, command, data);

        }
        private _onData(channel:string, data:IApplicationData & {app:string}):void
        {
            console.log("[data]", channel, data);
            if(data && data.app)
            {
                this.trigger(channel+":"+data.app, data.command, data.data);
            }
        }
        private _onError(error:any):void
        {
            console.log("error", error);
            this.trigger(Client.EVENT_ERROR);
        }
        private _onErrorConnection(error:any):void
        {
            this.disconnected = true;
            this.trigger(Client.EVENT_ERROR_CONNECTION);
            this._onError(error);
        }
        private _onConnect():void
        {
            this.disconnected = false;
            this.onConnect();
            this.trigger(Client.EVENT_CONNECT);
        }
        protected onConnect():void
        {
            //TODO:emit to app to have them purge their messages
            this.buffer.callAll();
        }
        private _onEvent():void
        {
            console.log("event", arguments);
            this.trigger(Client.EVENT_EVENT);
        }
        private _onDisconnect():void
        {
            this.disconnected = true;
            this.trigger(Client.EVENT_DISCONNECT);
        }
    }
    if(typeof module != "undefined")
        module.exports = ghost;
}
