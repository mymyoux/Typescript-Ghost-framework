module ghost.mvc
{
    export class Template
    {
        private static _templates:any;
        public static getTemplate(url:string):Template
        {
            if(!Template._templates)
            {
                return null;
            }
            return Template._templates[url];
        }



        public url:string;
        public content:string;
        public md5:string;

    }
}