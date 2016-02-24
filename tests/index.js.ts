namespace ghost
{
    export class _Constant
    {
        public debug:boolean = true;
        public cordovaEmulated:boolean = false;
    }
    export var constants:_Constant = new _Constant();
}
///<lib="node"/>


/*

window.onerror = function(err, url, line){
    alert(err + '\n on page: ' + url + '\n on line: ' + line);
};*/
namespace ghost.core
{
    /**
     * CoreObject
     */
    export class CoreObject 
    {
        /**
         * Classname
         */
        private _className:string;
        private __instance:number;
        private static __id:number = 0;
        constructor()
        {
            //TODO:remove instances
            this.__instance = CoreObject.__id++;//ghost.utils.Maths.getUniqueID();
        }
        /**
         * Gets current Classname
         * @returns {string}
         */
        public getClassName()
        {
            if(this._className == undefined)
            {
                if(this["constructor"]["name"])
                {
                    this._className = this["constructor"]["name"];
                }else
                {
                    var funcNameRegex = /function (.{1,})\(/;
                    var results  = (funcNameRegex).exec(this["constructor"].toString());
                    this._className = (results && results.length > 1) ? results[1] : "";
                }
            }
            return this._className;
        }
        public getFullClassName():string
        {
            throw new Error("you must implement getFullClassName method before using it");
            return null;
        }
        public getUniqueInstance():number
        {
            return this.__instance;
        }
    }
}

namespace ghost.core
{

    //TODO:try to removes phonegap dependency
    export interface IHardware
    {
        cordovaVersion:any;
        os:string;
        uuid:string;
        osVersion:string;
        android:boolean;
        blackberry:boolean;
        ios:boolean;
        mobile:boolean;
        windowsPhone:boolean;
        screenWidth:number;
        screenHeight:number;
        orientation:number;
        landscape:boolean;
        portrait:boolean;
        browser:string;
        cookie:string;
    }
    /**
     * Hardware manager
     * @type Events
     */
    export class Hardware
    {
        public static isNode():boolean
        {
            return ROOT._isNode;
        }
        public static isBrowser():boolean
        {
            return !ROOT._isNode;
        }
        public static OS_NODE:string = "Node_Environment";
        /**
         * Android Operating System
         * @type {string}
         */
        public static OS_ANDROID:string = "Android";
        /**
         * iOS Operating System
         * @type {string}
         */
        public static OS_IOS:string = "iOS";
        /**
         * BlackBerry Operating System
         * @type {string}
         */
        public static OS_BlackBerry:string = "BlackBerry";
        /**
         * Windows Phone 7 Operating System
         * @type {string}
         */
        public static OS_WINDOWS_PHONE_7:string = "WinCE";
        /**
         * Windows Phone 8 Operating System
         * @type {string}
         */
        public static OS_WINDOWS_PHONE_8:string = "Win32NT";
        /**
         * Other OS Web(for outside phonegap compatibility)
         * @type {string}
         */
        public static OS_Website:string = "Other OS website";
        /**
         * Other OS (for outside phonegap compatibility)
         * @type {string}
         */
        public static OS_OTHER:string = "Other OS";
        /**
         * Mac OS X
         * @type {string}
         */
        public static OS_MAC_OS_X:string = "Mac OS X";
        /**
         * Linux
         * @type {string}
         */
        public static OS_LINUX:string = "Linux";
        /**
         * Desktop Windows
         * @type {string}
         */
        public static OS_WINDOW_DESKTOP:string = "Windows Desktop";

        /**
         * Get the version of Cordova running on the device.
         * @returns {*}
         */
        public static getCordovaVersion():any
        {
            return ROOT.device?ROOT.device.cordova:0;
        }
        /**
         * Gets app version
         */
        public static getAppVersion():string
        {
            return "%version%";
        }
        /**
         * Get the device's operating system name.
         * @returns {string}
         */
        public static getOS():string
        {
            if(ROOT.device)
            {
                return ROOT.device.platform;
            }
            var agent = ROOT && ROOT.navigator && ROOT.navigator.userAgent?navigator.userAgent.toLowerCase():"node";
            if(agent.indexOf("android")!=-1)
            {
                return Hardware.OS_ANDROID;
            }else
            if(agent.indexOf("windows ce")!=-1)
            {
                return  Hardware.OS_WINDOWS_PHONE_7;
            }else
            if(agent.indexOf("windows phone")!=-1)
            {
                return  Hardware.OS_WINDOWS_PHONE_8;
            }else
            if(agent.indexOf("blackberry")!=-1)
            {
                return  Hardware.OS_BlackBerry;
            }else
            if(agent.indexOf("iphone")!=-1 || agent.indexOf("ipod")!=-1)
            {
                return  Hardware.OS_IOS;
            }else
            if(agent.indexOf("node")!=-1)
            {
                return Hardware.OS_NODE;
            }else
            if(agent.indexOf("mac os x")!=-1)
            {
                return Hardware.OS_MAC_OS_X;
            }else
            if(agent.indexOf("linux")!=-1)
            {
                return Hardware.OS_LINUX;
            }else
            if(agent.indexOf("windows nt")!=-1)
            {
                return Hardware.OS_WINDOW_DESKTOP;
            }else
            {
                return  Hardware.OS_Website;
            }
            return null;
        }
        public static getBrowser():string
        {
            var ua= navigator.userAgent, tem,
                M= ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
            if(/trident/i.test(M[1])){
                tem=  /\brv[ :]+(\d+)/g.exec(ua) || [];
                return 'IE '+(tem[1] || '');
            }
            if(M[1]=== 'Chrome'){
                tem= ua.match(/\bOPR\/(\d+)/);
                if(tem!= null) return 'Opera '+tem[1];
            }
            M= M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
            if((tem= ua.match(/version\/(\d+)/i))!= null) M.splice(1, 1, tem[1]);
            return M.join(' ');

        }
        //TODO:correct these
        public static getLocale():string
        {
            return Hardware.getLanguage()+"_"+Hardware.getLanguage().toUpperCase();
        }
        public static getLanguage():string
        {
            return ROOT && ROOT.navigator && ROOT.navigator.language?ROOT.navigator.language:"en";
        }
        /**
         * Get the device's Universally Unique Identifier (UUID).
         * @returns {string}
         */
        public static getUUID():string
        {
            return ROOT.device?ROOT.device.uuid:"uuid";
        }
        /**
         * Get the operating system version.
         * @returns {string}
         */
        public static getOSVersion():string
        {
            return ROOT.device?ROOT.device.version:"unkown";
        }
        /**
         * Get the device's model name.
         * @returns {string}
         */
        public static getModel():string
        {
            return ROOT.device?ROOT.device.model:"unkown";
        }
        /**
         * Specifies if the current device is iOS Device
         * @returns {boolean}
         */
        public static isIOS():boolean
        {
            return Hardware.getOS() == Hardware.OS_IOS;
        }
        /**
         * Specifies if the current device is Android Device
         * @returns {boolean}
         */
        public static isAndroid():boolean
        {
            return Hardware.getOS() == Hardware.OS_ANDROID;
        }
        /**
         * Specifies if the current device is a website (emulated)
         * @returns {boolean}
         */
        public static isWebsite():boolean
        {
            var os:string =  Hardware.getOS();
            return os == Hardware.OS_Website || os == Hardware.OS_LINUX || os == Hardware.OS_WINDOW_DESKTOP || os == Hardware.OS_MAC_OS_X;
        }
        /**
         * Specifies if the current device is BlackBerry Device
         * @returns {boolean}
         */
        public static isBlackBerry():boolean
        {
            //TODO:manages cases when blackberry returns phone version instead of plateform's name
            return Hardware.getOS() == Hardware.OS_BlackBerry;
        }
        /**
         * Specifies if the current device is Windows Phone Device
         * @returns {boolean}
         */
        public static isWindowsPhone():boolean
        {
            return Hardware.getOS() == Hardware.OS_WINDOWS_PHONE_7 || Hardware.getOS() == Hardware.OS_WINDOWS_PHONE_8;
        }
        /**
         * Specifies if the current device is a smartphone
         * @returns {boolean}
         */
        public static isMobile():boolean
        {
            return Hardware.isAndroid() || Hardware.isIOS() || Hardware.isBlackBerry() || Hardware.isWindowsPhone();
        }
        /**
         * Gets screen height in pixels
         * @returns {Number}
         */
        public static getScreenHeight():number
        {
            return ROOT.innerHeight;
        }
        /**
         * Gets screen width in pixels
         * @returns {Number}
         */
        public static getScreenWidth():number
        {
            return ROOT.innerWidth;
        }
        /**
         * Gets screen orientation
         * @returns {Number} 0 = portrait, 90 = landscape rotated to left, 180 = portrait upside down, -90 = landscape rotated to right
         */
        public static getOrientation():number
        {
            return ROOT["orientation"];
        }
        /**
         * Gets pixel ratio. 1 = 160 dpi, 2 = 320 dpi...
         * @returns {number}
         */
        public static getPixelRatio():number
        {
            return ROOT.devicePixelRatio;
        }
        /**
         * Gets dpi
         * @returns {number}
         */
        public static getDPI():number
        {
            return 160*ROOT.devicePixelRatio;
        }
        /**
         * Checks if the device is currently on portrait mode
         * @returns {boolean}
         */
        public static isPortrait():boolean
        {
            return ROOT["orientation"] %180 == 0;
        }
        /**
         * Checks if the device is currently on landscape mode
         * @returns {boolean}
         */
        public static isLandscape():boolean
        {
            return !Hardware.isPortrait();
        }
        /**
         * Main device's data to object
         * @returns {object}
         */
        public static toObject():IHardware
        {
            var data:IHardware =
            {
                cordovaVersion:Hardware.getCordovaVersion(),
                os:Hardware.getOS(),
                uuid:Hardware.getUUID(),
                osVersion:Hardware.getOSVersion(),
                android:Hardware.isAndroid(),
                blackberry:Hardware.isBlackBerry(),
                ios:Hardware.isIOS(),
                mobile:Hardware.isMobile(),
                windowsPhone:Hardware.isWindowsPhone(),
                screenWidth:Hardware.getScreenWidth(),
                screenHeight:Hardware.getScreenHeight(),
                orientation:Hardware.getOrientation(),
                landscape:Hardware.isLandscape(),
                portrait:Hardware.isPortrait(),
                browser: Hardware.getBrowser(),
                cookie:(Hardware.hasCookieEnable() ? 'true' : 'false')
            };
            return data;
        }

        public static hasCookieEnable() : boolean
        {
            if (!Hardware.isBrowser()) return false;

            return navigator.cookieEnabled;
        }
    }
}
var ROOT:any;
try
{
    ROOT = window;
    window["ROOT"] = ROOT;
    ROOT._isNode = false;
}catch(error)
{
    try
   	{

    	ROOT = eval("global");
    	ROOT.ROOT = ROOT;
   	}catch(error)
   	{

   	}
    ROOT._isNode = true;
}

namespace ghost
{
    export function hasClass(name?:string):boolean
    {
        if(!name)
        {
            return false;
        }
        var names:string[] = name.split(".");
        var root:any = ROOT;
        var len:number = names.length;
        for(var i:number=0; i<len; i++)
        {
            if(root[names[i]])
            {
                root = root[names[i]];
            }else
            {
                return false;
            }
        }
        return true;
    }
    export function getClassByName(name?:string):any
    {
        if(!name)
        {
            return null;
        }
        var names:string[] = name.split(".");
        var root:any = ROOT;
        var len:number = names.length;
        for(var i:number=0; i<len; i++)
        {
            if(root[names[i]])
            {
                root = root[names[i]];
            }else
            {
                return null;
            }
        }
        return root;
    }
    
}
function applyMixins(derivedCtor: any, baseCtors: any[]) {
    baseCtors.forEach(baseCtor => {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
            derivedCtor.prototype[name] = baseCtor.prototype[name];
        })
    });
}namespace ghost.core
{
    /**
     * Promise helper
     */
    export class Promise
    {
        /**
         * @protected
         * Array of success listeners
         */
        public _successFunction:Function[];
        /**
         * @protected
         * Array of failure listeners
         */
        public _failureFunction:Function[];
        /**
         * @protected
         * Array of progress listeners
         */
        public _progressFunction:Function[];
        /**
         * Failure data
         */
        private _reject:any[] = null;
        /**
         * Success data
         */
        private _success:any[] = null;
        /**
         * Specified if the promise has been rejected
         */
        private _rejected:boolean = false;
        /**
         * Specified if the promise has been resolved
         */
        private _resolved:boolean = false;

        /**
         * Constructor
         */
        constructor()
        {
            this._successFunction = [];
            this._failureFunction = [];
            this._progressFunction = [];
        }

        /**
         * Gets a promise instance. You should use this method instead of calling directly the constructor.
         * @returns {ghost.core.Promise}
         */
        public static create():Promise
        {
            //TODO:Reuse Promise pool
            return new Promise();
        }
        /**
         * Rejects the promise and dispatch data to every now and future failure listeners
         * @param data Data to transmit to listeners
         */
        public reject(...data:any[]):void
        {
            if(this._resolved || this._rejected)
            {
                throw new Error("You can't call twice reject or resolve function of a promise");
            }
            this._rejected = true;
            this._reject = data;
            this._progressFunction.length = 0;
            this.dispatch();
        }
        /**
         * Resolves the promise and dispatch data to every now and future success listeners
         * @param data Data to transmit to listeners
         */
        public resolve(...data:any[]):void
        {
            if(this._resolved || this._rejected)
            {
                throw new Error("You can't call twice reject or resolve function of a promise");
            }
            this._resolved = true;
            this._success = data;
            this._progressFunction.length = 0;
            this.dispatch();
        }

        public pending(...data:any[]):void
        {
            if(this._resolved || this._rejected)
            {
                throw new Error("You can't call progress method after rejecting or resolving a promise");
            }
            for(var p in this._progressFunction)
            {
                this._progressFunction[p].apply(this, data);
            }
        }
        /**
         * @protected
         * Dispatch data to listeners
         */
        public dispatch():void
        {
            if(this._resolved)
            {
                while(this._successFunction.length>0)
                {
                    try
                    {

                        this._successFunction.shift().apply(this, this._success);
                    }catch(error)
                    {
                        this._resolved = false;
                        this._rejected = true;
                        this._reject = [error];
                        this.dispatch();
                        return;
                    }
                }
            }else
            if(this._rejected)
            {
                while(this._failureFunction.length>0)
                {
                    this._failureFunction.shift().apply(this, this._reject);
                }
            }
            this.dispose();

        }

        /**
         * Registers listeners for success and/or failure
         * @param successFunction success listener
         * @param failureFunction failure listener
         * @return Promise instance
         */
        public then(successFunction:Function = null, failureFunction:Function = null, progressFunction:Function = null ):Promise
        {
            if(successFunction)
                this._successFunction.push(successFunction);
            if(failureFunction)
                this._failureFunction.push(failureFunction);
            if(progressFunction)
            {
                if(!this._resolved && !this._rejected)
                {
                    this._progressFunction.push(progressFunction);
                }
            }
            this.dispatch();
            return this;
        }
        /**
         * Registers listener for failure
         * @param failureFunction failure listener
         * @return Promise instance
         */
        public error( failureFunction:Function):Promise
        {
            if(failureFunction)
                this._failureFunction.push(failureFunction);
            this.dispatch();
            return this;
        }
        /**
         * Registers listener for success
         * @param successFunction success listener
         * @return Promise instance
         */
        public success( successFunction:Function):Promise
        {
            if(successFunction)
                this._successFunction.push(successFunction);
            this.dispatch();
            return this;
        }
        /**
         * Registers listener for progress
         * @param progressFunction progress  listener
         * @return Promise instance
         */
        public progress( progressFunction:Function):Promise
        {
            if(progressFunction && !this._resolved && this._rejected)
                this._progressFunction.push(progressFunction);
            return this;
        }

        /**
         * Specifies if the Promise has been rejected or resolved
         * @returns {boolean} true or false
         */
        public dispatched():boolean
        {
            return this._resolved || this._rejected;
        }
        public bind(promise:Promise):void
        {
            var _this:any = this;
            promise.success(function()
            {
                    _this.resolve.apply(_this,Array.prototype.slice.call(arguments));
            }).
            progress(function()
            {
                _this.pending.apply(_this,Array.prototype.slice.call(arguments)); 
            }).
            error(function()
            {
                _this.reject.apply(_this,Array.prototype.slice.call(arguments));
            });
        }
        public dispose():void
        {
          this._successFunction = null;  
          this._failureFunction = null;  
          this._progressFunction = null;  
          this._reject = null;  
          this._success = null;  
        }
    }
}namespace ghost.utils
{
    export class FPS
    {
        private timestamps:number[]
        private cls:any;
        public constructor()
        {
            this.timestamps = [];
        }
        protected getTime():number
        {
            if(!this.cls)
            {
                if(window["performance"])
                {
                    this.cls = window["performance"];
                }else
                {
                    this.cls = Date;
                }
            }
            return this.cls.now();
        }
        public tick():void
        {
            this.timestamps[this.timestamps.length] = this.getTime();
            if(this.timestamps.length>10)
            {
                this.timestamps.shift();
            }
        }
        public getFPS():number
        {
            if (!this.timestamps.length) {
                return 0;
            }
            var diff:number = this.timestamps[this.timestamps.length-1] - this.timestamps[0];
            var fps:number = Math.round(1000/diff*10);
            return fps;
        }
        public getMemoryUsage():string
        {
            if(window["performance"] && window["performance"]["memory"])
            {
                var ms	= window["performance"]["memory"].usedJSHeapSize;
                return  this.bytesToSize(ms, 2);
            }
            return "N/A";
        }
        protected bytesToSize( bytes, nFractDigit )
        {
            var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
            if (bytes == 0) return 'n/a';
            nFractDigit	= nFractDigit !== undefined ? nFractDigit : 0;
            var precision	= Math.pow(10, nFractDigit);
            var i 		= Math.floor(Math.log(bytes) / Math.log(1024));
            return Math.round(bytes*precision / Math.pow(1024, i))/precision + ' ' + sizes[i];
        }
    }
}namespace ghost.utils
{
    export class Device
    {
        public static isMobile():boolean
        {
            var check = false;
            (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window["opera"]);
            return check;
        }
    }
}namespace ghost.utils
{
    /**
     * Maths
     */
    export class Maths
    {
        private static unique:number = 0;

        /**
         * Gets unique ID for current instance
         * @returns {number}
         */
        public static getUniqueID():number
        {
            return this.unique++;
        }
        /**
         * Génère un entier aléatoirement compris entre min et max (bornes comprises)
         * @param min Valeur minimum
         * @param max Valeur maximum
         * @return Un entier entre min et max compris.
         */
        public static randBetween(min:number, max:number):number
        {
            if(max<=min)
            {
                return min;
            }
            return Math.floor(Math.random()*(max-min+1)+min);
        }
        /**
         * Gets Winding Number
         * @param points Array of Points (x ,y)
         * @param x X coordinate
         * @param y Y Coordinate
         * @return {Number}
         */
        public static getWindingNumber(points:any[], x:number, y:number):number
        {
            function isLeft(P0:any, P1:any):number
            {
                return ( (P1.x - P0.x) * (y - P0.y)
                    - (x -  P0.x) * (P1.y - P0.y) );
            }
            var  wn = 0;
            var length = points.length-1;
            for (var i=0; i<length; i++)
            {
    
                if (points[i].y <= y) {
                    if (points[i+1].y  > y)
                        if (isLeft( points[i], points[i+1]) > 0)
                            wn++;
                }
                else {
                    if (points[i+1].y <= y)
                        if (isLeft( points[i], points[i+1]) < 0)
                            wn++;
                }
            }
            return wn;
        }
        /**
         * Tests if a point is inside a polygon
         * @param points Array of Points (x:x, y:y)
         * @param x X coordinate
         * @param y Y Coordinate
         * @return {Boolean}
         */
        public static isPointInPolygon(points:any[], x:number, y:number):boolean
        {
            return Maths.getWindingNumber(points, x, y)!=0;
        }

        /**
         * Converts a number to a string with a min of digits
         * @param number Original number
         * @param min Minimum of digits
         * @returns {string} final string
         */
        public static toMinNumber(number:number, min:number):string
        {
            var strNum = number+"";
            while(strNum.length < min)
            {
                strNum = "0"+strNum;
            }
            return strNum;
        }

        /**
         * Caps a number between two values
         * @param value number to cap
         * @param min min value. If null there is no min value
         * @param max max value. If null there is no min value
         * @returns {number}
         */
        public static cap(value:number, min:number = null, max:number = null):number
        {
            if(min !== null)
            {
                if(value<min)
                {
                    return min;
                }
            }
            if(max!== null)
            {
                if(value>max)
                {
                    return max;
                }
            }

            return value;
        }

        public static pi(digit:number):number
        {
            var sum = 0;
            var k = 0;
            while(k<digit)
            {
                sum+= Math.pow(16, -k)* ( 4/(8*k+1)-2/(8*k+4) - 1/(8*k+5)-1/(8*k+6));
                k++;
            }
            return sum;
        }
    }
}
namespace ghost.utils
{
	export class Gradient
    {
        private count:number = 100;
        private colours:string[] = ['ff0000', 'ffff00', '00ff00', '0000ff']; 
        private gradients:ColourGradient[];
        public constructor()
        {
            this.setColours(this.colours);
        }
        public setColours(...colours:any[]):void
        {
            if(colours.length == 1)
            {
                colours = colours[0];
            }
            if (colours.length < 2) {
                throw new Error('You have to have two or more colours.');
            } else {
                var len:number = colours.length-1;
                var inteval:number = this.count/len;
                this.gradients = [];
                for (var i:number = 0; i < len; i++) {
                    var colourGradient = new ColourGradient();
                    colourGradient.setGradient(colours[i], colours[i + 1]);
                    colourGradient.setRange(inteval * i, inteval * (i + 1)); 
                    this.gradients.push(colourGradient); 
                }

                this.colours = colours;
            }
        }
        public getColour(index:number, modulo:boolean = true):string
        {
        	if(modulo)
        	{
        		index = index%this.count;
        	}
            var len:number = this.gradients.length;
            var segment:number = this.count/len;
            var indexGradient:number = Math.min(Math.floor(Math.max(index, 0)/segment), len - 1);
           // console.log(index+" : "+this.count+"|"+len+"     "+segment+" ====> "+indexGradient);
           // console.log(indexGradient);
            return this.gradients[indexGradient].getColour(index);
        }
        public getMax():number
        {
        	return this.count;
        }
        public setMax(count:number):void
        {
            this.count = count;
            this.setColours(this.colours);
        }
    }
    class ColourGradient
    {
        private colour1:string;
        private colour2:string;
        private min:number = 0;
        private max:number = 100;
        public setGradient(colour1:string, colour2:string):void
        {
            if(colour1.substring(0, 1) == "#")
            {
                colour1 = colour1.substring(1);
            }
            if(colour2.substring(0, 1) == "#")
            {
                colour2 = colour2.substring(1);
            }
            this.colour1 = colour1;
            this.colour2 = colour2;
        }
        public setRange(min:number, max:number):void
        {
            this.min = min;
            this.max = max;
        }
        public getColour(index:number):string
        {
            //console.log(this.min+" : "+index+" : "+this.max);
            return "#"+this.hex(index, this.colour1.substring(0, 2), this.colour2.substring(0, 2))
            + this.hex(index, this.colour1.substring(2, 4), this.colour2.substring(2, 4))
            + this.hex(index, this.colour1.substring(4, 6), this.colour2.substring(4, 6));
        }
        private hex(index, start16, end16):string
        {
            if(index<this.min)
            {
                index = this.min;
            }
            if(index>this.max)
            {
                index =this.max;
            }
            var range:number = this.max - this.min;
            var start10:number = parseInt(start16, 16);
            var end10:number = parseInt(end16, 16);
            var index2:number = (end10 - start10)/range;
            var base10:number = Math.round(index2 * (index - this.min) + start10);
            var base16:string = base10.toString(16);
            if(base16.length == 1)
            {
                base16 = "0" + base16;
            }
            return base16;
        }
    }
}
namespace ghost.utils
{
    /**
     * Cryptography
     */
    export class Cryptography
    {
        private static keyStr:string = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        public static MD5(str:any):string
        {
            str = str+"";
            var xl;

            var rotateLeft = function (lValue, iShiftBits) {
                return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
            };

            var addUnsigned = function (lX, lY) {
                var lX4, lY4, lX8, lY8, lResult;
                lX8 = (lX & 0x80000000);
                lY8 = (lY & 0x80000000);
                lX4 = (lX & 0x40000000);
                lY4 = (lY & 0x40000000);
                lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
                if (lX4 & lY4) {
                    return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
                }
                if (lX4 | lY4) {
                    if (lResult & 0x40000000) {
                        return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
                    } else {
                        return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
                    }
                } else {
                    return (lResult ^ lX8 ^ lY8);
                }
            };

            var _F = function (x, y, z) {
                return (x & y) | ((~x) & z);
            };
            var _G = function (x, y, z) {
                return (x & z) | (y & (~z));
            };
            var _H = function (x, y, z) {
                return (x ^ y ^ z);
            };
            var _I = function (x, y, z) {
                return (y ^ (x | (~z)));
            };

            var _FF = function (a, b, c, d, x, s, ac) {
                a = addUnsigned(a, addUnsigned(addUnsigned(_F(b, c, d), x), ac));
                return addUnsigned(rotateLeft(a, s), b);
            };

            var _GG = function (a, b, c, d, x, s, ac) {
                a = addUnsigned(a, addUnsigned(addUnsigned(_G(b, c, d), x), ac));
                return addUnsigned(rotateLeft(a, s), b);
            };

            var _HH = function (a, b, c, d, x, s, ac) {
                a = addUnsigned(a, addUnsigned(addUnsigned(_H(b, c, d), x), ac));
                return addUnsigned(rotateLeft(a, s), b);
            };

            var _II = function (a, b, c, d, x, s, ac) {
                a = addUnsigned(a, addUnsigned(addUnsigned(_I(b, c, d), x), ac));
                return addUnsigned(rotateLeft(a, s), b);
            };

            var convertToWordArray = function (str) {
                var lWordCount;
                var lMessageLength = str.length;
                var lNumberOfWords_temp1 = lMessageLength + 8;
                var lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
                var lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
                var lWordArray = new Array(lNumberOfWords - 1);
                var lBytePosition = 0;
                var lByteCount = 0;
                while (lByteCount < lMessageLength) {
                    lWordCount = (lByteCount - (lByteCount % 4)) / 4;
                    lBytePosition = (lByteCount % 4) * 8;
                    lWordArray[lWordCount] = (lWordArray[lWordCount] | (str.charCodeAt(lByteCount) << lBytePosition));
                    lByteCount++;
                }
                lWordCount = (lByteCount - (lByteCount % 4)) / 4;
                lBytePosition = (lByteCount % 4) * 8;
                lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
                lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
                lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
                return lWordArray;
            };

            var wordToHex = function (lValue) {
                var wordToHexValue = "",
                    wordToHexValue_temp = "",
                    lByte, lCount;
                for (lCount = 0; lCount <= 3; lCount++) {
                    lByte = (lValue >>> (lCount * 8)) & 255;
                    wordToHexValue_temp = "0" + lByte.toString(16);
                    wordToHexValue = wordToHexValue + wordToHexValue_temp.substr(wordToHexValue_temp.length - 2, 2);
                }
                return wordToHexValue;
            };

            var x = [],
                k, AA, BB, CC, DD, a, b, c, d, S11 = 7,
                S12 = 12,
                S13 = 17,
                S14 = 22,
                S21 = 5,
                S22 = 9,
                S23 = 14,
                S24 = 20,
                S31 = 4,
                S32 = 11,
                S33 = 16,
                S34 = 23,
                S41 = 6,
                S42 = 10,
                S43 = 15,
                S44 = 21;

            str = Cryptography.UTF8Encode(str);
            x = convertToWordArray(str);
            a = 0x67452301;
            b = 0xEFCDAB89;
            c = 0x98BADCFE;
            d = 0x10325476;

            xl = x.length;
            for (k = 0; k < xl; k += 16) {
                AA = a;
                BB = b;
                CC = c;
                DD = d;
                a = _FF(a, b, c, d, x[k + 0], S11, 0xD76AA478);
                d = _FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
                c = _FF(c, d, a, b, x[k + 2], S13, 0x242070DB);
                b = _FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
                a = _FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
                d = _FF(d, a, b, c, x[k + 5], S12, 0x4787C62A);
                c = _FF(c, d, a, b, x[k + 6], S13, 0xA8304613);
                b = _FF(b, c, d, a, x[k + 7], S14, 0xFD469501);
                a = _FF(a, b, c, d, x[k + 8], S11, 0x698098D8);
                d = _FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
                c = _FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
                b = _FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
                a = _FF(a, b, c, d, x[k + 12], S11, 0x6B901122);
                d = _FF(d, a, b, c, x[k + 13], S12, 0xFD987193);
                c = _FF(c, d, a, b, x[k + 14], S13, 0xA679438E);
                b = _FF(b, c, d, a, x[k + 15], S14, 0x49B40821);
                a = _GG(a, b, c, d, x[k + 1], S21, 0xF61E2562);
                d = _GG(d, a, b, c, x[k + 6], S22, 0xC040B340);
                c = _GG(c, d, a, b, x[k + 11], S23, 0x265E5A51);
                b = _GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
                a = _GG(a, b, c, d, x[k + 5], S21, 0xD62F105D);
                d = _GG(d, a, b, c, x[k + 10], S22, 0x2441453);
                c = _GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
                b = _GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
                a = _GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
                d = _GG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
                c = _GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
                b = _GG(b, c, d, a, x[k + 8], S24, 0x455A14ED);
                a = _GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
                d = _GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
                c = _GG(c, d, a, b, x[k + 7], S23, 0x676F02D9);
                b = _GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
                a = _HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
                d = _HH(d, a, b, c, x[k + 8], S32, 0x8771F681);
                c = _HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
                b = _HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
                a = _HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
                d = _HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
                c = _HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
                b = _HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
                a = _HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
                d = _HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA);
                c = _HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
                b = _HH(b, c, d, a, x[k + 6], S34, 0x4881D05);
                a = _HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
                d = _HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
                c = _HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
                b = _HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665);
                a = _II(a, b, c, d, x[k + 0], S41, 0xF4292244);
                d = _II(d, a, b, c, x[k + 7], S42, 0x432AFF97);
                c = _II(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
                b = _II(b, c, d, a, x[k + 5], S44, 0xFC93A039);
                a = _II(a, b, c, d, x[k + 12], S41, 0x655B59C3);
                d = _II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
                c = _II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
                b = _II(b, c, d, a, x[k + 1], S44, 0x85845DD1);
                a = _II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
                d = _II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
                c = _II(c, d, a, b, x[k + 6], S43, 0xA3014314);
                b = _II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
                a = _II(a, b, c, d, x[k + 4], S41, 0xF7537E82);
                d = _II(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
                c = _II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
                b = _II(b, c, d, a, x[k + 9], S44, 0xEB86D391);
                a = addUnsigned(a, AA);
                b = addUnsigned(b, BB);
                c = addUnsigned(c, CC);
                d = addUnsigned(d, DD);
            }

            var temp = wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d);

            return temp.toLowerCase();
        }
        private static UTF8Encode(string:string):string
        {
            string = string.replace(/\r\n/g,"\n");
            var utftext = "";

            for (var n = 0; n < string.length; n++) {

                var c = string.charCodeAt(n);

                if (c < 128) {
                    utftext += String.fromCharCode(c);
                }
                else if((c > 127) && (c < 2048)) {
                    utftext += String.fromCharCode((c >> 6) | 192);
                    utftext += String.fromCharCode((c & 63) | 128);
                }
                else {
                    utftext += String.fromCharCode((c >> 12) | 224);
                    utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                    utftext += String.fromCharCode((c & 63) | 128);
                }

            }

            return utftext;
        }
        private static UTF8Decode(utftext:string):string
        {
            var string = "";
            var i:number = 0;
            var c1:number,c2:number, c3:number;
            var c:number = c1 = c2 = 0;

            while ( i < utftext.length ) {

                c = utftext.charCodeAt(i);

                if (c < 128) {
                    string += String.fromCharCode(c);
                    i++;
                }
                else if((c > 191) && (c < 224)) {
                    c2 = utftext.charCodeAt(i+1);
                    string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                    i += 2;
                }
                else {
                    c2 = utftext.charCodeAt(i+1);
                    c3 = utftext.charCodeAt(i+2);
                    string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                    i += 3;
                }

            }

            return string;
        }
        public static base64Encode(input:string):string
        {
            var output:string = "";
            var chr1:number, chr2:number, chr3:number, enc1:number, enc2:number, enc3:number, enc4:number;
            var i:number = 0;

            input = Cryptography.UTF8Encode(input);

            while (i < input.length) {

                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);

                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;

                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }

                output = output +
                    Cryptography.keyStr.charAt(enc1) + Cryptography.keyStr.charAt(enc2) +
                    Cryptography.keyStr.charAt(enc3) + Cryptography.keyStr.charAt(enc4);

            }

            return output;
        }
        public static base64Decode(input:string):string
        {
            var output = "";
            var chr1, chr2, chr3;
            var enc1, enc2, enc3, enc4;
            var i = 0;

            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

            while (i < input.length) {

                enc1 = Cryptography.keyStr.indexOf(input.charAt(i++));
                enc2 = Cryptography.keyStr.indexOf(input.charAt(i++));
                enc3 = Cryptography.keyStr.indexOf(input.charAt(i++));
                enc4 = Cryptography.keyStr.indexOf(input.charAt(i++));

                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;

                output = output + String.fromCharCode(chr1);

                if (enc3 != 64) {
                    output = output + String.fromCharCode(chr2);
                }
                if (enc4 != 64) {
                    output = output + String.fromCharCode(chr3);
                }

            }

            output = Cryptography.UTF8Decode(output);

            return output;
        }

        /**
         * Generates a token
         * @param size Size of the token. default : 128 cars
         * @returns {string} token
         */
        public static token(size:number = 128):string
        {
            var tokens:string[] = "abcdef0123456789".split("");
            var token:string = "";
            for(var i=0; i<size; i++)
            {
                token += tokens[ghost.utils.Maths.randBetween(0, 15)];
            }
            return token;
        }


    }
}

namespace ghost.utils
{
    export class Timer
    {
        private static _timers:Timer[] = [];
        private _timeout:number = -1;
        private _isTimeout:boolean;
        private _callback:Function;
        private _delay:number;
        private _params:any[];
        private _called:number = 0;
        private _lastCall:number = -1;
        private _name:string;
        constructor(name:string, isTimeout:boolean, callback:Function, delay:number = 0, params:any[] = null)
        {
            this._name = name;
            this._isTimeout = isTimeout;
            this._callback = callback;
            this._delay = delay;
            this._params = params;
            Timer._timers.push(this);
        }
        public getName():string
        {
            return this._name;
        }
        public isInterval():boolean
        {
            return !this._isTimeout;
        }
        public isTimeout():boolean
        {
            return this._isTimeout;
        }
        public start():void
        {
            if(this._timeout == -1 || this._isTimeout)
            {
                if(this._delay < 0)
                {
                    throw new Error("Delay must be >= 0, maybe you are trying to use a disposed timer");
                }
                var _this:Timer = this;
                this._lastCall = Date.now();
                if(this._isTimeout)
                {
                    if(this._timeout != -1)
                    {
                        clearTimeout(<any>this._timeout);
                    }
                    this._timeout = <any>setTimeout(function()
                    {
                        _this._called++;
                        _this._timeout = -1;
                        _this._lastCall = Date.now();
                        _this._callback.apply(null, _this._params);

                    }, _this._delay);
                }else
                {
                    this._timeout = <any>setInterval(function()
                    {
                        _this._called++;
                        _this._lastCall = Date.now();
                        _this._callback.apply(null, _this._params);
                    }, _this._delay);
                }
            }
        }
        public reset():void
        {
            this.stop();
            if(!this._isTimeout)
                this.start();
        }
        public dispose():void
        {
            this.stop();
            this._callback = null;
            this._params = null;
            this._delay = -1;

            var index:number;
            if((index = Timer._timers.indexOf(this))!=-1)
            {
                Timer._timers.splice(index, 1);
            }
        }
        public stop():void
        {
            if(this._timeout!=-1)
            {
                if(this._isTimeout)
                {
                    clearTimeout(<any>this._timeout);
                }else
                {
                    clearInterval(<any>this._timeout);

                }
                this._timeout = -1;
            }
        }
        public isRunning():boolean
        {
            return this._timeout != <any>-1;
        }
        public getNumberOfCalls():number
        {
            return this._called;
        }
        public getTimeRemaining():number
        {
            if(this.isRunning())
            {
                return this._lastCall+this._delay - Date.now();
            }else
            {
                return Infinity;
            }
        }
        public static clearTimeout(timer:Timer):void
        {
            timer.stop();
            timer.dispose();
        }
        public static clearInterval(timer:Timer):void
        {
            timer.stop();
            timer.dispose();
        }
        public static callLater(callback:Function, instance:any = null, ...params:any[]):number
        {
            return Timer.setTimeout.apply(instance, ["callLater", callback, 0].concat(params));
        }
        public static applyLater(callback:Function,instance:any = null,  params:any[] = null):number
        {
            return Timer.setTimeout.apply(instance, ["applyLater", callback, 0].concat(params));
        }
        public static setTimeout(name:string, callback:Function, delay:number, ...params:any[]):Timer
        {
            return new Timer(name, true, callback, delay, params);
        }
        public static setInterval(name:string, callback:Function, delay:number, ...params:any[]):Timer
        {
             return new Timer(name, false, callback, delay, params);
        }
        public static getNumberTimersRunning():number
        {
            return Timer._timers.length;
        }
         public static getNumberTimeoutsRunning():number
        {
            var quantity:number = 0;
            for(var p in Timer._timers)
            {
                if(Timer._timers[p].isTimeout())
                {
                    quantity++;
                }
            }
            return quantity;
        }
        public static getNumberIntervalsRunning():number
        {
            var quantity:number = 0;
            for(var p in Timer._timers)
            {
                if(Timer._timers[p].isInterval())
                {
                    quantity++;
                }
            }
            return quantity;
        }
    }

    export interface BufferFunction extends Function
    {
        waiting:boolean;
        delay:number;
        isWaiting():void;
        cancel():void;
        pause():void;
        resume():void;
        now():void;
        getTimeRemaining():number;
    }

    /**
     * Buffer
     */
    export class Buffer
    {
        //private _timers
        public static throttle(callback:Function, delay:number):BufferFunction
        {
            var timer:any = null;
            var args:any = null;
            var time:number;
            var func:BufferFunction = <any> function () {

                args = arguments;
                clearTimeout(timer);
                func.waiting = true;
                time = Date.now();
                timer = setTimeout(function()
                {
                    callback.apply(func, args);
                }, delay);
            };

            /**
             * Cancel the throttle's function future call
             */
            function cancel()
            {
                clearTimeout(timer);
            }

            /**
             * Checks if the throttle function is waiting to be called
             * @returns {boolean}
             */
            function isWaiting() {
                return func.waiting;
            }

            /**
             * If the throttle's function is waiting, it will call it now
             */
            function now()
            {
                if (func.waiting) {
                    clearTimeout(timer);
                    func.waiting = false;
                    callback.apply(func, args);
                }
            }
            function pause():void
            {
                if(isWaiting())
                {
                    clearTimeout(timer);
                    func.waiting = false;
                }

            }
            function resume():void
            {
                func.waiting = true;
                time = Date.now();
                timer = setTimeout(function()
                {
                    callback.apply(func, args);
                }, delay);
            }
            function getTimeRemaining():number
            {
                return (!isWaiting())?0:Math.max(0, delay - (Date.now()-time));
            }
            func.waiting = false;
            func.cancel = cancel;
            func.pause = pause;
            func.getTimeRemaining = getTimeRemaining;
            func.resume = resume;
            func.isWaiting = isWaiting;
            func.delay = delay;
            func.now = now;
            return func;
        }

        public static callLater(callback:Function, ...params:any[]):number
        {
            return Buffer.setTimeout.apply(null, [callback, 0].concat(params));
        }

        public static setTimeout(callback:Function, delay:number, ...params:any[]):number
        {
            return <any>setTimeout(function()
            {
                callback.apply(null, params);
            }, delay);
        }
        public static setInterval(callback:Function, delay:number, ...params:any[]):number
        {
            return <any>setInterval(function()
            {
                callback.apply(null, params);
            }, delay);
        }

        private _listFunctions:MFunction[];
        constructor()
        {

            this._listFunctions = [];
        }
        /**
         * Indicates if the buffer is empty
         */
        public isEmpty():boolean
        {
            return this._listFunctions.length == 0;
        }

        /**
         * Number of waiting functions
         */
        public getLength():number
        {
            return this._listFunctions.length;
        }
        public add(mfunc:any):void
        {
            if(!(mfunc instanceof MFunction))
            {
                return this.addFunction.apply(this, Array.prototype.slice.apply(arguments));
            }
            this._listFunctions.push(mfunc);
        }
        public addAt(mfunc:any, index:number):void
        {
            if(!(mfunc instanceof MFunction))
            {
                return this.addFunctionAt.apply(this, Array.prototype.slice.apply(arguments));
            }
            this._listFunctions.splice(index, 0, mfunc);
        }


        public addFunction(func:any, scope?:any, ...params:any[]):MFunction
        {
            var mfunc = new MFunction();
            mfunc.setFunction(func);
            mfunc.setScope(scope);
            mfunc.setParams(Array.prototype.slice.call(arguments, 2));
            this.add(mfunc);
            return mfunc;
        }
        public addFunctionAt(index:number, func:any, scope?:any, ...params:any[]):void
        {
            var mfunc = new MFunction();
            mfunc.setFunction(func);
            mfunc.setScope(scope);
            mfunc.setParams(Array.prototype.slice.call(arguments, 3));
            this.addAt(mfunc, index);
        }
        /**
         * Clear the buffer without calling functions
         */
        public clear():void
        {
            this._listFunctions = [];
        }
        /**
         * Clear the buffer by calling all function in the right order
         */
        public callAll(scope?:any):void
        {
            while(!this.isEmpty())
            {
                this.callNext(scope);
            }
        }
        public current():MFunction
        {
            return this._listFunctions[0];
        }
        /**
         * Gets next waiting function and removes it from the buffer list
         * @return MFunction if buffer isn't empty, null otherwise
         */
        public getNext():MFunction
        {
            return this._listFunctions.shift();
        }
        /**
         * Call next function
         * @param scope {optional} thisObject
         * @return {*}
         */
        public callNext(scope?:any):any
        {
            var mfunc = this.getNext();
            return mfunc.call(scope);
        }
    }

    export class MFunction
    {
        private _function:any;
        private _params:any;
        private _scope:any;
        constructor()
        {
            
        }
        public getFunction():any
        {
            return this._function;
        }
        public setFunction(value:any):void
        {
            this._function = value;
        }
        public getParams():any
        {
            return this._params;
        }
        public setParams(value:any):void
        {
            this._params = value;
        }
        public getScope():any
        {
            return this._scope;
        }
        public setScope(value:any):void
        {
            this._scope = value;
        }
        public call(scope?:any):any
        {
            if(!scope)
            {
                scope = this._scope;
            }
            return this._function.apply(scope, this._params!=null && this._params.length>0?this._params:null);
        }
        public toString():string
        {
            return "[MFunction params=\""+this._params+"\" scope=\""+this._scope+"\" function=\""+this._function+"\"]";
        }
    }
  


}
///<file="Maths"/>
namespace ghost.utils
{
    import Maths = ghost.utils.Maths;
    export class Dates
    {
        /**
         * Displays the date DD/MM/YYYY
         * @param date
         */
        public static displayDate(timestamp:number):string;
        public static displayDate(date:Date):string;
        public static displayDate(date:any):string
        {
            if(!(date instanceof Date))
            {
                if(typeof date != "number")
                {
                    date = parseInt(date, 10);
                }
                date = new Date(date);
            }
            return ghost.utils.Maths.toMinNumber(date.getDate(), 2)+"/"+  ghost.utils.Maths.toMinNumber(date.getMonth()+1, 2)+"/"+ ghost.utils.Maths.toMinNumber(date.getFullYear(), 4);
        }

        public static localFromISO(date:string):Date
        {
            if (typeof date == "string")
            {
                date = date.replace(" ", "T") + "Z";
                if (date.substr(-1, 1) != "Z") {
                    date += "Z";
                }
            }
            var output: Date = new Date(date);

            return output;
        }
        public static getReadableDate(givenDate:Date): string {

            var output: string;
            var givenTimestamp: number = givenDate.getTime();

            var timestamp: number = Date.now();
            timestamp -= givenTimestamp;


            var date: Date = new Date();
            date.setHours(0);
            date.setMinutes(0);
            date.setSeconds(0);
            //date.setTime(0);


            if (givenDate >= date/*timestamp<86400000*/) //today
            {
                output = Maths.toMinNumber(givenDate.getHours(), 2) + ":" + Maths.toMinNumber(givenDate.getMinutes(), 2) + ":" + Maths.toMinNumber(givenDate.getSeconds(), 2);
            } else {
                var date: Date = new Date();
                date.setDate(date.getDate() - 1);
                date.setHours(0);
                date.setMinutes(0);
                date.setSeconds(0);
                //  date.setTime(0);
                if (givenDate >= date) {
                    output = "yersteday, " + Maths.toMinNumber(givenDate.getHours(), 2) + ":" + Maths.toMinNumber(givenDate.getMinutes(), 2);
                } else {
                    var givenTime: string = givenDate.toISOString();
                    var index: number = givenTime.lastIndexOf(":");
                    if (index != -1) {
                        output = givenTime.substring(0, index);
                    } else {
                        output = givenTime;
                    }
                    output = output.replace("T", " ");
                }

            }
            return output;
        }
    }
}
namespace ghost.utils
{
    export class Objects
    {
        public static deepEquals(a:any, b:any):boolean
        {
            if(typeof a != typeof b)
            {
                return false;
            }

            if(typeof a == "object")
            {
                if (a instanceof Date) {
                    if(b instanceof Date)
                    {
                        return a == b;
                    }else
                    {
                        return false;
                    }
                }else
                if (b instanceof Date) 
                {
                    return false;
                }
                for(var p in a)
                {
                    if(!Objects.deepEquals(a[p], b[p]))
                    {
                        return false;
                    }
                }
                for(var p in b)
                {
                    if(!Objects.deepEquals(a[p], b[p]))
                    {
                        return false;
                    }
                }
                return true;
            }else
            {
                return a == b;
            }
        }
        public static clone(obj:any, ignore?:string, hidePrivate?:boolean):any;
        public static clone(obj:any, ignore?:string[], hidePrivate?:boolean):any;
        public static clone(obj:any, ignore?:any, hidePrivate:boolean = false):any
        {
            //console.log(obj);
            if(ignore)
            {
                if(typeof ignore == "string")
                {
                    ignore = [ignore];
                }
            }
            // Handle the 3 simple types, and null or undefined
            if (null == obj || "object" != typeof obj) return obj;
        
            // Handle Date
            if (obj instanceof Date) {
                var copy:Date = new Date();
                copy.setTime(obj.getTime());
                return copy;
            }
        
            // Handle Array
            if (obj instanceof Array) {
                var copy_array:any[] = [];
                for (var i = 0, len = obj.length; i < len; i++) {
                    copy_array[i] = Objects.clone(obj[i], null, hidePrivate);
                }
                return copy_array;
            }
        
            // Handle Object
            if (obj instanceof Object) {
                var copy_object:any = {};
                for (var attr in obj) {

                    if (obj.hasOwnProperty(attr) && (!ignore || ignore.indexOf(attr)==-1) && (!hidePrivate || attr.substring(0, 1) != "_"))
                    {
                        if(obj[attr] === obj)
                        {
                            //circular
                            copy_object[attr] =  copy_object;
                        }else
                        {
                            copy_object[attr] = Objects.clone(obj[attr], null, hidePrivate);
                        }

                    }
                }
                return copy_object;
            }
        
            throw new Error("Unable to copy obj! Its type isn't supported.");
        }
        public static makeNestedObject(data:any, name:string):any
        {
            var names:string[] = name.split(".");
            var len:number = names.length;
            for(var i:number=0; i<len; i++)
            {
                if(!data[names[i]])
                {
                    data[names[i]] = {};
                }
                data = data[names[i]];
            }
            return data;
        }

        public static  mergeProperties(propertyKey:string, firstObject:any, secondObject:any):any 
        {
            var propertyValue:any = firstObject[propertyKey];
            var propertyValue2:any = secondObject[propertyKey];
            if (typeof (propertyValue) === "object" && !(propertyValue instanceof Date) && propertyValue2 !== undefined && !(propertyValue2 instanceof Date)) {
                return Objects.mergeObjects(firstObject[propertyKey], secondObject[propertyKey]);
            } else if (secondObject[propertyKey] === undefined) {
                return firstObject[propertyKey];
            }
            return secondObject[propertyKey];
        }
        public static merge(firstObject: any, secondObject: any): any
        {
            return this.mergeObjects(firstObject, secondObject);
        }
        public static mergeObjects(firstObject:any, secondObject:any):any 
        {
            if(!firstObject)
            {
                return secondObject;
            }
            if(!secondObject)
            {
                return firstObject;
            }
            var finalObject:any = {};

            // Merge first object and its properties.
            for (var propertyKey in firstObject) {
                finalObject[propertyKey] = Objects.mergeProperties(propertyKey, firstObject, secondObject);
            }

            // Merge second object and its properties.
            for (var propertyKey in secondObject) {
                finalObject[propertyKey] = Objects.mergeProperties(propertyKey, secondObject, finalObject);
            }

            return finalObject;
        }
    }
}
namespace ghost.utils
{
	export class Arrays
	{
		public static isArray(obj:any):boolean
		{
			return Array.isArray(obj);
		}
		public static binaryFind(array:any[], searchElement:any, property?:string, order:number = 1):IBinaryResult
		{
			var minIndex = 0;
			var maxIndex = array.length - 1;
			var currentIndex;
			var currentElement;

			if(order>0)
			{
				order = 1;
			}else
			{
				order = -1;
			}

				searchElement = property?searchElement[property]:searchElement;

			while (minIndex <= maxIndex) {
				currentIndex = (minIndex + maxIndex) / 2 | 0;
				currentElement = property?(array[currentIndex]?array[currentIndex][property]:null):array[currentIndex];

				if ((order == 1 && currentElement < searchElement) ||  (order == -1 && currentElement > searchElement)){
					minIndex = currentIndex + 1;
				}
				else if ((order == 1 && currentElement > searchElement) || (order == -1 && currentElement < searchElement)) {
					maxIndex = currentIndex - 1;
				}
				else {
					return {
						found: true,
						index: currentIndex
					};
				}
			}

			currentIndex = (order == 1 && currentElement < searchElement) || (order == -1 && currentElement > searchElement) ? currentIndex + 1 : currentIndex;
			return {
				found: false,
				index: currentIndex
			};
		}
	}

	export interface IBinaryResult
	{
		found:boolean;
		index:number;
	}
}
namespace ghost.utils
{
    export class URI
    {
        private static options:any = {
            strictMode: false,
            key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
            q:   {
                name:   "queryKey",
                parser: /(?:^|&)([^&=]*)=?([^&]*)/g
            },
            parser: {
                strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
                loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
            }
        };
        public static parse(str:string):IURI
        {
            var	o   = URI.options,
                m   = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
                uri:IURI = {},
                i   = 14;

            while (i--) uri[o.key[i]] = m[i] || "";

            uri[o.q.name] = {};
            uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
                if ($1) uri[o.q.name][$1] = $2;
            });

            return uri;
        }
    }
    export interface IURI
    {
        anchor?:string;
        authority?:string;
        directory?:string;
        file?:string;
        host?:string;
        password?:string;
        path?:string;
        port?:string;
        protocol?:string;
        query?:string;
        queryKey?:any;
        relative?:string;
        source?:string;
        user?:string;
        userInfo?:string;
    }
}

namespace ghost.utils
{
    export class Strings
    {
        private static exceptWords:string[] = ["de","des","du","dans","la","le","les","au","aux"];

        public static replaceAll(str:string, search:string, repl:string):string
        {
             while (str.indexOf(search) != -1)
                str = str.replace(search, repl);
            return str;
        }
        public static stripAcents(str:string):string
        {
            var norm:string[] = ['À','Á','Â','Ã','Ä','Å','Æ','Ç','È','É','Ê','Ë',
                'Ì','Í','Î','Ï', 'Ð','Ñ','Ò','Ó','Ô','Õ','Ö','Ø','Ù','Ú','Û','Ü','Ý',
                'Þ','ß', 'à','á','â','ã','ä','å','æ','ç','è','é','ê','ë','ì','í','î',
                'ï','ð','ñ', 'ò','ó','ô','õ','ö','ø','ù','ú','û','ü','ý','ý','þ','ÿ'];
            var spec:string[] = ['A','A','A','A','A','A','A','C','E','E','E','E',
                'I','I','I','I', 'D','N','O','O','O','0','O','O','U','U','U','U','Y',
                'b','s', 'a','a','a','a','a','a','a','c','e','e','e','e','i','i','i',
                'i','d','n', 'o','o','o','o','o','o','u','u','u','u','y','y','b','y'];
            for (var i:number = 0; i < spec.length; i++)
                str = Strings.replaceAll(str, norm[i], spec[i]);
            return str;
        }
        public static startsWith(value:string, start:string):boolean
        {
            if(!value || !start)
            {
                return false;
            }
            return value.indexOf(start) == 0;
        }
         public static endsWith(value:string, start:string):boolean
        {
            if(!value || !start)
            {
                return false;
            }
            return value.indexOf(start) == value.length - start.length;
        }
        public static capitalizeAllWords(text:string):string
        {
            text = text.toLowerCase();

            var capitalize = function(car)
            {
                var name = text.split(car);
                for(var i=0;i < name.length;i++)
                {
                    if(i==0 || Strings.exceptWords.indexOf(name[i])==-1)
                        name[i] = name[i].charAt(0).toUpperCase() +name[i].substring(1);
                }
                text = name.join(car);
                return text;
            }
            text = capitalize(" ");
            text = capitalize("'");
            return text;
        }
        public static trim(text:string):string
        {
            return text ? text.replace(/^\s+|\s+$/g, '') : "";
        }
        public static similarityExtends(str1:string, str2:string):number
        {
            str1 = String(str1);
            str2 = String(str2);
            if(!str1)
            {
                str1 = "";
            }
            if(!str2)
            {
                str2 = "";
            }

            str1 = str1.toLowerCase();
            str2 = str2.toLowerCase();
            if(str1.length+str2.length==0)
            {
                return 1;
            }
            return (((str1.length+str2.length*2)-Strings.LevenshteinDistance(str1, str2))/(str1.length+str2.length*2));
        }
        public static LevenshteinDistance(source:string, target:string, options:any = null):number
        {
            options = options || {};
            if(isNaN(options.insertion_cost)) options.insertion_cost = 1;
            if(isNaN(options.deletion_cost)) options.deletion_cost = 1;
            if(isNaN(options.substitution_cost)) options.substitution_cost = 1;

            var sourceLength = source.length;
            var targetLength = target.length;
            var distanceMatrix = [[0]];

            for (var row =  1; row <= sourceLength; row++) {
                distanceMatrix[row] = [];
                distanceMatrix[row][0] = distanceMatrix[row-1][0] + options.deletion_cost;
            }

            for (var column = 1; column <= targetLength; column++) {
                distanceMatrix[0][column] = distanceMatrix[0][column-1] + options.insertion_cost;
            }

            for (var row = 1; row <= sourceLength; row++) {
                for (var column = 1; column <= targetLength; column++) {
                    var costToInsert = distanceMatrix[row][column-1] + options.insertion_cost;
                    var costToDelete = distanceMatrix[row-1][column] + options.deletion_cost;

                    var sourceElement = source[row-1];
                    var targetElement = target[column-1];
                    var costToSubstitute = distanceMatrix[row-1][column-1];
                    if (sourceElement !== targetElement) {
                        costToSubstitute = costToSubstitute + options.substitution_cost;
                    }
                    distanceMatrix[row][column] = Math.min(costToInsert, costToDelete, costToSubstitute);
                }
            }
            return distanceMatrix[sourceLength][targetLength];
        }
        public similarity(str1:string, str2:string, dj:number = null):number
        {
             var jaro;
            (typeof(dj) == 'undefined')? jaro = Strings.jaroDistance(str1,str2) : jaro = dj;
            var p:number = 0.1; //
            var l:number = 0 // length of the matching prefix
            while(str1[l] == str2[l] && l < 4)
                l++;

            return jaro + l * p * (1 - jaro);
        }
        public static jaroDistance(s1:string, s2:string):number
        {
            if (typeof(s1) != "string" || typeof(s2) != "string") return 0;
            if (s1.length == 0 || s2.length == 0)
                return 0;
            s1 = s1.toLowerCase(), s2 = s2.toLowerCase();
            var matchWindow = (Math.floor(Math.max(s1.length, s2.length) / 2.0)) - 1;
            var matches1 = new Array(s1.length);
            var matches2 = new Array(s2.length);
            var m = 0; // number of matches
            var t = 0; // number of transpositions

            //debug helpers
            //console.log("s1: " + s1 + "; s2: " + s2);
            //console.log(" - matchWindow: " + matchWindow);

            // find matches
            for (var i = 0; i < s1.length; i++) {
                var matched = false;

                // check for an exact match
                if (s1[i] ==  s2[i]) {
                        matches1[i] = matches2[i] = matched = true;
                        m++
                }

                // check the "match window"
                else {
                        // this for loop is a little brutal
                        for (k = (i <= matchWindow) ? 0 : i - matchWindow;
                                (k <= i + matchWindow) && k < s2.length && !matched;
                                k++) {
                                    if (s1[i] == s2[k]) {
                                        if(!matches1[i] && !matches2[k]) {
                                                    m++;
                                       }

                                matches1[i] = matches2[k] = matched = true;
                            }
                        }
                }
            }

            if(m == 0)
                return 0.0;

            // count transpositions
            var k = 0;

            for(var i = 0; i < s1.length; i++) {
                    if(matches1[k]) {
                        while(!matches2[k] && k < matches2.length)
                        k++;
                        if(s1[i] != s2[k] &&  k < matches2.length)  {
                        t++;
                    }

                        k++;
                    }
            }

            //debug helpers:
            //console.log(" - matches: " + m);
            //console.log(" - transpositions: " + t);
            t /= 2.0;
            return (m / s1.length + m / s2.length + (m - t) / m) / 3;
        }
        private static _tokenCars:string[]="0123456789abcdef".split("");
        private static _tokenCarsLength:number = Strings._tokenCars.length-1;
        public static getUniqueToken(size:number = 64):string
        {
            var token:string = Date.now()+"";
            while(token.length<size)
            {
                token+=Strings._tokenCars[ghost.utils.Maths.randBetween(0,Strings._tokenCarsLength)];
            }
            return token;
        }

    }
}
///<reference path="../core/core.class.d.ts"/>
namespace ghost.utils
{
    export class Classes
    {
        public static getName(cls:Function):string
        {
            var funcNameRegex = /function (.{1,})\(/;
            var results  = (funcNameRegex).exec(cls+"");
            return (results && results.length > 1) ? results[1] : "";
        }
        /**
         * Tests if a class exists
         * @param name Class name
         * @return true or false
         */
        public static exists(name:string):boolean
        {
            if(!name)
            {
                return false;
            }
            var root:any = ROOT;
            var names:string[] = name.split(".");
            var len:number = names.length;
            for(var i:number=0; i<len; i++)
            {
                root = root[names[i]];
                if(!root)
                {
                    return false;
                }
            }
            return true;
        }
        /**
         * Tests if a class exists
         * @param name Class name
         * @return class constructor
         */
        public static get(name:string):any
        {
            if(!name)
            {
                return null;
            }
            var root:any = ROOT;
            var names:string[] = name.split(".");
            
            var len:number = names.length;
            for(var i:number=0; i<len; i++)
            {
                root = root[names[i]];
                if(!root)
                {
                    return root;
                }
            }
            return root;
        }
        public static isArray(variable:any):boolean
        {
            return Object.prototype.toString.call( variable ) === '[object Array]';
        }
    }
}

namespace ghost.events
{
    /**
     * Event Dispatcher
     */
    export class EventDispatcher extends ghost.core.CoreObject
    {
        public static EVENTS:any = 
        {
            ALL : "all"
        };
        public _eventsK1: any;
        public _eventsK2: any;
        /**
         * named indexed objects for each event
         */
        public _events:any;
        /**
         * named indexed objects for each event. Used by once function
         */

        public _eventsOnce:any;

        /**
         * Mute the dispatcher
         */
        public _muted:boolean = false;

        private _listeners: Listener[];

        private _trigerring: boolean;

        /**
         * Constructor
         */
        public constructor()
        {
            super();
            this._eventsK1 = {};
            this._eventsK2 = {};

            this._events = {};
            this._eventsOnce = {};

            this._listeners = [];
        }

        /**
         * Mutes the event dispatcher
         */
        public mute():void
        {
            this._muted = true;
        }
        /**
         * Unmutes the event dispatcher
         */
        public unmute():void
        {
            this._muted = false;
        }
        /**
         * Tests if the event dispatcher is muted
         */
        public isMuted():boolean
        {
            return this._muted;
        }
        public trigger(name:string, ...data:any[]):void
        {
            if (!this._listeners) {
                //disposed
                return;
            }

            if(this._muted)
            {
                return;
            }
            if(!name)
            {
                debugger;
                throw(new Error("event's name can't be null"));
            }

            var key1:string;
            var key2:string;
            if(name.indexOf(":") != -1)
            {
                var parts:string[] = name.split(":");
                key1 = parts[0];
                key2 = parts.slice(1).join(":");
                if(key1 == "" || !key1)
                {
                    key1 = EventDispatcher.EVENTS.ALL;
                }
                if(key2 == "" || !key2)
                {
                    key2 = null;
                }
            }else
            {
                key1 = name;
                key2 = null;//EventDispatcher.EVENTS.ALL;
            }
            //var len: number = this._listeners.length;
            var i: number = 0;
            var listener: Listener;
            var listeners: Listener[] = this._listeners.slice();
            //copy array & remove once after ?
            var len: number = listeners.length;
            while (i < len)
            {
                listener = listeners[i];
                if (listener.disposed !== true && (listener.key1 == key1 || listener.key1 == EventDispatcher.EVENTS.ALL || key1 == EventDispatcher.EVENTS.ALL) && (listener.key2 == EventDispatcher.EVENTS.ALL || listener.key2 == key2 || key2 == EventDispatcher.EVENTS.ALL))
                {
                    if (listener.key1 == EventDispatcher.EVENTS.ALL) 
                    {
                        listener.execute(data, [key1]);
                    }else
                    {
                        listener.execute(data);
                    }
                    //test if the current dispatcher has been disposed();
                    if(listener.once)
                    {

                        listener.dispose();
                        //this._listeners.splice(i, 1);
                        //len--;
                      //  continue;
                    }
                }
                i++;
            }
            //disposed between
            if (!this._listeners)
            {
                return;
            }
            i = 0;
            len = this._listeners.length;
            while(i<len)
            {
                if (this._listeners[i].disposed === true)
                {
                    this._listeners.splice(i, 1);
                    len--;
                    continue;
                }            
                i++;    
            }


            //for dispose maybe set a variable to running & only dispose listeners after the running
            //for off ?
        }

        public on(name:string, callback:Function, scope?:any, ...parameters:any[]):void
        {
            return this.__on(false, name, callback, scope, parameters);
        }
        private __on(once:boolean, name:string, callback:Function, scope:any, parameters:any[]):void
        {
            if (!this._listeners) {
                //disposed
                return;
            }
            if(!name)
            {
                throw(new Error("event's name can't be null"));
            }
            if(!callback)
            {
                throw(new Error("callback is required"));
            }
            if(name.indexOf(" ")>-1)
            {
                var names:string[] = name.split(" ");
                for(var p in names)
                {
                    if(names[p].length>0)
                    {
                       // this.once.apply(this, [names[p],callback, scope].concat(parameters));
                        this.__on(once, names[p], callback, scope, parameters); 
                    }
                }
                return;
            }
            var key1:string;
            var key2:string;
            if(name.indexOf(":") != -1)
            {
                var parts:string[] = name.split(":");
                key1 = parts[0];
                key2 = parts.slice(1).join(":");
                if(key1 == "" || !key1)
                {
                    key1 = EventDispatcher.EVENTS.ALL;
                }
                if(key2 == "" || !key2)
                {
                    key2 = EventDispatcher.EVENTS.ALL;
                }
            }else
            {
                key1 = name;
                key2 = EventDispatcher.EVENTS.ALL;
            }
          ///  if(key1 == "page_changed")
          //console.log("TT___on["+once+"]=>"+name +"      |    "+key1+":"+key2);
            var listener:Listener = new Listener(key1, key2, once, callback, scope, parameters);
            this._listeners.push(listener);
        }
        public once(name:string, callback:Function, scope?:any, ...parameters:any[]):void
        {
           return this.__on(true, name, callback, scope, parameters);
        }
        public off(name?:string,  callback?:Function, scope?:any):void
        {
            if (!this._listeners)
            {
                //disposed
                return;
            }
//debugger;
            var key1:string, key2:string; 
            var listener:Listener;  

            //TODO:off with new system
            if(name)
            {
                 if(name.indexOf(" ")>-1)
                {
                    var names:string[] = name.split(" ");
                    for(var p in names)
                    {
                        if(names[p].length>0)
                        {
                            this.off(names[p],callback, scope);
                        }
                    }
                    return;
                }
                var index:number;
                if((index = name.indexOf(":")) != -1)
                {
                    key1 = name.substring(0, index);
                    key2 = name.substring(index + 1);
                }else
                {
                    key1 = name;
                }
            }
            if(!key1 || key1 == "")
            {
                key1 = EventDispatcher.EVENTS.ALL;
            }
            if(!key2 || key2 == "")
            {
                key2 = EventDispatcher.EVENTS.ALL;
            }

            if (!name) {
                while(this._listeners.length)
                {
                    this._listeners.shift();//.dispose();
                }
                return;
            }

            var len: number = this._listeners.length;
            var i: number = 0;
            var listener: Listener;
            while (i < len) {
                listener = this._listeners[i];
                if ((!callback || callback === listener.callback) && (!scope || scope === listener.scope) && (listener.key1 == key1 || key1 == EventDispatcher.EVENTS.ALL) && (listener.key2 == key2 || key2 == EventDispatcher.EVENTS.ALL)) {
                        this._listeners.splice(i, 1);
                        //listener.dispose();
                        len--;
                        continue;
                }
                i++;
            }
        }
        public proxy(callback:Function, scope?:any):any
        {
            scope = scope || this;
            return function()
            {
                return callback.apply(scope, Array.prototype.splice.apply(arguments));
            };
        }
        public dispose():void
        {
            this.destroy();
        }
        public destroy():void
        {
            this._listeners = null;
        }
    }
    /**
     * Private class that represents a listener object
     */
    class Listener
    {

        public instance: number = ghost.utils.Maths.getUniqueID();
        public disposed: boolean;
        constructor(public key1:string, public key2:string, public once:boolean, public callback:Function, public scope?:any, public parameters?:any[])
        {
            if(!callback)
            {
                debugger;
            }
        }
        public isScope(scope:any):boolean
        {
            return scope === this.scope;
        }
        public isCallback(callback:Function):boolean
        {
            return callback === this.callback;
        }
        public execute(parameters?:any[], prefixParams?:any[])
        {
            var params:any[] = parameters.length?parameters.concat(this.parameters):this.parameters;
            if(prefixParams){
                params = prefixParams.concat(params);
            }
            this.callback.apply(this.scope, params/*parameters.concat(params)*/);
        }
        public dispose():void
        {
            this.callback = null;
            this.scope = null;
            this.parameters = null;
            this.once = false;
            this.disposed = true;
        }
    }
}
///<file="EventDispatcher"/>
///<module="core"/>
///<module="utils"/>
namespace ghost.events
{
    
    /**
     * Events manager
     * @type _Events
     * @private
     */
    export class _Eventer extends ghost.events.EventDispatcher
    {
         /**
         * This event is fired when screen orientation changed or screen resize
         * @type {string}
         */
        public SCREEN_ORIENTATION_CHANGE = "orientationchange";
        /**
         * This event is fired when screen orientation changed or screen resize
         * @type {string}
         */
        public SCREEN_RESIZE = "orientationchange";
        /**
         * This is an event that fires when Cordova is fully loaded.
         * @type {string}
         */
        public DEVICE_READY = "deviceready";
        /**
         * This is an event that fires when a Cordova application is put into the background.
         * @type {string}
         */
        public APPLICATION_PAUSE = "pause";
        /**
         * This is an event that fires when a Cordova application is ready and Dom Loaded.
         * @type {string}
         */
        public APPLICATION_READY = "application_ready";
        /**
         * This is an event that fires when a Cordova application is ready, JQuery-like is ready and Dom Loaded.
         * @type {string}
         */
        public $APPLICATION_READY = "$application_ready";
        /**
         * This is an event that is fired when a JQuery-like library is ready
         */
        public $JQUERY_LIKE_READY = "$jquery-like";
        /**
         * This is an event that fires when a Cordova application is retrieved from the background.
         * @type {string}
         */
        public APPLICATION_RESUME = "resume";
        /**
         * This is an event that fires when a Cordova application is online (connected to the Internet).
         * @type {string}
         */
        public NETWORK_ONLINE = "online";
        /**
         * This is an event that fires when a Cordova application is offline (not connected to the Internet).
         * @type {string}
         */
        public NETWORK_OFFLINE = "offline";
        /**
         * This is an event that fires when the user presses the back button.
         * @type {string}
         */
        public KEYBOARD_BACK_BUTTON = "backbutton";
        /**
         * This is an event that fires when the user presses the menu button.
         * @type {string}
         */
        public KEYBOARD_MENU_BUTTON = "menubutton";
        /**
         * This is an event that fires when the user presses the search button on Android.
         * @type {string}
         */
        public KEYBOARD_SEARCH_BUTTON = "searchbutton";
        /**
         * This is an event that fires when the user presses the start call button.
         * @type {string}
         */
        public KEYBOARD_START_CALL_BUTTON = "startcallbutton";
        /**
         * This is an event that fires when the user presses the end call button.
         * @type {string}
         */
        public KEYBOARD_STOP_CALL_BUTTON = "endcallbutton";
        /**
         * This is an event that fires when the user presses the volume down button.
         * @type {string}
         */
        public KEYBOARD_VOLUME_DOWN_BUTTON = "volumedownbutton";
        /**
         * This is an event that fires when the user presses the volume up button.
         * @type {string}
         */
        public KEYBOARD_VOLUME_UP_BUTTON = "volumeupbutton";
        /**
         * This is an event that fires when a Cordova application detects the battery has reached the critical level threshold.
         * @type {string}
         */
        public BATTERY_CRITICAL = "batterycritical";
        /**
         * This is an event that fires when a Cordova application detects the battery has reached the low level threshold.
         * @type {string}
         */
        public BATTERY_LOW = "batterylow";
        /**
         * This is an event that fires when a Cordova application detects a change in the battery status.
         * @type {string}
         */
        public BATTERY_STATUS = "batterystatus";
        /**
         * This is an event that fires when the hash has changed.
         * @type {string}
         */
        public HASH_CHANGE = "hashchange";
        /**
         * This is the event fired when the dom is loaded.
         * @type {string}
         */
        public DOM_LOADED = "load";
         /**
         * This is the event fired when the dom is loaded and ready.
         * @type {string}
         */
        public DOM_READY = "dom_ready";
    
        /**
         * This event is fired when the page is changed by the navigation manager.
         * @type {string}
         */
        public PAGE_CHANGED = "page_changed";
        /**
         * List all events to listen. (linked to document)
         * @type {Array}
         * @private
         */
        private _list:string[] = 
        [
            this.DEVICE_READY,
            this.APPLICATION_PAUSE,
            this.APPLICATION_RESUME,

            this.KEYBOARD_BACK_BUTTON,
            this.KEYBOARD_MENU_BUTTON,
            this.KEYBOARD_SEARCH_BUTTON,
            this.KEYBOARD_START_CALL_BUTTON,
            this.KEYBOARD_STOP_CALL_BUTTON,
            this.KEYBOARD_VOLUME_DOWN_BUTTON,
            this.KEYBOARD_VOLUME_UP_BUTTON,
            this.BATTERY_CRITICAL,
            this.BATTERY_LOW,
            this.BATTERY_STATUS,
            this.SCREEN_ORIENTATION_CHANGE
        ];
        /**
         * List all events to listen. (linked to window)
         * @type {Array}
         * @private
         */
        private _listWindow:string[] =
        [
            this.DOM_LOADED,
            this.HASH_CHANGE,
            this.NETWORK_ONLINE,
            this.NETWORK_OFFLINE
        ];
            
        private _deviceReady:boolean = false;
        private _domReady:boolean = false;
        private _$Ready:boolean = false;
        private _allReady:boolean = false;
        private _$allReady:boolean = false;
        
        constructor()
        {
            super();
            if(!ROOT.document)
                return;
            var _this = this;
            var len = this._list.length;
            
            for(var i=0; i<len; i++)
            {
                this._addListener(this._list[i], ROOT.document);
            }
            len = this._listWindow.length;
            for(i=0; i<len; i++)
            {
                this._addListener(this._listWindow[i], ROOT);
            }
            ROOT.document.addEventListener(this.DEVICE_READY, function(event)
            {
                _this._triggerDeviceReady(event);
               
            }, false);
            ROOT.addEventListener(this.DOM_LOADED, function(event)
            {
                ROOT["loaded"] = true;
            }, false);
            this._checkDomReady(function(event)
            {
                if(!_this._domReady )
                {
                        
                    _this._domReady = true;
                    ROOT["loaded"] = true;
                    _this.trigger(_this.DOM_READY, event);
                    _this._dispatchAllReady();
                    
                }
            });
            if(ROOT.$)
            {
                ROOT.$(function() {
                    _this._$Ready = true;
                    _this.trigger(_this.$JQUERY_LIKE_READY);
                    _this._dispatchAllReady();
                });
            }
          
            //some devices don't dispatch orientationchanged event
            ROOT.addEventListener("resize", function(event) {
                _this.trigger(_this.SCREEN_ORIENTATION_CHANGE, event);
            }, false);



            //simulate cordova for non phonegap projet
            if(ghost.core.Hardware.isBrowser())
            {
                if(!ROOT.cordova)
                {
                   // console.log("False Cordova is Ready");
                    this._triggerDeviceReady();
                    ghost.constants.cordovaEmulated = true;
                }
                else
                {
                    //emulator
                    if(ROOT.location.href.indexOf("file://")==-1 || ROOT.location.href.indexOf("ripple")>-1 || ROOT.location.href.indexOf("local")>-1)
                    {
                        ghost.constants.cordovaEmulated = true;
                  //      console.log("Cordova['emulated'] is Ready");

                        if(ROOT.location.href.indexOf("ripple")==-1)
                        {
                            this._triggerDeviceReady();
                        }
                    }
                }
            }

        }
        /**
         * Should not be called by user
         */
        public _triggerDeviceReady(event?:Event):void
        {
            if(!event)
            {
               // console.log("DEVICE READY EMULATED");
            }
            if(!this._deviceReady)
            {
                this._deviceReady = true;
                if(!event)
                    this.trigger(this.DEVICE_READY);
                
                this._dispatchAllReady();
                
            }
            
        }
        
        private _checkDomReady(callback:any):void
        {
            /* Mozilla, Chrome, Opera */
            if (ROOT.document.addEventListener) {
                ROOT.document.addEventListener("DOMContentLoaded", callback, false);
                return;
            }
            /* Safari, iCab, Konqueror */
            if (/KHTML|WebKit|iCab/i.test(ROOT.navigator.userAgent)) {
                var DOMLoadTimer = setInterval(function () {
                    if (/loaded|complete/i.test(ROOT.document.readyState)) {
                        callback();
                        clearInterval(DOMLoadTimer);
                    }
                }, 10);
                return;
            }
            /* Other web browsers */
            window.onload = callback;
        }
        private _dispatchAllReady():void
        {

            if(!this._allReady && this._domReady && this._deviceReady)
            {
                this._allReady = true;
                this.trigger(this.APPLICATION_READY);
                if(!this._$allReady && this._$Ready)
                {
                    this._$allReady = true;
                    this.trigger(this.$APPLICATION_READY);
                    
                }
            }
                
        }
        /**
         * Adds a listener for an event
         * @param name Event's name
         * @private
         */
        private _addListener(name, object)
        {
            var _this = this;
            object.addEventListener(name, function(event)
            {
                //console.log(name, object, event);
                _this.trigger(name, event);
            }, false);
        }
        private _on(name:string, listener:Function, thisObject:any):void
        {
            return super.on(name, listener, thisObject);
        }
        private _once(name:string, listener:Function, thisObject:any):void
        {
            return super.once(name, listener, thisObject);
        }
        public once(name:string, listener:Function, thisObject?:any, ...parameters:any[]):void
        {
            if(name == this.DEVICE_READY)
            {
                if(this._deviceReady)
                {
                    if(listener)
                    {
                        listener.apply(thisObject, parameters);
                        return;
                    }
                }
            }
            else
            if(name == this.APPLICATION_READY)
            {
                if(this._allReady)
                {
                    if(listener)
                    {
                        listener.apply(thisObject, parameters);
                        return;
                    }
                }
            }
            else
            if(name == this.DOM_LOADED)
            {
                if(window["loaded"])
                {
                    if(listener)
                    {
                        listener.apply(thisObject, parameters);
                        return;
                    }
                }
            }
            else
            if(name == this.DOM_READY)
            {
                if(this._domReady)
                {
                    if(listener)
                    {
                        listener.apply(thisObject, parameters);
                        return;
                    }
                }
            }else
            if(name == this.$APPLICATION_READY)
            {
                if(this._$allReady)
                {
                    if(listener)
                    {
                        listener.apply(thisObject, parameters);
                        return;
                    }
                }
            }
            return this._once.apply(this, Array.prototype.slice.apply(arguments) );
        }
        public onThrottle(name:string, listener:Function, delay:number=300, thisObject?:any, ...parameters:any[]):void
        {
            var params:any[] = [];
            params.push(name);
            params.push(ghost.utils.Buffer.throttle(listener, delay));
            params.push(thisObject);
            params = params.concat(parameters);
            this.on.apply(this, params);
        }
        public on(name:string, listener:Function, thisObject?:any, ...parameters:any[]):void
        {
            if(name == this.DEVICE_READY)
            {
                if(this._deviceReady)
                {
                    if(listener)
                    {
                        listener.apply(thisObject, parameters);
                    }
                }
            }
            else
            if(name == this.APPLICATION_READY)
            {
                if(this._allReady)
                {
                    if(listener)
                    {
                        listener.apply(thisObject, parameters);
                    }
                }
            }
            else
            if(name == this.DOM_LOADED)
            {
                if(window["loaded"])
                {
                    if(listener)
                    {
                        listener.apply(thisObject, parameters);
                    }
                }
            }
            else
            if(name == this.DOM_READY)
            {
                if(this._domReady)
                {
                    if(listener)
                    {
                        listener.apply(thisObject, parameters);
                    }
                }
            }else
            if(name == this.$APPLICATION_READY)
            {
                if(this._$allReady)
                {
                    if(listener)
                    {
                        listener.apply(thisObject, parameters);
                    }
                }
            }
            return this._on.apply(this, Array.prototype.slice.apply(arguments) );
        } 
    }
    /**
     * Event bus
     */
    export var Eventer:_Eventer = new _Eventer();
}

///<module="events"/>
