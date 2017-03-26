namespace ghost.browser.navigation {
   
    /**
     * Navigation Event. Used to cancel current page change
     * @type {NavigationEvent}
     */
    export class NavigationEvent {
        /**
         * @private
         */
        private _cancelled: boolean;
        public previous: string;
        public next: string;
        public params: any;
        /**
        * Constructor
        * @private
        */
        constructor() {
            this._cancelled = false;
        }
        /**
         * Cancels the current change
         */
        public cancel(): void {
            this._cancelled = true;
        }
        /**
         * Check if the change is cancelled
         * @returns {boolean}
         */
        public isCancelled(): boolean {
            return this._cancelled;
        }
        /**
         * Reset the initial state
         * @private
         */
        public _uncancel(): void {
            this._cancelled = false;
        }
    }

}
