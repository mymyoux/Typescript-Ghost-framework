///<lib="node"/>
///<lib="socketio"/>
///<file="User"/>
///<module="events"/>
///<module="sgamecommon"/>

namespace ghost.sgame
{
    import Const = ghost.sgamecommon.Const;
    //import Socket = SocketIO.Socket;
    export class Server extends ghost.events.EventDispatcher
    {
        public static EVENT_ERROR:string = "error";
        public static EVENT_DESTROYED:string = "destroy";

        private port:number;
        private server:any;
        private users:User[];
        private io:any;
        private listening:boolean;
        public constructor()
        {
            super();
            this.listening = false;
            this.server = require('http').createServer();
            this.io = require('socket.io')(this.server);
            this.users = [];
        }
        public listen(port:number):void
        {
            this.port = port;
            this._listen();
        }
        private _listen():void
        {
            if(!this.listening)
            {
                this.listening = true;
                this.io.on('connection', this._onConnection.bind(this));
                this.io.on('error', this._onError.bind(this));
                 this.server.listen(this.port);
                console.log("listen from port "+this.port);
            }
        }
        private _onConnection(socket:any):void {
            var user:User = new User();
            user.socket = new Socket(socket);
            user.socket.on(Socket.EVENT_DATA, this._onData, this, user);
            this.users.push(user);
        }
        private _onData(command:string, data:any, callback:Function, user:User):void
        {
            console.log(command+" from "+user["login"]);
            var icallback:ICallback;
            if(callback)
            {
                icallback = {
                    called : false,
                    handled : false,
                    execute:function()
                    {
                        if(!this.called)
                        {
                            console.log("call callback");
                            this.handled = true;
                            this.called = true;
                            callback.apply(null, arguments);
                        }else
                        {
                            console.warn("try to callback twice");
                        }
                    }
                };
            }
            if(command == Const.MSG_APPLICATION || command == Const.MSG_APPLICATION_IN || command == Const.MSG_APPLICATION_OUT)
            {

                if(data && data.app)
                {
                    console.log("trigger "+command+":"+data.app);
                    this.trigger(command+":"+data.app, data, user, icallback);
                    if(icallback)
                    {
                        if(!icallback.handled)
                        {
                            icallback.execute();
                        }
                    }
                    return;
                }
            }
        }
        private _onError(error:any):void
        {
            this.trigger(Server.EVENT_ERROR, error);
        }
        public destroy():void
        {
            console.error("destroying server");
            this.trigger(Server.EVENT_DESTROYED);
            while(this.users.length)
            {
                this.users.shift().destroy();
            }
            this.server.close();
            super.destroy();
        }
    }
    export interface ICallback
    {
        called:boolean;
        handled:boolean;
        execute:Function;
    }



}