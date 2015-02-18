///<module="data"/>

module ghost.debug
{
    /**
     * Logger
     */
    export class Log
    {
        /**
         *  All possible stacktrace lines :
         *  at Function.Log.getStackTrace (http://local.over-graph.com/js/users/local/global.js:6249:30)
         at Function.Log.log (http://local.over-graph.com/js/users/local/global.js:6244:27)
         at a (http://local.over-graph.com/js/users/local/global.js:6283:18)
         at <anonymous>:2:1
         at new OG_Widget_Explorer (http://local.over-graph.com/js/init.php:3850:14)
         at Object.InjectedScript._evaluateOn (<anonymous>:562:39)*/

        /**
         * Stack trace line regexp
         */
        private static _REGEXP:RegExp = /at (((new )|(Function\.))?([^ ]*)? ?\()?([^)]+):([0-9]+):([0-9]+)\)?/i;
        /**
         * LEVEL INFO
         */
        private static LEVEL_INFO:string = "INFO";
        /**
         * LEVEL DEBUG
         */
        private static LEVEL_DEBUG:string = "DEBUG";
        /**
         * LEVEL WARN
         */
        private static LEVEL_WARN:string = "WARN";
        /**
         * LEVEL ERROR
         */
        private static LEVEL_ERROR:string = "ERROR";

        /**
         * Blacklist all classes FLAG
         */
        private static BLACKLIST_ALL:string = "___all";

        /**
         * Blacklist list
         */
        private static _black:string[] = [];
        /**
         * Whitelist list
         */
        private static _white:string[] = [];
        /**
         * Known list
         */
        private static _known:string[] = [];

        /**
         * All classes that can be filtered
         * @type {Array}
         * @private
         */
        private static _classes:string[] = [];
        /**
         * If set to true will block hardcoded white/black-listing. Only console-made calls will be listen.
         * false by default, but set to true if a white/blacklist is saved with log.save(); function
         */
        private static _manuallyLogged:boolean = false;

        private static _hasColors:boolean = false;

        /**
         * Log to INFO level
         * @data Data to log
         */
        public static info(data:any):void
        {
            Log.log(data, Log.LEVEL_INFO);
        }
        /**
         * Log to WARN level
         * @data Data to log
         */
        public static warn(data:any):void
        {
            Log.log(data, Log.LEVEL_WARN);
        }
        /**
         * Log to DEBUG level
         * @data Data to log
         */
        public static debg(data:any):void
        {
            Log.log(data, Log.LEVEL_DEBUG);
        }
        /**
         * Log to ERROR level
         * @data Data to log
         */
        public static error(data:any):void
        {
            Log.log(data, Log.LEVEL_ERROR);
        }
        /**
         * Hides a class from the log
         * @cls If specified will hide this class otherwise will hide the calling class. If there is no calling class, will hide "window" calls
         */
        public static hide(cls:string = null):void
        {
            if(Log._manuallyLogged)
            {
                var _cls:any = Log.getStackTrace(3);
                if(!_cls || _cls.file != "<anonymous>")
                {
                    return;
                }
            }
            if(!cls)
            {
                var stackline:any = Log.getStackTrace(2);
                if(stackline)
                {
                    cls = stackline.cls;
                }
                if(!cls)
                {
                    cls = "window";
                }
            }
            var index:number;
            if((index = Log._white.indexOf(cls))!=-1)
            {
                Log._white.splice(index, 1);
            }
            if((index = Log._black.indexOf(cls))==-1)
            {
                Log._black.push(cls);
            }
        }
        /**
         * Show a class to the log
         * @cls If specified will show this class otherwise will show the calling class. If there is no calling class, will show all "window" calls
         */
        public static show(cls:string = null):void
        {
            if(Log._manuallyLogged)
            {
                var _cls:any = Log.getStackTrace(3);
                if(!_cls || _cls.file != "<anonymous>")
                {
                    return;
                }
            }
            if(!cls)
            {
                var stackline:any = Log.getStackTrace(2);
                if(stackline)
                {
                    cls = stackline.cls;
                }
                if(!cls)
                {
                    cls = "window";
                }
            }
            var index:number;
            if((index = Log._black.indexOf(cls))!=-1)
            {
                Log._black.splice(index, 1);
            }
            if((index = Log._white.indexOf(cls))==-1)
            {
                Log._white.push(cls);
            }
        }
        /**
         * Unblacklist all classes
         */
        public static showAll():void
        {
            if(Log._manuallyLogged)
            {
                var cls:any = Log.getStackTrace(3);
                if(!cls || cls.file != "<anonymous>")
                {
                    return;
                }
            }
            Log._black.length = 0;
        }
        /**
         * Blacklist all classes.
         * @force if set to false will blacklist all classes except previously whitelisted ones.
         */
        public static hideAll(force:boolean = false):void
        {
            if(Log._manuallyLogged)
            {
                var cls:any = Log.getStackTrace(3);
                if(!cls || cls.file != "<anonymous>")
                {
                    return;
                }
            }
            if(force)
            {
                Log._white.length = 0;
            }
            Log._black = [Log.BLACKLIST_ALL];
        }


        /**
         * Called at the beginning of the program.
         */
        public static init():void
        {
            if((<any>console).groupCollapsed)
            {
                Log._hasColors = true;
            }
            var white:string[] = ghost.data.Cookies.getCookie("LOG_WHITE");
            if(white)
            {
                Log._white = white;
                Log._white.sort();
                if(Log._hasColors)
                    (<any>console).groupCollapsed("%c[LOG_LOAD]White:"+JSON.stringify( Log._white),'color:#339900; font-weight:bold;');
                else
                    console.log(JSON.stringify( Log._white));

                var len:number = Log._white.length;
                for(var i:number=0; i<len; i++)
                {
                    if(Log._hasColors)
                        console.log("%c"+Log._white[i],'color:#339900;');
                    else
                    {
                        console.log(Log._white[i]);
                    }
                }
                if(Log._hasColors)
                    (<any>console).groupEnd();
                Log._manuallyLogged = true;
            }
            var black:string[] = ghost.data.Cookies.getCookie("LOG_BLACK");
            if(black)
            {
                Log._black = black;
                Log._black.sort();
                if(Log._hasColors)
                    (<any>console).groupCollapsed("%c[LOG_LOAD]Black:"+JSON.stringify( Log._black),'color:#CC0000; font-weight:bold;');
                else
                    console.log(JSON.stringify( Log._black));
                var len:number = Log._black.length;
                for(var i:number=0; i<len; i++)
                {
                    if(Log._hasColors)
                        console.log("%c"+Log._black[i],'color:#CC0000;');
                    else
                    {
                        console.log(Log._black[i]);
                    }
                }
                if(Log._hasColors)
                    (<any>console).groupEnd();
                Log._manuallyLogged = true;
            }
            var known:string[] = ghost.data.Cookies.getCookie("LOG_KNOWN");
            if(known)
            {
                 Log._known = known;
            }/*
            if(!Log._manuallyLogged)
            {
                if(Log._hasColors)
                    console.log("%c[LOG_INFO]To learn how to use the new Log system, go to : https://909cfr.podio.com/over-graph/apps/reference-library/items/13",'color:#339900; font-weight:bold;');
                else
                {
                    console.log("[LOG_INFO]To learn how to use the new Log system, go to : https://909cfr.podio.com/over-graph/apps/reference-library/items/13");
                }
            }*/


        }
        /**
         * @return list of whitelisted classes
         */
        public static getWhites():string[]
        {
            return Log._white;
        }
        /**
         * @return list of blacklisted classes
         */
        public static getBlacks():string[]
        {
            return Log._black;
        }
        /**
         * Saves current lists to a cookie for future launches
         */
        public static save():void
        {
            ghost.data.Cookies.setCookie("LOG_WHITE", Log._white);
            ghost.data.Cookies.setCookie("LOG_BLACK", Log._black);
            console.log("%c[LOG_SAVE]White:"+JSON.stringify( Log._white),'color:#339900; font-weight:bold;');
            console.log("%c[LOG_SAVE]Black:"+JSON.stringify( Log._black),'color:#339900; font-weight:bold;');
        }
        /**
         * Clear current save from cookie
         */
        public static clearSave():void
        {
            ghost.data.Cookies.removeCookie("LOG_WHITE");
            ghost.data.Cookies.removeCookie("LOG_BLACK");
            console.log("%c[LOG_CLEAR_SAVE]",'color:#339900; font-weight:bold;');
        }
        public static getAllClasses():string[]
        {
            return Log._classes;
        }
        public static showAllClasses():void
        {
            (<any>console).group("%c[LOG_CLASSES]",'color:#339900; font-weight:bold;');
            Log._classes.sort();
            var len:number = Log._classes.length;
            for(var i:number=0; i<len; i++)
            {
                console.log("%c"+Log._classes[i],(Log._isBlacklist(Log._classes[i])?'color:#CC0000;':'color:#339900;'));
            }
            (<any>console).groupEnd();
        }
        private static _isBlacklist(cls:string):boolean
        {
            if(cls == null)
            {
                cls = "window";
            }
            if(Log._black.length>0)
            {
                if(Log._white.indexOf(cls)==-1)
                {
                    return Log._black[0] == Log.BLACKLIST_ALL || Log._black.indexOf(cls)!=-1;
                }
            }
            return false;
        }
        private static log(data:any, level:string = null):void
        {
            if(!Log._hasColors)
            {
                try {
                    console.log(JSON.stringify(data));
                } catch(err)
                {
                    console.log(data);
                }
                return;
            }

            var stackline:any = Log.getStackTrace(3);
            if(stackline && stackline.cls && Log._classes.indexOf(stackline.cls)==-1)
            {
                Log._classes.push(stackline.cls);
                if(Log._known.indexOf(stackline.cls)==-1)
                {
                    Log._known.push(stackline.cls);
                    ghost.data.Cookies.setCookie("LOG_KNOWN", Log._known);
                    if(Log._manuallyLogged && Log._black.indexOf(Log.BLACKLIST_ALL)!=-1)
                    {
                        console.warn("%c[LOG_NEW_CLASS]A new class has been detected, maybe you should add it to your whitelist : "+stackline.cls,'color:#339900; font-weight:bold;');
                    }
                }
            }
            if(!stackline || Log._isBlacklist(stackline.cls))
            {
               return;
            }
            var isData:boolean = false;
            var dataStr:string;


            if((typeof data == "object" || typeof data == "function" || typeof data == "xml") && data!=null)
            {
                try
                {
                    isData = true;
                    dataStr = JSON.stringify(data);
                    if(dataStr == null)
                    {
                        dataStr = data + "";
                    }
                }catch(error)
                {
                    dataStr = data + "";
                }
            }else
            {
                dataStr = data+"";
            }
            var index:number;
            if(dataStr!=null)
            {

                if((index=dataStr.indexOf("\n"))!=-1)
                {
                    dataStr = dataStr.substring(0, index)+"...";
                    isData = true;
                }
                if(dataStr.length>50)
                {
                    dataStr = dataStr.substring(0, 50)+"...";
                    isData = true;
                }

            }

            if(stackline)
            {

                var txt:string = "%c"+(stackline.cls?stackline.cls+"::":"")+"%c"+stackline.func+"()%c_%c"+dataStr+"%c_%c";
                var line:string = "%c"+stackline.file+":"+stackline.line+":"+stackline.column+"";
                var colors:string[] = [];

                var color:string;
                var func:any;
                switch(level)
                {
                    case Log.LEVEL_ERROR:
                        color="red";
                        func=console.error;
                        break;
                    case Log.LEVEL_WARN:
                        color="orange";
                        func=console.warn;
                        break;
                    case Log.LEVEL_DEBUG:
                        color="black";
                        func=console.info;
                        break;
                    default:
                    case Log.LEVEL_INFO:
                        color="#0099FF";
                        func=console.info;
                        break;
                }
                colors =['color:'+color+';font-weight:lighter;', 'color:grey;font-weight:lighter;','color:black;font-weight:lighter;','color:grey;font-weight:lighter;', 'color:'+color+';font-weight:bold;','color:grey;font-weight:lighter;','font-weight:lighter;'];
                (<any>console).groupCollapsed.apply(console, ["%c["+level+"]"+txt].concat(colors));
                if(isData)
                    func.apply(console,[data]);
                func.apply(console,[line, 'color:black;']);
                console.trace();
                (<any>console).groupEnd();


            }else
            {
                //uncomment si on veut logger sur un autre navigateur que chrome
                //console.log(data+"");
            }
        }
        private static getStackTrace(line:number = 0):any
        {
            line++;
            var stack:string = (<any>new Error()).stack;
            if(stack)
            {
                //console.warn(stack);
                var aStack:string[] = stack.split("\n");
                if(aStack.length>line)
                {
                    var strLine:string = aStack[line];
                    if(Log._REGEXP.test(strLine))
                    {
                        var result:string[];
                        if((result = strLine.match(Log._REGEXP)) != null)
                        {
                            var column:number = parseInt(result[8]);
                            var line:number = parseInt(result[7]);
                            var file:string = result[6];
                            var func:string = result[5];
                            var index:number;
                            var cls:string = func && (index=func.lastIndexOf("."))!=-1?func.substring(0, index):null;
                            if(cls)
                            {
                                func = func.substring(index+1);
                            }
                            if(result[2] == "new ")
                            {
                                cls = func;
                                func = "constructor";
                            }

                            var fileshort:string = file;
                            if((index = file.indexOf("js/"))!=-1)
                            {
                                fileshort = file.substring(index+3);
                            }
                            if(func == undefined)
                            {
                                //console.error(stack);
                            }
                            return {
                                column:column,
                                line:line,
                                file:file,
                                fileshort:fileshort,
                                func:func,
                                cls:cls?cls:"window"
                            };

                        }

                    }

                }
            }
            return null;
        }
    }
}

var log = ghost.debug.Log;

log.init();
if(document.location.href.indexOf("local")==-1 && document.location.href.indexOf("remote")==-1)
{
    log.hideAll();
}else
{
    log.showAll();

}
