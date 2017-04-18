///<lib="Promise"/>
///<module="events"/>
///<module="framework/browser/api"/>
///<file="Template"/>
///<file="IRawTemplate"/>
namespace ghost.browser.mvc
{
    import API2 = ghost.browser.api.API2;
    export class Template2 extends Template
    {
        public static instance():Template2
        {
            if(!Template._instance)
            {
                Template._instance = new Template2(API2.instance());
            }
            return <Template2>Template._instance;
        }
         public static init(api:API2): void {
             
            ghost.browser.mvc.Template._instance = new Template2(api);
        }
        public static getTemplate(url:string):Template2
        {
           return <Template2>super.getTemplate(url);
        }
        public static setTemplate(rawTemplate:IRawTemplate):Template2
        {
          return  <Template2>super.setTemplate(rawTemplate);
        }
        protected api:API2;
        public constructor(api:API2)
        {
            super();
            this.api = api;
        }
        protected cache(): ghost.browser.data.LocalForage 
        {
            return ghost.browser.data.LocalForage.instance().war("templates2").war(this.getTypeFromURL());
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
                //TODO:sync to laravel servers
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
                        this.api.request().path('view/get').param("path", name).param("type", this.getTypeFromURL())
                        //ghost.browser.io.ajax({url:this.getURLFromTemplatename(name), retry:ghost.browser.io.RETRY_INFINITE})
                            .then(
                                (result:any)=>
                                {
                                    this.loading[name] = false;
                                    if(result.template)
                                    {
                                         result.template = 
                                        {
                                            content:result.template,
                                            version:result.version};
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
    }
    
}
