///<module="events"/>
///<file="Socket"/>
namespace ghost.sgame
{
    export class User extends ghost.events.EventDispatcher
    {
        private rights:string[];
        public socket:Socket;
        private apps:any;
        public id:string;
        public login:string;
        public constructor()
        {
            super();
            this.rights = [];
            this.apps = {};
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