///<module="events"/>
///<module="sgamecommon"/>
///<module="utils"/>
///<file="Client"/>
namespace ghost.sgameclient
{
    import IApplicationMessage = ghost.sgamecommon.IApplicationMessage;
    import Buffer = ghost.utils.Buffer;
    import MFunction = ghost.utils.MFunction;
    import Const = ghost.sgamecommon.Const;
    import IApplicationData = ghost.sgamecommon.IApplicationData;
    export class Application extends ghost.events.EventDispatcher
    {
        private name:string;
        protected client:Client;
        private connected:boolean;
        private connecting:boolean;
        private processing:boolean;
        private buffer:any[];
        public constructor(name:string, client:Client)
        {
            super();
            this.name = name;
            this.client = client;
            this.connected = false;
            this.connecting = false;
            this.processing = false;
            this.buffer = [];
            //this.connect();
            if(this.client.isConnected())
            {
                this._onServerConnect();
            }
            this.bindEvents();
        }
        public isConnected():boolean
        {
            return this.connected && this.client.isConnected();
        }
        public connect():void
        {
            console.log("ask connect");
            if(!this.isConnected() && !this.connecting)
            {
                console.log("server connecting");
                if(!this.client.isConnected())
                {

                    this.client.connect();
                }else
                {
                    //sync client & app statsu
                    this._onServerConnect();
                }
            }
        }
        public write(command:string, data:any, callback:Function = null):void
        {
            this.buffer.push({command:command , data:data, callback:callback});
            console.log("write", this.buffer[this.buffer.length-1]);
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
                this.connecting = true;
                this.connected = true;
                //this._onApplicationConnect();
                this._enterApplication();
            }
        }
        private bindEvents():void
        {
            console.log("listen "+Const.MSG_APPLICATION+":"+this.name);
            this.client.on(Const.MSG_APPLICATION+":"+this.name, this._onData.bind(this));
            this.client.on(Const.MSG_APPLICATION+":"+Const.ALL_APP, this._onDatall.bind(this));
            this.client.on(Const.MSG_APPLICATION_INTERNAL+":"+Const.ALL_APP, this._onInternalData.bind(this));
            this.client.on(Const.MSG_APPLICATION_INTERNAL+":"+this.name, this._onInternalDataAll.bind(this));
        }
        private _onServerConnect():void
        {
            console.log("server connected");
            this.connected = true;
            this.connecting = true;
            this._enterApplication();
        }
        private _enterApplication():void
        {
            this.client.write(ghost.sgamecommon.Const.MSG_APPLICATION_IN, {app:this.name}, (success:boolean, data:any)=>
            {
                if(success)
                {
                    this.connecting = false;
                    this._onApplicationConnect();
                }else {
                    console.log("callbackresult", data);
                    if(data && data.app && data.command && data.error)
                    {
                        this.writeInternalData(data.app, data.command, data.error);
                    }else
                    {
                        this.writeInternalData(Const.LOGIN_APP, Const.LOGIN_COMMAND, data);
                    }
                    //    this.client._
                }
            });
        }
        private _onApplicationConnect():void
        {
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
                console.log("try "+name);
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
        private _onData(command:string, data:IApplicationData):void
        {
            var name:string = command+"Action";
            if(this[name] && typeof this[name] == "function")
            {
                this[name](data.data);
            }else
            {
                console.warn("["+this.name+"]"+name+" doesn't exist");
            }
        }
        private writeNext(data:any = null):void
        {
            if(!this.isConnected())
            {
                this.connect();
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
                console.log("writeNext", data);
                this.processing = true;
                var _this:Application = this;
                this.client.write(ghost.sgamecommon.Const.MSG_APPLICATION, {app:this.name, command:data.command, data:data.data}, function()
                {
                    if(_this.buffer.length && _this.buffer[0] === data)
                    {
                        if(data.callback)
                        {
                            data.callback.apply(null, arguments);
                        }
                        _this.processing = false;
                        _this.buffer.shift();
                        _this.writeNext();
                    }
                });
            }
        }
    }
}