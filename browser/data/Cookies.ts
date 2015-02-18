module ghost.data
{
    /**
     * Cookies
     */
    export class Cookies
    {
        public static setCookie(name:string, value:any, expire:number = -1):void
        {
            if(expire != -1)
            {
                var exdate=new Date();
                exdate.setDate(exdate.getDate() + expire);
            }

            var c_value=encodeURI(JSON.stringify(value)) + ((expire==-1) ? "" : "; expires="+exdate.toUTCString());
            document.cookie=name + "=" + c_value;
        }
        public static removeCookie(name:string):void
        {
            document.cookie=name+"="+
                ";expires=Thu, 01 Jan 1970 00:00:01 GMT";
        }
        public static getCookie(name:string):any
        {
            var c_value = document.cookie;
            var c_start = c_value.indexOf(" " + name + "=");
            if (c_start == -1)
            {
                c_start = c_value.indexOf(name + "=");
            }
            if (c_start == -1)
            {
                c_value = null;
            }
            else
            {
                c_start = c_value.indexOf("=", c_start) + 1;
                var c_end = c_value.indexOf(";", c_start);
                if (c_end == -1)
                {
                    c_end = c_value.length;
                }
                c_value = decodeURI(c_value.substring(c_start,c_end));
            }
            return c_value!=null?JSON.parse(c_value):c_value;
        }
    }
}

