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
        private static cache():ghost.data.LocalForage
        {
            return ghost.forage.war("templates");
        }
        public static setTemplate(rawTemplate:IRawTemplate):Template
        {
            if(!rawTemplate.url)
            {
                console.warn("a raw template loaded without url", rawTemplate);
                return;
            }
            var template:Template = Template._templates[rawTemplate.url]?Template._templates[rawTemplate.url]:new Template();
            template.content = rawTemplate.content;
            if(rawTemplate.parsed)
            {
                template.parsed = rawTemplate.parsed;
            }

            template.url = rawTemplate.url;
            template.md5 = rawTemplate.md5;
            Template._templates[template.url] = template;
            return template;
        }
        public static urls():Promise<string[]>
        {
            return Template.cache().keys();
        }
        private static getRootURL():string
        {
            var pathname:string = window.location.pathname;
            var index:number = pathname.indexOf("/",1);
            if(index > -1)
            {
                pathname = pathname.substring(0, index);
            }
            return window.location.protocol+"//"+window.location.host+(pathname.length>1?pathname+"/":pathname);
        }
        public static sync():void{
            var templates:any[] = [];
            ghost.mvc.Template.iterate(function(template:ghost.mvc.Template):void{
                templates.push({url:template.url,md5:template.md5});
            }).then(function()
            {
                ghost.io.ajax(
                    {
                        ///ad prefix
                        url:Template.getRootURL()+"integration-sync",
                        data:{
                            templates:templates
                        },
                        method:"POST"
                    }).then(function(data:any):void
                {
                 debugger;
                }, function(error:any):void
                {
                    debugger;
                });
            });
        }
        public static iterate(iterator:(template:Template)=>any):Promise<Template>
        {
            var promise:Promise<Template> = new Promise<Template>((resolve:any, reject):void=>
            {
                Template.cache().iterate(function(rawTemplate:IRawTemplate, url:string, index:number):any
                {
                    var result:any = iterator(Template.setTemplate(rawTemplate));
                    return result;
                }).then(resolve, reject);
            });
            return promise;
        }
        public static load(url:string, forceReload:boolean = false):Promise<any>
        {
            var promise:Promise<void> = new Promise<void>((resolve:any, reject):void=>
            {
                Template.cache().getItem(url).then(function(template:IRawTemplate)
                {
                    if(!template || forceReload)
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
                    }else
                    {
                        resolve(Template.setTemplate(template));
                    }
                });

                /*ghost.io.ajax({url:url, retry:ghost.io.RETRY_INFINITE})
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
                );*/
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
            Template.cache().setItem(this.url, {
                url:this.url,
                md5:this.md5,
                parsed:this.parsed
            })

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
        parsed:string;
    }
}