//convert
 /*[ghost.utils.Maths.*/
import {Maths} from "ghost/utils/Maths";



    export class Strings
    {
        private static exceptWords:string[] = ["de","des","du","dans","la","le","les","au","aux"];

        public static replaceAll(str:string, search:string, repl:string):string
        {
             while (str.indexOf(search) != -1)
                str = str.replace(search, repl);
            return str;
        }
        public static stripAcents(str:string):string
        {
            var norm:string[] = ['À','Á','Â','Ã','Ä','Å','Æ','Ç','È','É','Ê','Ë',
                'Ì','Í','Î','Ï', 'Ð','Ñ','Ò','Ó','Ô','Õ','Ö','Ø','Ù','Ú','Û','Ü','Ý',
                'Þ','ß', 'à','á','â','ã','ä','å','æ','ç','è','é','ê','ë','ì','í','î',
                'ï','ð','ñ', 'ò','ó','ô','õ','ö','ø','ù','ú','û','ü','ý','ý','þ','ÿ'];
            var spec:string[] = ['A','A','A','A','A','A','A','C','E','E','E','E',
                'I','I','I','I', 'D','N','O','O','O','0','O','O','U','U','U','U','Y',
                'b','s', 'a','a','a','a','a','a','a','c','e','e','e','e','i','i','i',
                'i','d','n', 'o','o','o','o','o','o','u','u','u','u','y','y','b','y'];
            for (var i:number = 0; i < spec.length; i++)
                str = Strings.replaceAll(str, norm[i], spec[i]);
            return str;
        }
        public static startsWith(str:string, needle:string):boolean
        {
            if(!str || !needle)
            {
                return false;
            }
            return str.indexOf(needle) == 0;
        }
         public static endsWith(str:string, needle:string):boolean
        {
            if(!str || !needle)
            {
                return false;
            }
            var index:number = str.lastIndexOf(needle);
            if(!~index)
                return false;
            return index == str.length - needle.length;
        }
        public static camel(text:string, delimiter:string = "-|_")
        {
            if(!text)
            {
                return text;
            }
            var reg: RegExp = new RegExp(delimiter, "g");
            text = Strings.capitalizeAllWords(text.replace(reg, " "));
            text = text.replace(/ /g, "");
            text = text.substring(0, 1).toLowerCase() + text.substring(1);
            return text;
        }
        public static uncamel(text:string, delimiter:string = "_")
        {
            if(!text)
            {
                return text;
            }
            var reg: RegExp = /[A-Z]/g;
            text = text.replace(/[A-Z]/g, " $1");
            text = text.replace(/ /g,delimiter);
            return text.toLowerCase();
        }
        public static firstUpperCase(text:string):string
        {
            if(!text)
            {
                return text;
            }
            return text.charAt(0).toUpperCase()+text.substring(1);
        }
        public static capitalizeAllWords(text:string):string
        {
            if(!text)
            {
                return text;
            }
            text = text.toLowerCase();
            return text.replace(/\b[a-z]/g, function(letter) {
                return letter.toUpperCase();
            });
            /*
            var capitalize = function(car)
            {
                var name = text.split(car);
                for(var i=0;i < name.length;i++)
                {
                    if(i==0 || Strings.exceptWords.indexOf(name[i])==-1)
                        name[i] = name[i].charAt(0).toUpperCase() +name[i].substring(1);
                }
                text = name.join(car);
                return text;
            }
            text = capitalize(" ");
            text = capitalize("'");
            return text;*/
        }
        public static trim(text:string):string
        {
            return text ? text.replace(/^\s+|\s+$/g, '') : "";
        }
        public static similarityExtends(str1:string, str2:string):number
        {
            str1 = String(str1);
            str2 = String(str2);
            if(!str1)
            {
                str1 = "";
            }
            if(!str2)
            {
                str2 = "";
            }

            str1 = str1.toLowerCase();
            str2 = str2.toLowerCase();
            if(str1.length+str2.length==0)
            {
                return 1;
            }
            return (((str1.length+str2.length*2)-Strings.LevenshteinDistance(str1, str2))/(str1.length+str2.length*2));
        }
        public static LevenshteinDistance(source:string, target:string, options:any = null):number
        {
            options = options || {};
            if(isNaN(options.insertion_cost)) options.insertion_cost = 1;
            if(isNaN(options.deletion_cost)) options.deletion_cost = 1;
            if(isNaN(options.substitution_cost)) options.substitution_cost = 1;

            var sourceLength = source.length;
            var targetLength = target.length;
            var distanceMatrix = [[0]];

            for (var row =  1; row <= sourceLength; row++) {
                distanceMatrix[row] = [];
                distanceMatrix[row][0] = distanceMatrix[row-1][0] + options.deletion_cost;
            }

            for (var column = 1; column <= targetLength; column++) {
                distanceMatrix[0][column] = distanceMatrix[0][column-1] + options.insertion_cost;
            }

            for (var row = 1; row <= sourceLength; row++) {
                for (var column = 1; column <= targetLength; column++) {
                    var costToInsert = distanceMatrix[row][column-1] + options.insertion_cost;
                    var costToDelete = distanceMatrix[row-1][column] + options.deletion_cost;

                    var sourceElement = source[row-1];
                    var targetElement = target[column-1];
                    var costToSubstitute = distanceMatrix[row-1][column-1];
                    if (sourceElement !== targetElement) {
                        costToSubstitute = costToSubstitute + options.substitution_cost;
                    }
                    distanceMatrix[row][column] = Math.min(costToInsert, costToDelete, costToSubstitute);
                }
            }
            return distanceMatrix[sourceLength][targetLength];
        }
        public similarity(str1:string, str2:string, dj:number = null):number
        {
             var jaro;
            (typeof(dj) == 'undefined')? jaro = Strings.jaroDistance(str1,str2) : jaro = dj;
            var p:number = 0.1; //
            var l:number = 0 // length of the matching prefix
            while(str1[l] == str2[l] && l < 4)
                l++;

            return jaro + l * p * (1 - jaro);
        }
        public static jaroDistance(s1:string, s2:string):number
        {
            if (typeof(s1) != "string" || typeof(s2) != "string") return 0;
            if (s1.length == 0 || s2.length == 0)
                return 0;
            s1 = s1.toLowerCase(), s2 = s2.toLowerCase();
            var matchWindow = (Math.floor(Math.max(s1.length, s2.length) / 2.0)) - 1;
            var matches1 = new Array(s1.length);
            var matches2 = new Array(s2.length);
            var m = 0; // number of matches
            var t = 0; // number of transpositions

            //debug helpers
            //console.log("s1: " + s1 + "; s2: " + s2);
            //console.log(" - matchWindow: " + matchWindow);

            // find matches
            for (var i = 0; i < s1.length; i++) {
                var matched = false;

                // check for an exact match
                if (s1[i] ==  s2[i]) {
                        matches1[i] = matches2[i] = matched = true;
                        m++
                }

                // check the "match window"
                else {
                        // this for loop is a little brutal
                        for (k = (i <= matchWindow) ? 0 : i - matchWindow;
                                (k <= i + matchWindow) && k < s2.length && !matched;
                                k++) {
                                    if (s1[i] == s2[k]) {
                                        if(!matches1[i] && !matches2[k]) {
                                                    m++;
                                       }

                                matches1[i] = matches2[k] = matched = true;
                            }
                        }
                }
            }

            if(m == 0)
                return 0.0;

            // count transpositions
            var k = 0;

            for(var i = 0; i < s1.length; i++) {
                    if(matches1[k]) {
                        while(!matches2[k] && k < matches2.length)
                        k++;
                        if(s1[i] != s2[k] &&  k < matches2.length)  {
                        t++;
                    }

                        k++;
                    }
            }

            //debug helpers:
            //console.log(" - matches: " + m);
            //console.log(" - transpositions: " + t);
            t /= 2.0;
            return (m / s1.length + m / s2.length + (m - t) / m) / 3;
        }
        private static _tokenCars:string[]="0123456789abcdef".split("");
        private static _tokenCarsLength:number = Strings._tokenCars.length-1;
        
        // public static getUniqueToken(size:number = 64):string
        // {
        //     var token:string = Date.now()+"";
        //     while(token.length<size)
        //     {
        //         token+=Strings._tokenCars[Maths.randBetween(0,Strings._tokenCarsLength)];
        //     }
        //     return token;
        // }
        private static _syllabus:string[] = ["par","to","mon","issu","na","bac","dat","cou","lac","son","tri","rot"];
        public static getUniqueToken(size:number = 64):string
        { 
            var count = Maths.randBetween(1, 3);
            var tokens:string[] = [];
            while(count)
            {
                tokens.push(Strings._syllabus[Maths.randBetween(0, Strings._syllabus.length-1)]);
                count--;
            }
            tokens.push(Maths.randBetween(1, 1000)+"");
            var token:string = tokens.join("-");
            token+= Date.now()+"-";
            while(token.length<size)
            {
                token+=Strings._tokenCars[Maths.randBetween(0,Strings._tokenCarsLength)];
            }
            while(token.length>size)
            {
                token = token.substring(1);
            }
            return token;
        }


        protected static _SOUNDEX:any = {b:1,f:1,p:1,v:1,c:2,g:2,j:2,k:2,q:2,s:2,x:2,z:2,d:3,t:3,l:4,m:5,n:5,r:6 };
        public static soundex(text:string, sizeMax?:number):string
        {
            var code:string = text.substring(0, 1);
            text = text.toLowerCase().replace(/wh/g,'');
            var i:number = 1;
            var last:number;
            for(i; i<text.length && (!sizeMax || code.length<4);i++)
            {
                if(text[i-1] == text[i] || last == this._SOUNDEX[text[i]])
                {
                    continue;
                }
                if(this._SOUNDEX[text[i]])
                {
                    last = this._SOUNDEX[text[i]];
                    code+=this._SOUNDEX[text[i]];
                }
            }
            while(code.length<4)
            {
                code+="0";
            }
            return code;
        }

    }