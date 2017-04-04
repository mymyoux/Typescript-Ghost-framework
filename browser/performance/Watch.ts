//convert
 /* ghost.utils.Objects.*/
import {Objects} from "ghost/utils/Objects";
//convert
 /* ghost.core.Root.*/
import {Root} from "ghost/core/Root";

///<module="framework/ghost/utils"/>
///<module="framework/browser/api"/>


    //convert-import
import {BufferFunction} from "ghost/utils/BufferFunction";
    //convert-import
import {Buffer} from "ghost/utils/Buffer";
    //convert-import
import {API} from "browser/api/API";
    //convert-import
import {APIExtended} from "browser/api/APIExtended";
    export class Watch
    {
        protected static _registered: any[];
        protected static _buffer: BufferFunction;
        public static promise(promise:Promise<any>):void
        {

            var time:number = this.now();

            var _self:any = this;
            promise.then(function()
            {
                var args:any = arguments;
                if(arguments.length == 1)
                {
                    args = arguments[0];
                }
                console.log("monitor done:"+ (_self.now()-time), args, promise);
            }, function()
            {
                console.error("monitor error done:"+ (_self.now()-time), arguments, promise);
            });

        }
        private static now():number{
            return Root.getRoot()["performance"] && Root.getRoot()["performance"].now?Root.getRoot()["performance"].now():Date.now();
        }
        private static addWatch(watch:any):void
        {
            if(Watch._registered == undefined)
            {    
                Watch._registered = [];
                Watch._buffer = Buffer.throttle(Watch.onSend, 5000);
            }
            Watch._registered.push(watch);
            Watch._buffer();
        }
        private static onSend():void
        {
            var data: any[] = Watch._registered.slice();
            Watch._registered.length = 0;
            if(data && data.length)
                APIExtended.request().always(false).controller("statistics").action("watch").method("POST").param("stats", data).done(); 
        }

        protected _start: number;
        protected _stop: number;
        protected _name: string;
        protected _type: string;
        protected _mark: boolean;
        public constructor(name:string, type?:string)
        {
            this._name = name;
            this._type = type;
        } 
        public start():void
        {
            this._start = Watch.now();
            if (this._mark)
            {
                window.performance.mark("start-"+(this._type?this._type+'-':'')+this._name);
            }
        }
        public cancel():void
        {
            delete this._start;
        }
        public stop(data?:any): void {
            if(this._start == undefined)
            {
                return;   
            }
            this._stop = Watch.now();
            Watch.addWatch(this.getResult(data));
            if (this._mark) {
               window.performance.mark("stop-" + (this._type ? this._type + '-' : '') + this._name);
               window.performance.measure((this._type ? this._type + '-' : '') + this._name + " (" + ((((this._stop - this._start)*100)|0)/100)+"ms)", "start-" + (this._type ? this._type + '-' : '') + this._name, "stop-" + (this._type ? this._type + '-' : '') + this._name);
            }
        }
        public mark():void
        {
            if (window.performance && window.performance.mark && window.performance.measure)
                this._mark = true;
        }
        protected getResult(data:any):any 
        {
            return Objects.merge({ name: this._name, time: (this._stop-this._start)|0, date:Date.now(), type:this._type }, data);
        }
    }
