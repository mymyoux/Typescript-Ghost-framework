///<file="Application"/>
///<file="Client"/>
///<file="Room"/>
///<file="IUser"/>
namespace ghost.sgameclient {
    import Client = ghost.sgameclient.Client;
    import Application = ghost.sgameclient.Application;
	import Room = ghost.sgameclient.Room;
	import IUser = ghost.sgameclient.IUser;
	import IApplicationData = ghost.sgamecommon.IApplicationData;
    export class GameApplication extends Application {
		private static COMMAND_ECHO: string = "echo";
		/**
		 * Current ping
		 * @type {number}
		 */
		protected ping: number;
		/**
		 * Is if first ping? use to correct first ping call
		 * @type {boolean}
		 */
		protected _firstPing: boolean;
		/**
		 * Last ten pings
		 * @type {number[]}
		 */
		protected pings: number[];
		/**
		 * Half ping value of best server time offset calculation
		 * @type {number}
		 */
		protected serverTimePrecision: number;
		/**
		 * Server time offset
		 * @type {number}
		 */
		protected serverTimeOffset: number;
		/**
		 * Constructor
		 * @param {string} name   Application's name
		 * @param {Client} client Client
		 */
         public constructor(name:string, client:Client)
        {
            super(name, client);
            this.pings = [];
            this.serverTimePrecision = Number.MAX_VALUE;
            this.serverTimeOffset = 0;
            this._firstPing = true;
        }
        /**
         * Echo method.
         * Calcul ping + server offset time
         */
        public echo() {
			var t1: number = Date.now();
			this.write(GameApplication.COMMAND_ECHO, t1, (success: boolean, timestamp: number) => {
				var t2: number = Date.now();
				var ping: number = (t2 - t1) / 2;

				if (ping < this.serverTimePrecision) {
					this.serverTimeOffset = -(t2 - timestamp + ping);
					this.serverTimePrecision = ping;
				}
				var len: number;
				if (!this._firstPing)
				{
					this.pings.push(ping);
					if (this.pings.length > 10) {
						this.pings.shift();
					}
					len = this.pings.length;
					var sum: number = 0;
					for (var i: number = 0; i < len; i++) {
						sum += this.pings[i];
					}
					this.ping = parseFloat((sum / len).toFixed(2));
				}else
				{
					this._firstPing = false;
					len = 0;
				}
				
				if (len < 10) {
					setTimeout(this.echo.bind(this), 10);
				}
				else {
					setTimeout(this.echo.bind(this), 5000);
				}
				this.trigger("change");
			});
        }
        /**
         * Allows to convert a local timestamp to a server timestamp from any data
         * @param  {any} data data to check
         * @return {any}      data with timestamp changed
         */
        protected timeLocalToServer(data: any): any {
			if (typeof data == "number") {
				//TODO:better recognition of timestamp
				if (data > 1462799786590 && data < 1602799786590) {
					data = data + this.serverTimeOffset;
				}
			}
			if (typeof data == "object") {
				for (var p in data) {
					data[p] = this.timeLocalToServer(data[p]);
				}
			}
			return data;
        }
        /**
         * Allows to convert a server timestamp to a local timestamp from any data
         * @param  {any} data data to check
         * @return {any}      data with timestamp changed
         */
        protected timeServerToLocal(data: any): any {
			if (typeof data == "number") {
				//TODO:better recognition of timestamp
				if (data > 1462799786590 && data < 1602799786590) {
					data = data - this.serverTimeOffset;
				}
			}
			if (typeof data == "object") {
				for (var p in data) {
					data[p] = this.timeServerToLocal(data[p]);
				}
			}
			return data;
        }
        /**
         * Handle callback call data
         * @param  {any} request Original request
         * @param  {any} data    Data sent
         * @return {any}         Data with converted timestamp
         */
        protected postDataCallbackTreatment(time:number, request:any, data:any):any
        {
        	if(request && request.command == GameApplication.COMMAND_ECHO)
        	{
				return data;
        	}
			var ping: number = Date.now() - time;
			return this.timeServerToLocal(data);
        }
		protected _onData(command: string, data: IApplicationData): void {
			if(data && data.data)
			{
				data.data = this.timeServerToLocal(data.data);
			}
			console.log(data);
			debugger;
			return super._onData(command, data);
        }
        /**
         * write + automatic timestamp conversion
         * @inheritDoc
         */
        public write(command: string, data: any, callback: Function = null): void {
			if (command != GameApplication.COMMAND_ECHO) {
				data = this.timeLocalToServer(data);
			}
            return super.write(command, data, callback);
        }
        /**
         * write + automatic timestamp conversion
         * @inheritDoc
         */
        public writeRoom(room: Room, command: string, data: any, callback: Function = null): void {
			data = this.timeLocalToServer(data);
            return super.writeRoom(room, command, data, callback);
        }
        /**
         * write + automatic timestamp conversion
         * @inheritDoc
         */
        public writeRoomUser(room: Room, user: IUser, command: string, data: any, callback: Function = null): void {
			data = this.timeLocalToServer(data);
            return super.writeRoomUser(room, user, command, data, callback);
        }
    }
}
