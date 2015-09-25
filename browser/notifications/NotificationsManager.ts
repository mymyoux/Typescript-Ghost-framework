///<lib="jquery"/>
module ghost.browser.notifications
{
    /**
     * Manage notifications
     */
    export class NotificationsManager
    {
        private static _instance:NotificationsManager;

        public static instance():NotificationsManager
        {
            if(!NotificationsManager._instance)
            {
                NotificationsManager._instance = new NotificationsManager();
            }
            return NotificationsManager._instance;
        }

        protected notifications:any;
        protected _listenClick:any;

        public constructor()
        {
            NotificationsManager._instance = this;
            this.notifications = {};
            this._listenClick = this.listenClick.bind(this);
        }
        public listen():void
        {
            $(document).on("click","[data-notification]", this._listenClick);
        }
        public unlisten():void
        {
            $(document).off("click","[data-notification]", this._listenClick);
        }
        protected listenClick(event:any):void
        {
            this.clearNotification($(event.target).attr("data-notification"));
        }
        public addNotification(name:string, inc:number = 1):void
        {
            if(! this.notifications[name])
            {
                this.notifications[name] = 0;
            }
            return this.setNotification(name, this.notifications[name]+inc);
        }
        public setNotification(name:string, value:any):void
        {
            this.notifications[name] = value;
            $(document).find("[data-notification='"+name+"']").attr("data-notification-value", value);
        }
        public clearNotification(name:string):void
        {
            delete this.notifications[name];
            $(document).find("[data-notification='"+name+"']").removeAttr("data-notification-value");
        }
        public dispose():void
        {
            this.unlisten();
            this.notifications = null;
            this._listenClick = null;
            if(this === NotificationsManager._instance)
            {
                NotificationsManager._instance = null;
            }
        }

    }
}