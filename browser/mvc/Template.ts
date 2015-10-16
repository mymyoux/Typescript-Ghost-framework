///<lib="es6-promise"/>
module ghost.mvc
{
    export class Template
    {
        private static _templates:any = {};
        public static getTemplate(url:string):Template
        {
            if(!Template._templates)
            {
                return null;
            }
            return Template._templates[url];
        }
        public static setTemplate(rawTemplate:IRawTemplate):Template
        {
            var template:Template = new Template();
            template.content = rawTemplate.content;
            template.url = rawTemplate.url;
            template.md5 = rawTemplate.md5;
            Template._templates[template.url] = template;
            return template;
        }
        public static load(url:string):Promise<any>
        {
            var promise:Promise<void> = new Promise<void>((resolve:any, reject):void=>
            {
                ghost.io.ajax({url:url, retry:ghost.io.RETRY_INFINITE})
                    .then(
                    function(result:any)
                    {
                        if(result.template)
                        {
                            result.template.url = url;
                            resolve(Template.setTemplate(result.template));

                        }else
                        {
                            reject("no template");
                        }
                    },
                    reject
                );
            });
            return promise;
        }
        public isParsed():boolean
        {
            return this.parsed != null;
        }
        public parse(options:any):void
        {
            this.parsed = Ractive["parse"](this.content, options);
        }



        public url:string;
        public content:string;
        public md5:string;
        public parsed:any;

    }
    export interface IRawTemplate
    {
        md5:string;
        content:string;
        url:string;
    }
}