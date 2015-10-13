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
        protected _listenAdd:any;

        protected _muted:boolean;
        public constructor()
        {
            this._muted = false;
            NotificationsManager._instance = this;
            this.notifications = {};
            this._listenClick = this.listenClick.bind(this);
            this._listenAdd = this.listenAdd.bind(this);
            this.listen();
        }
        public listen():void
        {
            $(document).on("mousedown","[data-notification]", this._listenClick);
            $(document).on("DOMNodeInserted","*", this._listenAdd);
        }
        public unlisten():void
        {
            $(document).off("mousedown","[data-notification]", this._listenClick);
            $(document).off("DOMNodeInserted","[data-notification]", this._listenAdd);
        }
        protected listenClick(event:any):void
        {
            this.clearNotification($(event.currentTarget).attr("data-notification"));
        }
        protected listenAdd(event:any):void
        {
            if(this._muted)
            {
                return;
            }
            var $target:JQuery = $(event.currentTarget);
            if($target.prop("tagName")=="BODY" || $target.prop("tagName")=="HTML")
            {
                return;
            }
            var $notications:JQuery = $target.find("[data-notification]").addBack("[notification]");
            var name:string = $notications.attr("data-notification");

            if(name)
            {
                this._muted = true;
                this.notification(name).update();
                this._muted = false;
            }
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

        public addNotification(name:string, object:any):void;
        public addNotification(name:string, inc:number):void;
        public addNotification(name:string, inc:any = 1):void
        {
            this._muted = true;
            this.notification(name).add(inc);
            this._muted = false;
        }
        public removeNotification(name:string, object:any):void;
        public removeNotification(name:string, inc:number):void;
        public removeNotification(name:string, inc:any = 1):void
        {
            this._muted = true;
            this.notification(name).remove(inc);
            this._muted = false;
        }
        public setNotification(name:string, value:any):void
        {
            this._muted = true;
             this.notification(name).add(value);
            this._muted = false;
        }
        public clearNotification(name:string):void
        {
            this._muted = true;
            this.notification(name).clear();
            this._muted = false;
        }
        public dispose():void
        {
            this._muted = true;
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
        public static VALUE_CONTAINER:string = "container";
        public static VALUE_SIMPLE:string = "simple";
        public value:any;
        public name:string;
        public min:number = null;
        public max:number = null;
        public last:any;
        public diff:any;
        public type:string;
        public value_system:string;
        protected container:any[];
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
            notification.value_system = Notification.VALUE_SIMPLE;
            return notification;
        }
        public constructor()
        {
            this.container = [];
        }
        public config(config:IConfigNotification):void
        {
            for(var p in config)
            {
                this[p] = config[p];
            }
        }
        public add(value:any):void;
        public add(value:number):void;
        public add(value:any):void
        {
            if(typeof value == "object")
            {
                if(this.container.indexOf(value)==-1)
                {
                    this.container.push(value);
                    this.set(this.value+1);
                }
                return;
            }
            if(this.type != Notification.TYPE_NUMERIC)
            {
                throw new Error("Add function can only be used on numeric notifications");
            }
            this.set(this.value+value);
        }
        public remove(value:any):void;
        public remove(value:number):void;
        public remove(value:any):void
        {
            if(this.value_system == Notification.VALUE_CONTAINER)
            {
                var index:number;
                if((index=this.container.indexOf(value))!=-1)
                {
                    this.container.splice(index, 1);
                    this.set(this.value-1);
                }
                return;
            }
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
                this.update();
            }else if(this.type == Notification.TYPE_STRING)
            {
                this.last = this.value;
                this.value = value;
                this.update();
            }
        }
        public update():void
        {
            if(this.value == 0 || this.value == null)
            {
                return this.clear();
            }

            var $notifications:JQuery = $(document).find("[data-notification='"+this.name+"']");
            var $notificationClasses:JQuery = $notifications.find(".data-notification-value").addBack(".data-notification-value");
            $notifications.attr("data-notification-value", this.value);
            $notificationClasses.text(this.value);
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
            this.container.length = 0;
            if(this.type == Notification.TYPE_NUMERIC)
            {
                this.value = 0;
            }else
            {
                this.value = null;
            }
            this.last = null;
            var $notifications:JQuery = $(document).find("[data-notification='"+this.name+"']");
            var $notificationClasses:JQuery = $notifications.find(".data-notification-value").addBack(".data-notification-value");
            $notificationClasses.text("");
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
        value_system?:string;
    }
}