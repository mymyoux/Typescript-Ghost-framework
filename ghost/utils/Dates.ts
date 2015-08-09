module ghost.utils
{
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
    }
}