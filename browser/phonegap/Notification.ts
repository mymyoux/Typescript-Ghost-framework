///<lib="phonegap-push"/>
///<module="framework/ghost/events"/>
namespace ghost.phonegap
{
    /**
     * @private
     */
    export class _Notification extends ghost.events.EventDispatcher
    {
        public EVENT_REGISTRATION: string = "registration";
        public EVENT_NOTIFICATION: string = "notification";
        public EVENT_ERROR: string = "error"; 
        private _notifier:any;
        protected _push: PhonegapPluginPush.PushNotification = null;
        protected _registrationID: string;
        /**
         * 
         * Constructor
         */
        constructor()
        {
            super();
                   
        }
        protected notifier()
        {
            if (!this._notifier)
                this._notifier = ROOT.navigator["notification"]; 
            return this._notifier; 
        }
        public listenPush():void
        { 
            if (!this._push)
            {
                var phonegap: any = ghost.data.Configuration.get("phonegap");
                if(!phonegap)
                {
                    console.error("no phonegap config");
                    debugger;
                    return;
                }
                if (!ROOT.PushNotification)
                {
                    console.error("no phonegap env");
                    return;
                }
                this._push = ROOT.PushNotification.init(phonegap);
                this._push.on(this.EVENT_REGISTRATION, this.onRegistration.bind(this));
                this._push.on(this.EVENT_NOTIFICATION, this.onNotification.bind(this));
                this._push.on(this.EVENT_ERROR, this.onError.bind(this));
            }
        }
        public on(name: string, callback: Function, scope?: any, ...parameters: any[]): void {
            super.on.apply(this, Array.prototype.slice.call(arguments));
            if (name == this.EVENT_REGISTRATION && this._registrationID != null && callback)
            {
                var params: any = [this._registrationID];
                if(parameters)
                {
                    params = params.concat(parameters);
                }
                callback.apply(scope, params);
            }
        }
        public once(name: string, callback: Function, scope?: any, ...parameters: any[]): void {
            if (name == this.EVENT_REGISTRATION && this._registrationID != null) {
                var params: any = [this._registrationID];
                if (parameters) {
                    params = params.concat(parameters);
                }
                callback.apply(scope, params);
                return;
            }
            super.once.apply(this, Array.prototype.slice.call(arguments));
        }
        protected onRegistration(data:any):void
        {
            this._registrationID = data.registrationId;
            if(this._registrationID)
                this.trigger(this.EVENT_REGISTRATION, this._registrationID);
            console.log("push:registration:", data);
        }
        protected onNotification(data: any): void
        {
            if (data.additionalData && data.additionalData.type)
            {
                this.trigger(this.EVENT_NOTIFICATION + ":" + data.additionalData.type, data);
            }else
                this.trigger(this.EVENT_NOTIFICATION, data);
            console.log("push:notification:", data);
            if (data.additionalData.test_notification)
            {
                this.alert(data.additionalData.test_notification);
            }
        }
        protected onError(error: any): void
        {
            this.trigger(this.EVENT_ERROR, error);
            console.log("push:error:", error);
        }
        /**
         * Shows a custom alert or dialog box.
         * @param message {string} Dialog message
         * @param alertCallback {function} Callback to invoke when alert dialog is dismissed.
         * @param title {string} Dialog title. Optional, Default: "Alert".
         * @param buttonName {string} Button name. Optional, Default: "OK".
         */
        public alert(message:string, alertCallback:Function = null, title:string = "Alert", buttonName:string = "OK"):void
        {
            if (this.notifier() && this.notifier().alert)
            {
                console.log("natif");
                this.notifier().alert(message, alertCallback, title, buttonName);
            }else
            {
                console.log("emulated"); 
                alert(message);
                if(alertCallback)
                {
                    alertCallback();
                }
            }
        }
        /**
         * Shows a customizable confirmation dialog box
         * @param message {string} Dialog message
         * @param confirmCallback {function}  Callback to invoke with index of button pressed (1, 2 or 3) or when the dialog is dismissed without a button press (0)
         * @param title {string} Dialog title. Optional, Default: "Confirm"
         * @param buttonLabels {string} Comma separated string with button labels. Optional, Default: "OK,Cancel".
         */
        public confirm(message:string, confirmCallback:Function = null, title:string = "Confirm", buttonLabels:string[] = ["OK","Cancel"]):void
        {
            if(this.notifier() && this.notifier().confirm)
            {
                 this.notifier().confirm(message, confirmCallback, title, buttonLabels.join(","));
            }else
            {
                confirm(message);
                if(confirmCallback)
                {
                    confirmCallback();
                }
            }
           
        }
        /**
         * The device will play a beep sound.
         * @param times {int}
         */
        public beep(times:number):void
        {
            if(this.notifier() && this.notifier().beep)
                this.notifier().beep(times);
            else
            {
                console.warn("No beep API available");
            }
        }
        /**
         * Vibrates the device for the specified amount of time.
         * @param milliseconds {number}
         */
        public vibrate(milliseconds:number):void
        {
            if(this.notifier() && this.notifier().vibrate)
                this.notifier().vibrate(milliseconds);
            else
            {
                console.warn("No vibration API available");
            }
        }
    }
    /**
     * Notification manager
     * @type Notification
     */
    export var Notification:_Notification = ghost.core.Hardware.isBrowser()?new _Notification():null;
}
