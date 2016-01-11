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
