namespace ghost.validators
{
    export class Validator
    {
        public static isEmail(value:string):boolean
        {
            var emailRegExp:RegExp = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return emailRegExp.test(value);
        }
        public static isValidPassword(value:string):boolean
        {
        	return value && value.length>6;
        }
    }
}