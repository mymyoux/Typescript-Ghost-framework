//convert
 /*[ghost.utils.Maths.*/
import {Maths} from "ghost/utils/Maths";


    /**
     * Cryptography
     */
    export class Cryptography
    {
        private static keyStr:string = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        protected static _F(x:number, y:number, z:number):number {
            return (x & y) | ((~x) & z);
        }
        protected static _G(x: number, y: number, z: number): number {
            return (x & z) | (y & (~z));
        }
        protected static _H(x: number, y: number, z: number): number {
            return (x ^ y ^ z);
        }
        protected static _I(x: number, y: number, z: number): number {
            return (y ^ (x | (~z)));
        }
        protected static _FF(a: number, b: number, c: number, d: number, x: number, s: number, ac: number): number {
            a = Cryptography.addUnsigned(a, Cryptography.addUnsigned(Cryptography.addUnsigned(Cryptography._F(b, c, d), x), ac));
            return Cryptography.addUnsigned(Cryptography.rotateLeft(a, s), b);
        }
        protected static _GG(a:number, b:number, c:number, d:number, x:number, s:number, ac:number):number {
            a = Cryptography.addUnsigned(a, Cryptography.addUnsigned(Cryptography.addUnsigned(Cryptography._G(b, c, d), x), ac));
            return Cryptography.addUnsigned(Cryptography.rotateLeft(a, s), b);
        }
        protected static _HH(a:number, b:number, c:number, d:number, x:number, s:number, ac:number):number {
            a = Cryptography.addUnsigned(a, Cryptography.addUnsigned(Cryptography.addUnsigned(Cryptography._H(b, c, d), x), ac));
            return Cryptography.addUnsigned(Cryptography.rotateLeft(a, s), b);
        }
        protected static _II(a:number, b:number, c:number, d:number, x:number, s:number, ac:number):number {
            a = Cryptography.addUnsigned(a, Cryptography.addUnsigned(Cryptography.addUnsigned(Cryptography._I(b, c, d), x), ac));
            return Cryptography.addUnsigned(Cryptography.rotateLeft(a, s), b);
        }
        protected static addUnsigned(lX: number, lY: number): number {
            var lX4: number, lY4: number, lX8: number, lY8: number, lResult: number;
            lX8 = (lX & 0x80000000);
            lY8 = (lY & 0x80000000);
            lX4 = (lX & 0x40000000);
            lY4 = (lY & 0x40000000);
            lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
            if (lX4 & lY4) {
                return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
            }
            if (lX4 | lY4) {
                if (lResult & 0x40000000) {
                    return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
                } else {
                    return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
                }
            } else {
                return (lResult ^ lX8 ^ lY8);
            }
        }
        protected static rotateLeft(lValue: number, iShiftBits): number {
            return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
        }
        protected static convertToWordArray(str: string):number[] {
            var lWordCount:number;
            var lMessageLength: number = str.length;
            var lNumberOfWords_temp1: number = lMessageLength + 8;
            var lNumberOfWords_temp2: number = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
            var lNumberOfWords: number = (lNumberOfWords_temp2 + 1) * 16;
            var lWordArray:number[] = new Array(lNumberOfWords - 1);
            var lBytePosition: number = 0;
            var lByteCount: number = 0;
            while (lByteCount < lMessageLength) {
                lWordCount = (lByteCount - (lByteCount % 4)) / 4;
                lBytePosition = (lByteCount % 4) * 8;
                lWordArray[lWordCount] = (lWordArray[lWordCount] | (str.charCodeAt(lByteCount) << lBytePosition));
                lByteCount++;
            }
            lWordCount = (lByteCount - (lByteCount % 4)) / 4;
            lBytePosition = (lByteCount % 4) * 8;
            lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
            lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
            lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
            return lWordArray;
        }
 
        protected static wordToHex(lValue): string {
            var wordToHexValue:string = "",
                wordToHexValue_temp: string = "",
                lByte:number, lCount:number;
            for (lCount = 0; lCount <= 3; lCount++) {
                lByte = (lValue >>> (lCount * 8)) & 255;
                wordToHexValue_temp = "0" + lByte.toString(16);
                wordToHexValue = wordToHexValue + wordToHexValue_temp.substr(wordToHexValue_temp.length - 2, 2);
            }
            return wordToHexValue;
        }

        public static MD5(str:any):string
        {
           str = str+"";
            var xl:number;
            var x:number[] = [],
                k: number, AA: number, BB: number, CC: number, DD: number, a: number, b: number, c: number, d: number, S11: number = 7,
                S12: number = 12,
                S13: number = 17,
                S14: number = 22,
                S21: number = 5,
                S22: number = 9,
                S23: number = 14,
                S24: number = 20,
                S31: number = 4,
                S32: number = 11,
                S33: number = 16,
                S34: number = 23,
                S41: number = 6,
                S42: number = 10,
                S43: number = 15,
                S44: number = 21;
 
            str = Cryptography.UTF8Encode(str);
            x = Cryptography.convertToWordArray(str);
            a = 0x67452301;
            b = 0xEFCDAB89;
            c = 0x98BADCFE;
            d = 0x10325476;

            xl = x.length;

            for (k = 0; k < xl; k += 16) {
                
                AA = a;
                BB = b;
                CC = c;
                DD = d; 
                a = Cryptography._FF(a, b, c, d, x[k + 0], S11, 0xD76AA478);
                d = Cryptography._FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
                c = Cryptography._FF(c, d, a, b, x[k + 2], S13, 0x242070DB);
                b = Cryptography._FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
                a = Cryptography._FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
                d = Cryptography._FF(d, a, b, c, x[k + 5], S12, 0x4787C62A);
                c = Cryptography._FF(c, d, a, b, x[k + 6], S13, 0xA8304613);
                b = Cryptography._FF(b, c, d, a, x[k + 7], S14, 0xFD469501);
                a = Cryptography._FF(a, b, c, d, x[k + 8], S11, 0x698098D8);
                d = Cryptography._FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
                c = Cryptography._FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
                b = Cryptography._FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
                a = Cryptography._FF(a, b, c, d, x[k + 12], S11, 0x6B901122);
                d = Cryptography._FF(d, a, b, c, x[k + 13], S12, 0xFD987193);
                c = Cryptography._FF(c, d, a, b, x[k + 14], S13, 0xA679438E);
                b = Cryptography._FF(b, c, d, a, x[k + 15], S14, 0x49B40821);
                a = Cryptography._GG(a, b, c, d, x[k + 1], S21, 0xF61E2562);
                d = Cryptography._GG(d, a, b, c, x[k + 6], S22, 0xC040B340);
                c = Cryptography._GG(c, d, a, b, x[k + 11], S23, 0x265E5A51);
                b = Cryptography._GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
                a = Cryptography._GG(a, b, c, d, x[k + 5], S21, 0xD62F105D);
                d = Cryptography._GG(d, a, b, c, x[k + 10], S22, 0x2441453);
                c = Cryptography._GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
                b = Cryptography._GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
                a = Cryptography._GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
                d = Cryptography._GG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
                c = Cryptography._GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
                b = Cryptography._GG(b, c, d, a, x[k + 8], S24, 0x455A14ED);
                a = Cryptography._GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
                d = Cryptography._GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
                c = Cryptography._GG(c, d, a, b, x[k + 7], S23, 0x676F02D9);
                b = Cryptography._GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
                a = Cryptography._HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
                d = Cryptography._HH(d, a, b, c, x[k + 8], S32, 0x8771F681);
                c = Cryptography._HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
                b = Cryptography._HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
                a = Cryptography._HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
                d = Cryptography._HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
                c = Cryptography._HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
                b = Cryptography._HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
                a = Cryptography._HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
                d = Cryptography._HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA);
                c = Cryptography._HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
                b = Cryptography._HH(b, c, d, a, x[k + 6], S34, 0x4881D05);
                a = Cryptography._HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
                d = Cryptography._HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
                c = Cryptography._HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
                b = Cryptography._HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665);
                a = Cryptography._II(a, b, c, d, x[k + 0], S41, 0xF4292244);
                d = Cryptography._II(d, a, b, c, x[k + 7], S42, 0x432AFF97);
                c = Cryptography._II(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
                b = Cryptography._II(b, c, d, a, x[k + 5], S44, 0xFC93A039);
                a = Cryptography._II(a, b, c, d, x[k + 12], S41, 0x655B59C3);
                d = Cryptography._II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
                c = Cryptography._II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
                b = Cryptography._II(b, c, d, a, x[k + 1], S44, 0x85845DD1);
                a = Cryptography._II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
                d = Cryptography._II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
                c = Cryptography._II(c, d, a, b, x[k + 6], S43, 0xA3014314);
                b = Cryptography._II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
                a = Cryptography._II(a, b, c, d, x[k + 4], S41, 0xF7537E82);
                d = Cryptography._II(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
                c = Cryptography._II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
                b = Cryptography._II(b, c, d, a, x[k + 9], S44, 0xEB86D391);
                a = Cryptography.addUnsigned(a, AA);
                b = Cryptography.addUnsigned(b, BB);
                c = Cryptography.addUnsigned(c, CC);
                d = Cryptography.addUnsigned(d, DD);
            }

            var temp:string = Cryptography.wordToHex(a) + Cryptography.wordToHex(b) + Cryptography.wordToHex(c) + Cryptography.wordToHex(d);
    
            return temp.toLowerCase();
        }
        private static UTF8Encode(string:string):string
        {
            string = string.replace(/\r\n/g,"\n");
            var utftext:string = "";

            for (var n:number = 0; n < string.length; n++) {

                var c:number = string.charCodeAt(n);

                if (c < 128) {
                    utftext += String.fromCharCode(c);
                }
                else if((c > 127) && (c < 2048)) {
                    utftext += String.fromCharCode((c >> 6) | 192);
                    utftext += String.fromCharCode((c & 63) | 128);
                }
                else {
                    utftext += String.fromCharCode((c >> 12) | 224);
                    utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                    utftext += String.fromCharCode((c & 63) | 128);
                }

            }

            return utftext;
        }
        private static UTF8Decode(utftext:string):string
        {
            var string = "";
            var i:number = 0;
            var c1:number,c2:number, c3:number;
            var c:number = c1 = c2 = 0;

            while ( i < utftext.length ) {

                c = utftext.charCodeAt(i);

                if (c < 128) {
                    string += String.fromCharCode(c);
                    i++;
                }
                else if((c > 191) && (c < 224)) {
                    c2 = utftext.charCodeAt(i+1);
                    string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                    i += 2;
                }
                else {
                    c2 = utftext.charCodeAt(i+1);
                    c3 = utftext.charCodeAt(i+2);
                    string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                    i += 3;
                }

            }

            return string;
        }
        public static base64Encode(input:string):string
        {
            var output:string = "";
            var chr1:number, chr2:number, chr3:number, enc1:number, enc2:number, enc3:number, enc4:number;
            var i:number = 0;

            input = Cryptography.UTF8Encode(input);

            while (i < input.length) {

                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);

                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;

                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }

                output = output +
                    Cryptography.keyStr.charAt(enc1) + Cryptography.keyStr.charAt(enc2) +
                    Cryptography.keyStr.charAt(enc3) + Cryptography.keyStr.charAt(enc4);

            }

            return output;
        }
        public static base64Decode(input:string):string
        {
            var output:string = "";
            var chr1: number, chr2: number, chr3: number;
            var enc1: number, enc2: number, enc3: number, enc4: number;
            var i: number = 0;

            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

            while (i < input.length) {

                enc1 = Cryptography.keyStr.indexOf(input.charAt(i++));
                enc2 = Cryptography.keyStr.indexOf(input.charAt(i++));
                enc3 = Cryptography.keyStr.indexOf(input.charAt(i++));
                enc4 = Cryptography.keyStr.indexOf(input.charAt(i++));

                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;

                output = output + String.fromCharCode(chr1);

                if (enc3 != 64) {
                    output = output + String.fromCharCode(chr2);
                }
                if (enc4 != 64) {
                    output = output + String.fromCharCode(chr3);
                }

            }

            output = Cryptography.UTF8Decode(output);

            return output;
        }

        /**
         * Generates a token
         * @param size Size of the token. default : 128 cars
         * @returns {string} token
         */
        public static token(size:number = 128):string
        {
            var tokens:string[] = "abcdef0123456789".split("");
            var token:string = "";
            for(var i=0; i<size; i++)
            {
                token += tokens[Maths.randBetween(0, 15)];
            }
            return token;
        }


    }
