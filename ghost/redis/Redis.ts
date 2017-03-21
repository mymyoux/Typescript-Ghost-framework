///<lib="node"/>
///<module="events"/>
namespace ghost.redis {
    var redis = require("redis");
    export class Redis extends ghost.events.EventDispatcher {
        public static EVENT_CONNECTED: string = "connected";
        public static EVENT_ERROR: string = "error";
        public static EVENT_DISCONNECTED: string = "disconnected";
        private static _instance: Redis;


        public static instance(): Redis {
            if (!Redis._instance) {
                Redis._instance = new Redis();
            }
            return Redis._instance;
        }
        protected redis: any;
        protected connected: boolean;
        protected watched: any = {};
        public constructor() {
            super();
            this.connected = false;
        }
        public config(options: any): void {
            var connectionOptions: any[] = [];
            if(options.unix_socket)
            {
                connectionOptions.push(options.unix_socket);
            }else
            {
                if(options.port)
                {
                    connectionOptions.push(options.port);
                }
                if(options.host)
                {
                    connectionOptions.push(options.host);
                }
            }
            if(options.connectionOptions)
            {
                connectionOptions.push(options.connectionOptions);
            }
            this.redis = redis.createClient.apply(null, connectionOptions);//(options.ip, options.port);
            this.redis.on("connect", this.onConnect.bind(this));
            this.redis.on("error", this.onError.bind(this));  
            this.redis.on("end", this.onClose.bind(this));
        }
        public onConnect() {
            this.connected = true;
            console.log("Redis - connected");
            this.trigger(Redis.EVENT_CONNECTED);
        }
        public onError(error) {
            console.error("Redis error - ", error);
            this.trigger(Redis.EVENT_ERROR, error);
        }
        public onClose() {
            this.connected = false;
            console.log("Redis - closed");
            this.trigger(Redis.EVENT_DISCONNECTED);
        }
        public set(key:string, value:any):void
        {
            this.redis.set(key, value);
        }
       
        public get(key:string, callback:any):void
        {
            this.redis.get(key, callback);
        }
       
    }
}
