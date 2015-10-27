///<lib="node"/>
namespace ghost.io
{
    var mime = require("mime");
    var fs = require("fs");
    var path = require("path");
    export class File
    {
        private static rawMimeType:string[] = ["image/png", "image/jpg", "image/jpeg"];
        private path:string;
        private mime:string;
        private extension:string;
        private stats:any;
        public constructor(path:string)
        {
            this.path = path;
            this.mime = undefined;
            this.extension = undefined;
            this.stats = undefined;
        }
        private _getEncoding()
        {
            var encoding = "utf8";
            if(File.rawMimeType.indexOf(this.getMimeType())>-1)
            {
                encoding = "binary";
            }
            return encoding;
        }
        /**
         * Gets file content. Calls getStats() during execution.
         * @param callback Callback function(success, data). If current file is a directory data is an array with file's names.
         * @param encoding ascii, utf8 or base64. Default : utf8
         * @see getStats()
         */
        public read = function(callback?:Function, encoding?:string):void
        {
            console.log(process.cwd());
            if(callback != undefined)
            {
                if(encoding == undefined)
                {
                    encoding = this._getEncoding();
                }
                var self = this;
                self.getStats( function(success, stats)
                {
                    if(success)
                    {
                        self.stats = stats;
                        if(!self.isDirectory())
                        {
                            fs.readFile(self.path, encoding, function(error, data)
                            {
                                var hasError = error != undefined;
                                callback(!hasError, hasError?error:data);
                            });
                        }else
                        {
                            fs.readdir(self.path, function(error, files)
                            {
                                var hasError = error != undefined;
                                callback(!hasError, hasError?error:files);
                            });
                        }
                    }else
                    {
                        callback(false, stats);
                    }
                });
            }
        }
        public getStats = function(callback?:Function):void
        {
            var self = this;
            fs.stat(this.path, function(error, stats)
            {
                if(error == null)
                {
                    self.stats = stats;
                }
                if(callback != undefined)
                {
                    callback(error == null, error == null?stats:error);
                }
            });
        }
        public isDirectory = function():boolean
        {
            if(this.stats == undefined)
            {
                throw(new Error("You have to gets stats before use this function."));
            }else
            {
                return this.stats.isDirectory();
            }
        }
        public getExtension():string
        {
            if(this.extension == undefined)
            {
                this.extension = path.extname(this.path).substring(1);
            }
            return this.extension;
        }
        public getMimeType():string
        {
            if(this.mime == undefined)
            {
                this.mime = mime.lookup(this.path);
            }
            return this.mime ;
        }
        public write(data:any, callback?:Function):void;
        public write(data:any, encoding?:string, callback?:Function):void;
        public write(data:any, encoding?:string|Function, callback?:Function):void
        {
            if(typeof encoding == "function")
            {
                callback = <Function>encoding;
                encoding = "utf8";
            }
            if(callback != null)
            {
                fs.writeFile(this.path, data, encoding, function(error)
                {
                    callback(error==undefined, error);
                });
            }else
            {
                fs.writeFile(this.path, data);
            }
        }
        public remove(callback?:Function):void
        {
            if(callback != null)
            {
                fs.unlink(this.path, function()
                {
                    callback();
                });
            }else
                fs.unlink(this.path);
        }
    }
 }