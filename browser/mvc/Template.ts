///<lib="Promise"/>
///<module="events"/>
///<file="Component"/>
namespace ghost.browser.mvc
{
    export class Template extends ghost.events.EventDispatcher
    {
        public static EVENT_EXPIRED:string = "expired";
        public static EVENT_LOADED:string = "loaded";
        protected static _instance:Template;
        public static instance():Template
        {
            if(!Template._instance)
            {
                Template._instance = new Template();
            }
            return Template._instance;
        }
        public static init(data:any = null): void {
            ghost.browser.mvc.Template._instance = new Template();
        }
        protected static _templates:any = {}; 
        public static getTemplate(url:string):Template
        {
            if(!Template._templates)
            {
                return null;
            }
            if (Template._templates[url])
            {
                if (!Template._templates[url].loaded())
                {
                   // delete Template._templates[url];
                }
            }
            return Template._templates[url];
        }

        protected static cache():ghost.browser.data.LocalForage
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
        public static isLoading(url:string): boolean
        {
            return Template.instance().isLoading(url);
        }


        protected _type: string;
        protected loading: any;
        /**
         * Template url
         */
        public url:string;
        /**
         * Content (text)
         */
        public content:string;
        public components: any[];
        /**
         * md5 of the template
         */
        public md5:string;
        /**
         * Version
         */
        public version:number;

        protected expired: boolean;
        /**
         * Parsed template
         */
        public parsed:any;
        public constructor()
        {
            super();
            this.loading = {};
            this.expired = false;
        }

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
            if(!this.content)
            {
                debugger;
            }
            this.parsed = Ractive["parse"](this.content, options); 
            if(window.location.host.indexOf(".local")==-1)
            {
                Template.cache().setItem(this.url, {
                    url:this.url,
                    md5:this.md5,
                    content:this.content,
                    version:this.version 
                 //   parsed:this.parsed
                });
            }

        }


        protected getTypeFromURL(): string {
            if (!this._type) {
                var parts: string[] = window.location.pathname.split("/");
                this._type = "anonymous";
                if (parts.length > 1) {
                    this._type = parts[1];
                }
            }
            return this._type;
        }
        /*
         * Called by static methods for overriding
         */


        protected cache(): ghost.browser.data.LocalForage 
        {
            return ghost.browser.data.LocalForage.instance().war("templates").war(this.getTypeFromURL());
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
            if (!template.content && !rawTemplate.parsed)
            {
                debugger;
            }
            if(rawTemplate.parsed)
            {
                template.parsed = rawTemplate.parsed;
            }else
            {
                template.parsed = null;
            }

            template.components = rawTemplate.components;
            template.url = rawTemplate.url;
            template.version = rawTemplate.version;
            template.md5 = rawTemplate.md5;
            template.expired = false;
            Template._templates[template.url] = template;

            this.trigger(Template.EVENT_LOADED + ":" + template.url, template);
            return template;
        }
        protected urls():Promise<string[]>
        {
            return this.cache().keys();
        }


        protected getRootURL():string
        {
            return ghost.browser.mvc.Application.getRootURL();
        }

        protected sync():void{
            var templates:any[] = [];
            this.iterate(function(template:ghost.browser.mvc.Template):void{
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
                ghost.browser.io.ajax(
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
                               Template._templates[expired].expire();
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
                    if(rawTemplate.content || rawTemplate.parsed)
                    {
                        var result:any = iterator(this.setTemplate(rawTemplate));
                        return result;
                    }
                    return undefined;
                }).then(resolve, reject);
            });
            return promise;
        }
        protected isLoading(name: string):boolean
        {
            return this.loading[name];
        }
        protected load(name:string, forceReload:boolean = false):Promise<any>
        {
            console.log("template:"+name);

            var promise:Promise<void> = new Promise<void>((resolve:any, reject):void=>
            {
                var template: Template;
                if (!forceReload && ((template=Template.getTemplate(name)) != null))
                {
                    if (!template.loaded()) {
                        template = null;
                    }
                    if(template)
                    {
                        resolve(template);
                        return;
                    }
                }
                if (this.loading[name])
                {
                    this.once(Template.EVENT_LOADED+":"+name, (template:Template)=>
                    {
                        resolve(template);
                    });
                    return;
                }
                this.loading[name] = true;
                var _self: any = this;
                this.cache().getItem(name).then((template:IRawTemplate)=>
                {
                    if(template)
                    {
                        if(!template.content && !template.parsed)
                        {
                            template = null;
                        }
                    }
                    if(!template || forceReload)
                    {
                        ghost.browser.io.ajax({url:this.getURLFromTemplatename(name), retry:ghost.browser.io.RETRY_INFINITE})
                            .then(
                                (result:any)=>
                                {
                                    this.loading[name] = false;
                                    if(result.template)
                                    {
                                        result.template.url = name;
                                        resolve(this.setTemplate(result.template));

                                    }else
                                    {
                                        reject("no template");
                                    }
                                },
                                function()
                                {
                                    _self.loading[name] = false;
                                    reject.apply(null, Array.prototype.slice.call(arguments));
                                }
                            );
                    }else
                    {
                        this.loading[name] = false;
                        resolve(this.setTemplate(template));
                    }
                });
            });
            return promise;
        }
        protected getURLFromTemplatename(name:string):string
        {
            return this.getRootURL() + "integration/" + name;//this.getRootURL()+"integration/"+name;
        }
        protected expire():void
        {
            this.expired = true;
            /*this.md5 = null;
            this.content = null;
            this.parsed = null;*/
            Template.cache().removeItem(this.url);
            this.trigger(Template.EVENT_EXPIRED);
        }
        public isExpired():boolean{
            return this.expired;
        }
        public loaded():boolean
        {
            if ((!this.parsed && !this.content) || this.expired)
            {
                return false;
            }
            return true;
        }
        public retrieve():Promise<any>
        {
            return Template.instance().load(this.url);
        }
        public prepareForUse(options:any = null):Promise<any>
        {
            var promise: Promise<any> = new Promise<any>((resolve:any, reject:any):void => {
                if(this.loaded())
                {
                    if(!this.isParsed())
                    {
                        this.parse(options);
                    }
                    resolve();
                }
                this.retrieve().then(():void=>
                {
                    if (!this.isParsed()) {
                        this.parse(options);
                    }
                    resolve();
                }, reject);
            });
            return promise;
        }
    }
    export interface IRawTemplate
    {
        md5:string;
        content:string;
        url:string;
        parsed:string;
        version:number;
        components: any[];    
        loaded:()=> boolean;
    }
}
