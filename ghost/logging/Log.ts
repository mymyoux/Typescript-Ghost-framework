///<lib="node"/>
///<module="utils"/>
namespace ghost.logging
{
	var colors:any = require('colors');
	var json2: any = require("JSON2");
	colors.setTheme({
		silly: 'rainbow',
		input: 'grey',
		verbose: 'cyan',
		prompt: 'grey',
		info: 'white',
		data: 'grey',
		help: 'cyan',
		warn: 'magenta',
		debug: 'cyan',
		error: 'red'
	});
	export class log
	{

        /**
         * Stack trace line regexp
         */
        private static _REGEXP: RegExp = /at (((new )|(Function\.))?([^ ]*)? ?\()?([^)]+):([0-9]+):([0-9]+)\)?/i;
		/**
         * LEVEL INFO
         */
        public static LEVEL_INFO: string = "INFO";
        /**
         * LEVEL DEBUG
         */
        public static LEVEL_DEBUG: string = "DEBUG";
        /**
         * LEVEL WARN
         */
        public static LEVEL_WARN: string = "WARN";
        /**
         * LEVEL ERROR
         */
        public static LEVEL_ERROR: string = "ERROR";
        /**
         * Levels order
         * @type {string[]}
         */
        private static LEVELS: string[] = [log.LEVEL_INFO, log.LEVEL_DEBUG, log.LEVEL_WARN, log.LEVEL_ERROR];
        /**
         * Level saved
         * @type {any}
         */
        private static levels:any = {};
		public static info(...data: any[]): void {
            for (var p in data) {
                log.log(data[p], log.LEVEL_INFO);
            }
        }
		/**
		* Log to WARN level
		* @data Data to log
		*/
        public static warn(...data: any[]): void {
            for (var p in data) {

                log.log(data[p], log.LEVEL_WARN);
            }
        }
        /**
         * Log to DEBUG level
         * @data Data to log
         */
        public static debug(...data: any[]): void {
            for (var p in data) {

                log.log(data[p], log.LEVEL_DEBUG);
            }
        }
        /**
         * Log to ERROR level
         * @data Data to log
         */
        public static error(...data: any[]): void {
            for (var p in data) {

                log.log(data[p], log.LEVEL_ERROR);
            }
        }
        public static level(levelMin:string):void
        {
			var index: number = log.LEVELS.indexOf(levelMin);
			if(index == -1)
			{
				throw new Error("Level doesn't exist:" + levelMin);
			}
			var stackline: any = log.getStackTrace(2);
			if(stackline && stackline.cls)
			{
				log.levels[stackline.cls] = index;
			}
			
        }
        private static _getDisplayDate():string
        {
			var date: Date = new Date();
			var display: string = "";

			display += ghost.utils.Maths.toMinNumber(date.getHours(), 2) + ":";
			display += ghost.utils.Maths.toMinNumber(date.getMinutes(), 2) + ":";
			display += ghost.utils.Maths.toMinNumber(date.getSeconds(), 2) + ".";
			display += ghost.utils.Maths.toMinNumber(date.getMilliseconds(), 3);

			return display;
        }
        private static log(data: any, level: string = null): void {
			var color: string;
            var func: any;
            switch (level) {
                case log.LEVEL_ERROR:
                    func = colors.error;
                    break;
                case log.LEVEL_WARN:
                    func = colors.warn;
                    break;
                case log.LEVEL_DEBUG:
                    func = colors.debug;
                    break;
                default:
                case log.LEVEL_INFO:
                    func = colors.info;
                    break;
            }
            var index: number = log.LEVELS.indexOf(level);
			var stackline: any = log.getStackTrace(3);
			var label: string;
			if(stackline)
			{
				if (index != -1 && log.levels[stackline.cls]!=undefined && log.levels[stackline.cls] > index)
				{
					//ignore
					return;
				}
				label = colors.data(this._getDisplayDate()) + (stackline.cls && stackline.cls != "null" ? " " + func(stackline.cls + (stackline.func && stackline.func != "<anonymous>" ? "::" + (stackline.func == "constructor" ? "const" : stackline.func) : "")) : "");
			}else
			{
				label = func(this._getDisplayDate());
			}
			try
			{
				console.log(label, data);
			}catch(error)
			{
				console.log(label, json2.stringify(json2.decycle(data)));
			}
        }
        public static getStackTrace(line: number = 0): any {
            line++;
            var stack: string = (<any>new Error()).stack;
            if (stack) {
                //console.warn(stack);
                var aStack: string[] = stack.split("\n");
                if (aStack.length > line) {
                    var strLine: string = aStack[line];
                    if (log._REGEXP.test(strLine)) {
                        var result: string[];
                        if ((result = strLine.match(log._REGEXP)) != null) {
                            var column: number = parseInt(result[8]);
                            var line: number = parseInt(result[7]);
                            var file: string = result[6];
                            var func: string = result[5];
                            var index: number;
                            var cls: string = func && (index = func.lastIndexOf(".")) != -1 ? func.substring(0, index) : null;
                            if (cls) {
                                func = func.substring(index + 1);
                            }
                            if (result[2] == "new ") {
                                cls = func;
                                func = "constructor";
                            }

                            var fileshort: string = file;
                            if ((index = file.indexOf("js/")) != -1) {
                                fileshort = file.substring(index + 3);
                            }
                            if (func == undefined) {
                                //console.error(stack);
                            }
                            return {
                                column: column,
                                line: line,
                                file: file,
                                fileshort: fileshort,
                                func: func,
                                cls: cls ? cls : "window"
                            };

                        }

                    }

                }
            }
            return null;
        }
	}
}
