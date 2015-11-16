namespace ghost.utils
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
}