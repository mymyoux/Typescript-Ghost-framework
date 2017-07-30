

    export class Colours
    {   
        public static hexadecimalToRGB(value:string):any
        {
            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(value);
            return result ? {
                red: parseInt(result[1], 16),
                green: parseInt(result[2], 16),
                blue: parseInt(result[3], 16)
            } : null;
        }
        public static RGBToHexadecimal(red:number, green:number, blue:number):string
        {
            return "#" + Colours._componentToHexadecimal(red) + Colours._componentToHexadecimal(green) + Colours._componentToHexadecimal(blue);
        }
        public static ligthness(red:number, green:number, blue:number):number
        public static ligthness(value:string):number
        public static ligthness(red:string|number, green?:number, blue?:number):number
        {
            if(typeof red == "string")
            {
                var result:any = Colours.hexadecimalToRGB(red);
                red = result.red;
                green = result.green;
                blue = result.blue;
            }
            return Colours.RGBToHSL(<number>red, green,blue).ligthness;
            //return 0.2126*(<number>red)+0.7152*green+0.0722*blue;
        }
        public static RGBToHSL(red:number, green:number, blue:number):any{
            red /= 255, green /= 255, blue /= 255;
            var max = Math.max(red, green, blue), min = Math.min(red, green, blue);
            var h, s, l = (max + min) / 2;

            if(max == min){
                h = s = 0; // achromatic
            }else{
                var d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                switch(max){
                    case red: h = (green - blue) / d + (green < blue ? 6 : 0); break;
                    case green: h = (blue - red) / d + 2; break;
                    case blue: h = (red - green) / d + 4; break;
                }
                h /= 6;
            }

            return {hue:Math.floor(h * 360), saturation:Math.floor(s * 100), ligthness:Math.floor(l * 100)};
        }
        private static _componentToHexadecimal(component:number):string 
        {
            var hex = component.toString(16);
            return hex.length == 1 ? "0" + hex : hex;
        }
    }
    export class Gradient
    {
        private count:number = 100;
        private colours:string[] = ['ff0000', 'ffff00', '00ff00', '0000ff']; 
        private gradients:ColourGradient[];
        public constructor()
        {
            this.setColours(this.colours);
        }
        public setColours(...colours:any[]):void
        {
            if(colours.length == 1)
            {
                colours = colours[0];
            }
            if (colours.length < 2) {
                throw new Error('You have to have two or more colours.');
            } else {
                var len:number = colours.length-1;
                var inteval:number = this.count/len;
                this.gradients = [];
                for (var i:number = 0; i < len; i++) {
                    var colourGradient = new ColourGradient();
                    colourGradient.setGradient(colours[i], colours[i + 1]);
                    colourGradient.setRange(inteval * i, inteval * (i + 1)); 
                    this.gradients.push(colourGradient); 
                }

                this.colours = colours;
            }
        }
        public getColour(index:number, modulo:boolean = true):string
        {
        	if(modulo)
        	{
        		index = index%this.count;
        	}
            var len:number = this.gradients.length;
            var segment:number = this.count/len;
            var indexGradient:number = Math.min(Math.floor(Math.max(index, 0)/segment), len - 1);
           // console.log(index+" : "+this.count+"|"+len+"     "+segment+" ====> "+indexGradient);
           // console.log(indexGradient);
            return this.gradients[indexGradient].getColour(index);
        }
        public getMax():number
        {
        	return this.count;
        }
        public setMax(count:number):void
        {
            this.count = count;
            this.setColours(this.colours);
        }
    }
    class ColourGradient
    {
        private colour1:string;
        private colour2:string;
        private min:number = 0;
        private max:number = 100;
        public setGradient(colour1:string, colour2:string):void
        {
            if(colour1.substring(0, 1) == "#")
            {
                colour1 = colour1.substring(1);
            }
            if(colour2.substring(0, 1) == "#")
            {
                colour2 = colour2.substring(1);
            }
            this.colour1 = colour1;
            this.colour2 = colour2;
        }
        public setRange(min:number, max:number):void
        {
            this.min = min;
            this.max = max;
        }
        public getColour(index:number):string
        {
            //console.log(this.min+" : "+index+" : "+this.max);
            return "#"+this.hex(index, this.colour1.substring(0, 2), this.colour2.substring(0, 2))
            + this.hex(index, this.colour1.substring(2, 4), this.colour2.substring(2, 4))
            + this.hex(index, this.colour1.substring(4, 6), this.colour2.substring(4, 6));
        }
        private hex(index, start16, end16):string
        {
            if(index<this.min)
            {
                index = this.min;
            }
            if(index>this.max)
            {
                index =this.max;
            }
            var range:number = this.max - this.min;
            var start10:number = parseInt(start16, 16);
            var end10:number = parseInt(end16, 16);
            var index2:number = (end10 - start10)/range;
            var base10:number = Math.round(index2 * (index - this.min) + start10);
            var base16:string = base10.toString(16);
            if(base16.length == 1)
            {
                base16 = "0" + base16;
            }
            return base16;
        }
    }
