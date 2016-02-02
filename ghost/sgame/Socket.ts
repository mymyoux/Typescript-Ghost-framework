///<module="events"/>
///<module="sgamecommon"/>
namespace ghost.sgame
{
    import Socketio = SocketIO.Socket;
    import Const = ghost.sgamecommon.Const;
    import log = ghost.logging.log;
    export class Socket extends ghost.events.EventDispatcher
    {
        public static EVENT_ERROR:string = "error";
        public static EVENT_DATA:string = "data";
        public static EVENT_DESTROYED:string = "destroy";
        public static EVENT_DISCONNECTED:string = "disconnected";

        private socket:Socketio;
        private connected:boolean;

        public constructor(socket:Socketio)
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
            log.info("connection");
            this.socket.on('error', this._onError.bind(this));
            this.socket.on('event', this._onEvent.bind(this));
            this.socket.on('data', this._onData.bind(this));
            this.socket.on('disconnect',this._onDisconnect.bind(this));
            var onevent:any = this.socket["onevent"];
            var _this:Socket = this;
            this.socket["onevent"] =  function(packet) {
                var args = packet.data || [];
                onevent.call(_this.socket, packet);    // original call
                _this._onData.apply(_this,args);
            };
        }
        private _onError(error:any):void
        {
            log.error("socketerror", error);
            if(error && error.stack)
            {
                log.error(error.stack);
            }
        }
        private _onDisconnect():void
        {
            log.warn("Disconnect");
            this.trigger(Socket.EVENT_DISCONNECTED);
        }
        private _onData(command:string, data:any):void
        {
            log.info("[DATA]", command, data);
            var callback:Function = null;
            if(typeof arguments[arguments.length-1] == "function")
            {
                callback = arguments[arguments.length-1];
            }
            this.trigger(Socket.EVENT_DATA, command, data, callback);
        }
        private _onEvent(data:any):void
        {
            log.info("event", data);
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
}
