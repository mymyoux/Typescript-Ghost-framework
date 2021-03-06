//missing
import {Socket} from "ghost/sgame/Socket";
//missing
import {Application} from "ghost/sgame/Application";
//convert
 /* ghost.events.EventDispatcher
*/
import {EventDispatcher} from "ghost/events/EventDispatcher";
//convert
 /* ghost.sgame.Stats.*/
import {Stats} from "ghost/sgame/Stats";


//convert-files
import {User} from "./User";
//convert-files
import {ICallback} from "./ICallback";
///<module="events"/>
///<module="sgamecommon"/>
///<module="logging"/>


    //convert-import
import {Const} from "ghost/sgamecommon/Const";
    //convert-import
import {log} from "ghost/logging/log";
    
    export class Server extends EventDispatcher
    {
        public static EVENT_ERROR:string = "error";
        public static EVENT_DESTROYED:string = "destroy";

        private port:number;
        private server:any;
        private users:User[];
        private io:any;
        private listening:boolean;
        private app: any;
        private stats:any; 
        private applications: Application[];

        public constructor(options:any)
        {
            super();
            this.listening = false;
            this.server = this.createServer(options);//require('http').createServer();
            this.io = require('socket.io')(this.server);
            this.users = [];
            this.applications = [];
            
            //instance of stats
            this.stats = Stats.instance();
            this.stats.users = this.users;
            this.stats.apps = this.applications;
        }
        public addApp(app:Application):void
        {
            if(this.applications.indexOf(app)==-1)
            {
                this.applications.push(app);
            }
        }
        public removeApp(app:Application):void
        {
            var index: number;
            if((index = this.applications.indexOf(app)) !=-1)
            {
                this.applications.splice(index, 1);
            }
        }
        protected createServer(options:any):any
        {
            //log.info("createServer : "+(options.secure?"https":"http"));
            var express = require('express');
            var fs = require("fs");
            var app = express();
            var http: any;
            if(options.secure)
            {
                if (options.key) {
                    options.key = fs.readFileSync(options.key);
                }
                if (options.cert) {
                    options.cert = fs.readFileSync(options.cert);
                }
                http = require('https').createServer(options, app);
            }else
            {
                http = require('http').createServer(app);
            }
            if (options.stats) {
                // https.listen(options.stats.port);
                if (options.stats.folder) {
                    app.use(express.static(options.stats.folder));
                }
                app.get('/stats', (req, res) => {

                    try
                    {
                        res.json(this.stats.toJSON());
                        
                    }catch(error)
                    {
                        //log.error(error);
                    }
                });
            }
            return http;
        }
        public hasUser(id:string):boolean
        {
            var len:number = this.users.length;
            for(var i:number=0; i<len; i++)
            {
                if(this.users[i].id == id)
                {
                    return true;
                }
            }
            return false;
        }
        public getUser(id:string):User
        {
            var len:number = this.users.length;
            for(var i:number=0; i<len; i++)
            {
                if(this.users[i].id == id)
                {
                    return this.users[i];
                }
            }
            return null;
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
                
                //log.info("listen from port "+this.port);
            }
        }
        private _onConnection(socket:any):void {
            var user:User = new User();
            user.setSocket(new Socket(socket));
            this._bindUserEvents(user);
            this.users.push(user);
            console.log("connexion:");
            // log.info("new connection");
            // log.info(this.users);
        }
        protected _onUserChangeClass(newUser: User, user: User): void
        {
            //avoid socket dispose
            this._unbindUserEvents(user);
            user.setSocket(null);

            var index: number = this.users.indexOf(user);
            if(index != -1)
            {
                this.users[index] = newUser; 
                this._bindUserEvents(newUser);
                console.log("new user", newUser);
            }
            // log.info("on change class");
            // log.info(this.users);
            //decaler dans le temps pke le dispose(); kill les _listeners
            user.dispose();
        }
        protected _unbindUserEvents(user: User): void {
            if (user.socket)
                user.socket.off(Socket.EVENT_DATA, this._onData, this);
            user.off(Const.USER_CLASS_CHANGE, this._onUserChangeClass, this);
            user.off(Const.USER_DISCONNECTED, this._onUserDisconnected, this);
            user.off("loggued", this._onUserLoggued, this);
        }
        protected _bindUserEvents(user:User):void
        {
            if(user.socket)
                user.socket.on(Socket.EVENT_DATA, this._onData, this, user);
            user.on(Const.USER_CLASS_CHANGE, this._onUserChangeClass, this, user);
            user.on(Const.USER_DISCONNECTED, this._onUserDisconnected, this, user);
            user.on("loggued", this._onUserLoggued, this, user);
        }
        protected _onUserLoggued(user:User):void
        {
            console.log("CONNECTED", user);
        }
        protected _onUserDisconnected(user: User): void {
            var index: number = this.users.indexOf(user);
            if (index != -1) 
            { 
                this.users.splice(index, 1);
            }
            this._unbindUserEvents(user);
            //user.dispose();// is called on disconnected
          
            // log.warn("disconnected", user);
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
                            //log.warn("try to callback twice", arguments);
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
            if(this.applications)
            {
                while(this.applications.length)
                {
                    this.applications.shift().destroy();
                }
            }
            this.trigger(Server.EVENT_DESTROYED);
            while(this.users.length)
            {
                this.users.shift().destroy();
            }
            this.server.close();
            super.destroy();
        }
    }


