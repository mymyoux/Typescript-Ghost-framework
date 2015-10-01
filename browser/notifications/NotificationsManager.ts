///<lib="jquery"/>
module ghost.browser.notifications
{
    /**
     * Manage notifications
     */
    export class NotificationsManager
    {
        protected static _instance:NotificationsManager;
        protected _notifications:any;
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
            this.listen();
        }
        public listen():void
        {
            $(document).on("mousedown","[data-notification]", this._listenClick);
        }
        public unlisten():void
        {
            $(document).off("mousedown","[data-notification]", this._listenClick);
        }
        protected listenClick(event:any):void
        {
            console.log("click:"+$(event.currentTarget).attr("data-notification"), event);
            this.clearNotification($(event.currentTarget).attr("data-notification"));
        }
        public config(name:string, config:IConfigNotification):void
        {
            if(config)
            {
                config.name = name;
            }
            return this.notification(name).config(config);
        }
        public notification(name:string):Notification
        {
            if(! this.notifications[name])
            {
                this.notifications[name] = Notification.getDefault(name);//0;
            }

            return this.notifications[name];
        }

        public addNotification(name:string, inc:number = 1):void
        {
            return this.notification(name).add(inc);
        }
        public setNotification(name:string, value:any):void
        {
            return this.notification(name).add(value);
        }
        public clearNotification(name:string):void
        {
            return this.notification(name).clear();
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
    export class Notification
    {
        public static TYPE_NUMERIC:string = "numeric";
        public static TYPE_STRING:string = "string";
        public value:any;
        public name:string;
        public min:number = null;
        public max:number = null;
        public last:any;
        public diff:any;
        public type:string;
        public static getDefault(name:string, type:string = Notification.TYPE_NUMERIC):Notification
        {
            var notification:Notification = new Notification();
            notification.name = name;
            if(!type || type == Notification.TYPE_NUMERIC)
            {
                notification.type = Notification.TYPE_NUMERIC;
                notification.min = 0;
                notification.value = 0;
            }else if(type == Notification.TYPE_STRING)
            {
                notification.type = Notification.TYPE_STRING;
            }
            return notification;
        }
        public config(config:IConfigNotification):void
        {
            for(var p in config)
            {
                this[p] = config[p];
            }
        }
        public add(value:number):void
        {
            if(this.type != Notification.TYPE_NUMERIC)
            {
                throw new Error("Add function can only be used on numeric notifications");
            }
            this.set(this.value+value);
        }
        public remove(value:number):void
        {
            if(this.type != Notification.TYPE_NUMERIC)
            {
                throw new Error("Add function can only be used on numeric notifications");
            }
            this.set(this.value-value);
        }
        public set(value:any):void
        {
            this.last = this.value;
            if(this.type == Notification.TYPE_NUMERIC)
            {
                if(this.min != undefined && value<this.min)
                {
                    value = this.min;
                }
                if(this.max != undefined && value>this.max)
                {
                    value = this.max;
                }
                this.diff = value - this.value;
                this.value = value;
                if(this.value == 0)
                {
                    this.clear();
                }else
                {
                    this.update();
                }
            }else if(this.type == Notification.TYPE_STRING)
            {
                this.last = this.value;
                this.value = value;
                if(this.value == null)
                {
                    this.clear();
                }else
                {
                    this.update();
                }
            }
        }
        public update():void
        {
            var $notifications:JQuery = $(document).find("[data-notification='"+this.name+"']");
            $notifications.attr("data-notification-value", this.value);

            if(this.last != null)
            {
                $notifications.attr("data-notification-last", this.last);
            }
            if(this.type == Notification.TYPE_NUMERIC)
            {
                $notifications.attr("data-notification-diff", this.diff);
            }
        }
        public clear():void
        {
            if(this.type == Notification.TYPE_NUMERIC)
            {
                this.value = 0;
            }else
            {
                this.value = null;
            }
            this.last = null;
            var $notifications:JQuery = $(document).find("[data-notification='"+this.name+"']");
            $notifications.removeAttr("data-notification-value");
            $notifications.removeAttr("data-notification-last")
            $notifications.removeAttr("data-notification-diff")
        }
    }
    export interface IConfigNotification
    {
        min?:number;
        max?:number;
        type?:string;
        name?:string;
    }
}