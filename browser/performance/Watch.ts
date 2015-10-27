///<lib="es6-promise"/>
namespace ghost.performance
{
    export class Watch
    {
        public static promise(promise:Promise<any>):void
        {

            var time:number = this.now();

            var _this:any = this;
            promise.then(function()
            {
                var args:any = arguments;
                if(arguments.length == 1)
                {
                    args = arguments[0];
                }
                console.log("monitor done:"+ (_this.now()-time), args, promise);
            }, function()
            {
                console.error("monitor error done:"+ (_this.now()-time), arguments, promise);
            });

        }
        private static now():number{
            return ROOT["performance"] && ROOT["performance"].now?ROOT["performance"].now():Date.now();
        }

    }
}