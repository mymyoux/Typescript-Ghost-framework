
//convert-files
import {MFunction} from "./MFunction";

    export class Timer {
        private static _timers: Timer[] = [];
        private _timeout: number = -1;
        private _isTimeout: boolean;
        private _callback: Function;
        private _delay: number;
        private _params: any[];
        private _called: number = 0;
        private _lastCall: number = -1;
        private _name: string;
        constructor(name: string, isTimeout: boolean, callback: Function, delay: number = 0, params: any[] = null) {
            this._name = name;
            this._isTimeout = isTimeout;
            this._callback = callback;
            this._delay = delay;
            this._params = params;
            Timer._timers.push(this);
        }
        public getName(): string {
            return this._name;
        }
        public isInterval(): boolean {
            return !this._isTimeout;
        }
        public isTimeout(): boolean {
            return this._isTimeout;
        }
        public start(): void {
            if (this._timeout == -1 || this._isTimeout) {
                if (this._delay < 0) {
                    throw new Error("Delay must be >= 0, maybe you are trying to use a disposed timer");
                }
                var _self: Timer = this;
                this._lastCall = Date.now();
                if (this._isTimeout) {
                    if (this._timeout != -1) {
                        clearTimeout(<any>this._timeout);
                    }
                    this._timeout = <any>setTimeout(function() {
                        _self._called++;
                        _self._timeout = -1;
                        _self._lastCall = Date.now();
                        _self._callback.apply(null, _self._params);

                    }, _self._delay);
                } else {
                    this._timeout = <any>setInterval(function() {
                        _self._called++;
                        _self._lastCall = Date.now();
                        _self._callback.apply(null, _self._params);
                    }, _self._delay);
                }
            }
        }
        public reset(): void {
            this.stop();
            if (!this._isTimeout)
                this.start();
        }
        public dispose(): void {
            this.stop();
            this._callback = null;
            this._params = null;
            this._delay = -1;

            var index: number;
            if ((index = Timer._timers.indexOf(this)) != -1) {
                Timer._timers.splice(index, 1);
            }
        }
        public stop(): void {
            if (this._timeout != -1) {
                if (this._isTimeout) {
                    clearTimeout(<any>this._timeout);
                } else {
                    clearInterval(<any>this._timeout);

                }
                this._timeout = -1;
            }
        }
        public isRunning(): boolean {
            return this._timeout != <any>-1;
        }
        public getNumberOfCalls(): number {
            return this._called;
        }
        public getTimeRemaining(): number {
            if (this.isRunning()) {
                return this._lastCall + this._delay - Date.now();
            } else {
                return Infinity;
            }
        }
        public static clearTimeout(timer: Timer): void {
            timer.stop();
            timer.dispose();
        }
        public static clearInterval(timer: Timer): void {
            timer.stop();
            timer.dispose();
        }
        public static callLater(callback: Function, instance: any = null, ...params: any[]): number {
            return Timer.setTimeout.apply(instance, ["callLater", callback, 0].concat(params));
        }
        public static applyLater(callback: Function, instance: any = null, params: any[] = null): number {
            return Timer.setTimeout.apply(instance, ["applyLater", callback, 0].concat(params));
        }
        public static setTimeout(name: string, callback: Function, delay: number, ...params: any[]): Timer {
            return new Timer(name, true, callback, delay, params);
        }
        public static setInterval(name: string, callback: Function, delay: number, ...params: any[]): Timer {
            return new Timer(name, false, callback, delay, params);
        }
        public static getNumberTimersRunning(): number {
            return Timer._timers.length;
        }
        public static getNumberTimeoutsRunning(): number {
            var quantity: number = 0;
            for (var p in Timer._timers) {
                if (Timer._timers[p].isTimeout()) {
                    quantity++;
                }
            }
            return quantity;
        }
        public static getNumberIntervalsRunning(): number {
            var quantity: number = 0;
            for (var p in Timer._timers) {
                if (Timer._timers[p].isInterval()) {
                    quantity++;
                }
            }
            return quantity;
        }
    }

