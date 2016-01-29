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
        private app: any;
        public constructor(options:any)
        {
            super();
            this.listening = false;
            this.server = this.createServer(options);//require('http').createServer();
            this.io = require('socket.io')(this.server);
            this.users = [];
        }
        protected createServer(options:any):any
        {

            if(!options.secure)
            {
                delete options.secure; 
                return require('http').createServer(options);
            }else
            {
                console.log("https");
                //https
                var express = require('express');
                var https = require("https");
                var fs = require("fs");
                var app = express();
                this.app = app;
                delete options.secure;
                if(options.key)
                {
                    options.key = fs.readFileSync(options.key);
                }
                if (options.cert) {
                    options.cert = fs.readFileSync(options.cert);
                }
                return https.createServer(options, app);
            }
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
            var icallback:ICallback;
            if(callback)
            {
                icallback = <any>{
                    called : false,
                    handled : false,
                    _error : null,
                    success:function()
                    {
                        if(!this.called)
                            this._error = null;
                        this.execute.apply(this, Array.prototype.slice.call(arguments));
                    },
                    error:function(raison:string, data:any)
                    {
                        if(!this.called)
                            this._error = raison;
                        this.execute.apply(this, Array.prototype.slice.call(arguments));
                    },
                    execute:function()
                    {
                        if(!this.called)
                        {
                            this.handled = true;
                            this.called = true;
                            if(this._error)
                            {
                                callback(false, this._error, Array.prototype.slice.call(arguments));
                            }else
                            {
                                callback(true, null, Array.prototype.slice.call(arguments));
                            }
                        }else
                        {
                            console.warn("try to callback twice", arguments);
                            throw new Error("twice");
                        }
                    }
                };
            }
            if(command == Const.MSG_APPLICATION || command == Const.MSG_APPLICATION_IN || command == Const.MSG_APPLICATION_OUT)
            {

                if(data && data.app)
                {
                    this.trigger(command+":"+data.app, data, user, icallback);
                    if(icallback)
                    {
                        if(!icallback.handled)
                        {
                            icallback.success();
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
        success:Function;
        error:Function;
    }



}
