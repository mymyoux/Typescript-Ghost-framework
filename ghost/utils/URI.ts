

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
        public static buildURI(url:any, params:any = null):string
        {
            if(typeof url == "object")
            {
                params = url;
                url = "";
            }
            if(params)
            {
                url += "?";
                url += URI.objectToString(params);
            }
            return url;
        }
        protected static objectToString(object:any, prefix:string = null):string
        {
            if(!object)
            {
                return object;
            }
            return Object.keys(object).map(function(key) {
                if (object[key] == null)
                {
                    return null;   
                }
                if (typeof object[key] == "object") {
                    return URI.objectToString(object[key], prefix ? prefix + "[" + key + "]" : key);
                }
                return (prefix ? prefix + "[" + key + "]" : key) + '=' + encodeURIComponent(object[key]);
            }).filter(function(value){
                return value != null;
            }).join('&');
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
