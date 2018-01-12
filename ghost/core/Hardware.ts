//convert
 /* ghost.core.Root.*/
import {Root} from "ghost/core/Root";


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
            return Root.getRoot()._isNode;
        }
        public static isBrowser():boolean
        {
            return !Root.getRoot()._isNode;
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
            return Root.getRoot().device?Root.getRoot().device.cordova:0;
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
            if(Root.getRoot().device)
            {
                return Root.getRoot().device.platform;
            }
            var agent = Root.getRoot() && Root.getRoot().navigator && Root.getRoot().navigator.userAgent?navigator.userAgent.toLowerCase():"node";
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
            if(agent.indexOf("iphone")!=-1 || agent.indexOf("ipod")!=-1 || agent.indexOf("ipad")!=-1)
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
            return Root.getRoot() && Root.getRoot().navigator && Root.getRoot().navigator.language?Root.getRoot().navigator.language:"en";
        }
        /**
         * Get the device's Universally Unique Identifier (UUID).
         * @returns {string}
         */
        public static getUUID():string
        {
            return Root.getRoot().device?Root.getRoot().device.uuid:"uuid";
        }
        /**
         * Get the operating system version.
         * @returns {string}
         */
        public static getOSVersion():string
        {
            return Root.getRoot().device?Root.getRoot().device.version:"unkown";
        }
        /**
         * Get the device's model name.
         * @returns {string}
         */
        public static getModel():string
        {
            return Root.getRoot().device?Root.getRoot().device.model:"unkown";
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

        public static isChrome():boolean
        {
            var browser:string = Hardware.getBrowser().toLowerCase();
            return browser.indexOf('chrome') === 0;
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
            return Root.getRoot().innerHeight;
        }
        /**
         * Gets screen width in pixels
         * @returns {Number}
         */
        public static getScreenWidth():number
        {
            return Root.getRoot().innerWidth;
        }
        /**
         * Gets screen orientation
         * @returns {Number} 0 = portrait, 90 = landscape rotated to left, 180 = portrait upside down, -90 = landscape rotated to right
         */
        public static getOrientation():number
        {
            return Root.getRoot()["orientation"];
        }
        /**
         * Gets pixel ratio. 1 = 160 dpi, 2 = 320 dpi...
         * @returns {number}
         */
        public static getPixelRatio():number
        {
            var ratio = 1;
            // To account for zoom, change to use deviceXDPI instead of systemXDPI
            if (Root.getRoot().screen && Root.getRoot().screen.systemXDPI !== undefined && Root.getRoot().screen.logicalXDPI !== undefined && Root.getRoot().screen.systemXDPI > Root.getRoot().screen.logicalXDPI) {
                // Only allow for values > 1
                ratio = Root.getRoot().screen.systemXDPI / Root.getRoot().screen.logicalXDPI;
            }
            else if (Root.getRoot().devicePixelRatio !== undefined) {
                ratio = Root.getRoot().devicePixelRatio;
            }
            return ratio == undefined ? 1 : ratio; 
        }
        /**
         * Gets pixel ratio. avoir weird values like 2.200000047683716
         * @returns {number}
         */
        public static getPixelRatioApproximate():number
        {
            return Math.ceil(Hardware.getPixelRatio() * 10) / 10; 
        }
        /**
         * Gets dpi
         * @returns {number}
         */
        public static getDPI():number
        {
            return 160*Root.getRoot().devicePixelRatio;
        }
        /**
         * Checks if the device is currently on portrait mode
         * @returns {boolean}
         */
        public static isPortrait():boolean
        {
            return Root.getRoot()["orientation"] %180 == 0;
        }
        /**
         * Checks if the device is currently on landscape mode
         * @returns {boolean}
         */
        public static isLandscape():boolean
        {
            return !Hardware.isPortrait();
        }
        public static supportPassive():boolean
        {
            var supportsPassive:boolean = false;
            try {
                var opts = Object.defineProperty({}, 'passive', {
                    get: function() {
                    supportsPassive = true;
                    }
                });
                Root.getRoot().addEventListener("test", null, opts);
            } catch (e) {}
         return supportsPassive;
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
