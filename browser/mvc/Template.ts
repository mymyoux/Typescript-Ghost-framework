///<lib="es6-promise"/>
///<module="events"/>
namespace ghost.mvc
{
    export class Template extends ghost.events.EventDispatcher
    {
        public static EVENT_EXPIRED:string = "expired";
        protected static _instance:Template;
        public static instance():Template
        {
            if(!Template._instance)
            {
                Template._instance = new Template();
            }
            return Template._instance;
        }
        private static _templates:any = {};
        public static getTemplate(url:string):Template
        {
            if(!Template._templates)
            {
                return null;
            }
            return Template._templates[url];
        }

        protected static cache():ghost.data.LocalForage
        {
            return Template.instance().cache();
        }

        public static setTemplate(rawTemplate:IRawTemplate):Template
        {
          return  Template.instance().setTemplate(rawTemplate);
        }
        public static urls():Promise<string[]>
        {
            return Template.instance().urls();
        }
        private static getRootURL():string
        {
            return Template.instance().getRootURL();
        }
        public static sync():void{
            return Template.instance().sync();
        }
        public static iterate(iterator:(template:Template)=>any):Promise<Template>
        {
            return Template.instance().iterate(iterator);
        }
        public static load(url:string, forceReload:boolean = false):Promise<any>
        {
            return Template.instance().load(url, forceReload);
        }


        /**
         * Template url
         */
        public url:string;
        /**
         * Content (text)
         */
        public content:string;
        /**
         * md5 of the template
         */
        public md5:string;
        /**
         * Version
         */
        public version:number;
        /**
         * Parsed template
         */
        public parsed:any;

        /**
         * Specify if the template is already parsed
         * @returns {boolean}
         */
        public isParsed():boolean
        {
            return this.parsed != null;
        }

        /**
         * Parses the template
         * @param options Ractive's options
         */
        public parse(options:any):void
        {
            this.parsed = Ractive["parse"](this.content, options);
            if(window.location.host.indexOf(".local")==-1)
            {
                Template.cache().setItem(this.url, {
                    url:this.url,
                    md5:this.md5,
                    version:this.version,
                    parsed:this.parsed
                });
            }

        }

        /*
         * Called by static methods for overriding
         */


        protected cache():ghost.data.LocalForage
        {
            return ghost.forage.war("templates");
        }
        protected getNewInstance():Template
        {
            var cls:any = this.constructor;
            return <Template>new cls();
        }
        protected setTemplate(rawTemplate:IRawTemplate):Template
        {
            if(!rawTemplate.url)
            {
                console.warn("a raw template loaded without url", rawTemplate);
                return;
            }
            var template:Template = Template._templates[rawTemplate.url]?Template._templates[rawTemplate.url]:this.getNewInstance();
            template.content = rawTemplate.content;
            if(rawTemplate.parsed)
            {
                template.parsed = rawTemplate.parsed;
            }

            template.url = rawTemplate.url;
            template.version = rawTemplate.version;
            template.md5 = rawTemplate.md5;
            Template._templates[template.url] = template;
            return template;
        }
        protected urls():Promise<string[]>
        {
            return this.cache().keys();
        }


        protected getRootURL():string
        {
            return ghost.mvc.Application.getRootURL();
        }

        protected sync():void{
            var templates:any[] = [];
            this.iterate(function(template:ghost.mvc.Template):void{
                var requestTemplate:any ={url:template.url};
                if(template.version)
                {
                    requestTemplate.version = template.version
                }else {
                    requestTemplate.md5 = template.md5;
                }
                templates.push(requestTemplate);
            }).then(()=>
            {
                if(!templates.length)
                {
                    return;
                }
                ghost.io.ajax(
                    {
                        ///ad prefix
                        url:this.getRootURL()+"integration-sync",
                        data:{
                            templates:templates
                        },
                        method:"POST"
                    }).then((data:any):void=>
                {
                   if(data && data.expired)
                   {
                       var expired;
                       for(var p in data.expired)
                       {
                           expired = data.expired[p];
                           if(Template._templates[expired])
                           {
                               Template._templates[expired].expired();
                           }else
                           {
                               this.cache().removeItem(expired);
                           }
                       }
                   }
                }, function(error:any):void
                {
                    debugger;
                });
            });
        }
        protected iterate(iterator:(template:Template)=>any):Promise<Template>
        {
            var promise:Promise<Template> = new Promise<Template>((resolve:any, reject):void=>
            {
                this.cache().iterate((rawTemplate:IRawTemplate, url:string, index:number):any=>
                {
                    var result:any = iterator(this.setTemplate(rawTemplate));
                    return result;
                }).then(resolve, reject);
            });
            return promise;
        }
        protected load(name:string, forceReload:boolean = false):Promise<any>
        {
            var promise:Promise<void> = new Promise<void>((resolve:any, reject):void=>
            {
                this.cache().getItem(name).then((template:IRawTemplate)=>
                {
                    if(!template || forceReload)
                    {
                        ghost.io.ajax({url:this.getURLFromTemplatename(name), retry:ghost.io.RETRY_INFINITE})
                            .then(
                                (result:any)=>
                                {
                                    if(result.template)
                                    {
                                        result.template.url = name;
                                        resolve(this.setTemplate(result.template));

                                    }else
                                    {
                                        reject("no template");
                                    }
                                },
                                reject
                            );
                    }else
                    {
                        resolve(this.setTemplate(template));
                    }
                });
            });
            return promise;
        }
        protected getURLFromTemplatename(name:string):string
        {
            return "integration/"+name;//this.getRootURL()+"integration/"+name;
        }
        protected expired():void
        {
            this.md5 = null;
            this.content = null;
            this.parsed = null;
            Template.cache().removeItem(this.url);
            this.trigger(Template.EVENT_EXPIRED);
        }
        public loaded():boolean
        {
            if(!this.parsed && !this.content)
            {
                return false;
            }
            return true;
        }
        public retrieve():Promise<any>
        {
            return Template.instance().load(this.url);
        }
    }
    export interface IRawTemplate
    {
        md5:string;
        content:string;
        url:string;
        parsed:string;
        version:number;
    }
}
