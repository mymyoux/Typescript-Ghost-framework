///<lib="es6-promise"/>
///<module="events"/>
///<file="Component"/>
namespace ghost.mvc
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
        private static _templates:any = {};
        public static getTemplate(url:string):Template
        {
            if(!Template._templates)
            {
                return null;
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

        private loading: any;
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
        /**
         * Parsed template
         */
        public parsed:any;
        public constructor()
        {
            super();
            this.loading = {};
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


        protected cache():ghost.browser.data.LocalForage
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

            template.components = rawTemplate.components;
            template.url = rawTemplate.url;
            template.version = rawTemplate.version;
            template.md5 = rawTemplate.md5;
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
                if (!forceReload && (template=Template.getTemplate(name)) != null)
                {
                    debugger;
                    resolve(template);
                    return;
                }
                if (this.loading[name])
                {
                    debugger; 
                    this.once(Template.EVENT_LOADED+":"+name, (template:Template)=>
                    {
                        resolve(template);
                    });
                    return;
                }
                this.loading[name] = true;
                var _self: any = this;
                if (name == "autocomplete") {
                    debugger;
                }
                this.cache().getItem(name).then((template:IRawTemplate)=>
                {
                    if (name == "autocomplete") {
                        debugger;
                    }
                    if(!template || forceReload)
                    {
                        ghost.io.ajax({url:this.getURLFromTemplatename(name), retry:ghost.io.RETRY_INFINITE})
                            .then(
                                (result:any)=>
                                {
                                    if(name== "autocomplete")
                                    {
                                        debugger;
                                    }
                                    if(result.components)
                                    {
                                        result.template.components = {
                                            Autocomplete: function() {
                                                debugger;
                                            }
                                        };
                                       /*
                                       //components
                                        result.template.components = result.components.map(function(data: any) {
                                                var configComponent: any = Component.getConfig(data.name);
                                                if (configComponent)
                                                {
                                                    return {
                                                         name: data.name,
                                                         component: Ractive.extend(configComponent)
                                                    };
                                                    
                                                }
                                            return {
                                                name:data.name,

                                                component: Ractive.extend({
                                                    data: function() {

                                                        if(data.data)
                                                        {
                                                            try
                                                            {
                                                                data = JSON.parse(data.data);
                                                            }catch(error)
                                                            {
                                                                debugger;
                                                            }
                                                            return data;
                                                        }
                                                        return null;
                                                    },
                                                    template: function() {
                                                        var url: string = "rcomponents/" + data.name.toLowerCase();
                                                        var template: any = Template.getTemplate(url);
                                                        if(template)
                                                        {
                                                            if (!template.isParsed()) {
                                                                template.parse();
                                                            }
                                                            return template.parsed;
                                                        }
                                                        Template.load(url).then(() => {
                                                            template = Template.getTemplate(url);
                                                            if (!template) {
                                                                return;
                                                            }
                                                            if (!template.isParsed()) {
                                                                template.parse();
                                                            }
                                                            debugger; 
                                                            this.resetTemplate(template.parsed);
                                                        });
                                                        return "";
                                                    }
                                                }) 
                                            };
                                        });    */

                                    }
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
                        if (name == "autocomplete") {
                            debugger;
                        }
                        this.loading[name] = false;
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
        components: any[];    }
}
