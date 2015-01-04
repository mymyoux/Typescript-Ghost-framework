
module ghost.phonegap
{
    /**
     * @private
     */
    export class _Notification/* extends ghost.events.EventDispatcher*/
    {
        private _notifier:any;
        /**
         * Constructor
         */
        constructor()
        {
            //super();
            this._notifier = ROOT.navigator["notification"];
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
            if(this._notifier && this._notifier.alert)
            {
                this._notifier.alert(message, alertCallback, title, buttonName);
            }else
            {
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
            if(this._notifier && this._notifier.confirm)
            {
                 this._notifier.confirm(message, confirmCallback, title, buttonLabels.join(","));
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
            if(this._notifier && this._notifier.beep)
                this._notifier.beep(times);
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
            if(this._notifier && this._notifier.vibrate)
                this._notifier.vibrate(milliseconds);
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