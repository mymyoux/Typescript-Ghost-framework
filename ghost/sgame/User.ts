///<module="events"/>
///<file="Socket"/>
namespace ghost.sgame
{
    export class User extends ghost.events.EventDispatcher
    {
        private rights:string[];
        public socket:Socket;
        private apps:any;
        private rooms:any;
        public id:string;
        public login:string;
        public constructor()
        {
            super();
            this.rights = [];
            this.apps = {};
            this.rooms = {};
        }
        public hasApp(name:string):boolean
        {
            return this.apps[name] != undefined;
        }
        public addApp(name:string):void
        {
            this.apps[name] = true;
        }
        public removeApp(name:string):void
        {
            delete this.apps[name];
        }
        public addRoom(name:string):void
        {
            this.rooms[name] = true;
        }
        public removeRoom(name:string):void
        {
            delete this.rooms[name];
        }
        public addRight(right:string):void{
            if(this.rights.indexOf(right)==-1)
                this.rights.push(right);
        }
        public removeRight(right:string):void
        {
            var index:number = this.rights.indexOf(right);
            if(index!=-1){
                this.rights.splice(index, 1);
            }
        }
        public isAllowed(right:string):boolean
        {
            return this.rights.indexOf(right)!=-1;
        }
        public destroy():void
        {
            this.socket.destroy();
            super.destroy();
        }
    }
}