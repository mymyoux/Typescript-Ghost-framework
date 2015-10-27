namespace ghost.browser.data
{
    export class Analytics
    {
        protected static _instance:Analytics;
        public static instance():Analytics
        {
            if(!Analytics._instance)
            {
                new Analytics();
            }
            return Analytics._instance;
        }
        private static fakePiwik():IPiwik
        {
            return {
                requests:[],
                trackEvent:function(){

                    console.log("[FAKEPIWIK] track event", arguments);
                    this.track("trackEvent", arguments);
                }

                ,
                trackSiteSearch:function(){
                    console.log("[FAKEPIWIK] track site search", arguments);
                    this.track("trackSiteSearch", arguments);
                },
                setCustomVariable:function(){
                    console.log("[FAKEPIWIK] set custom variable", arguments);
                    this.track("setCustomVariable", arguments);

                },
                setUserId:function(){
                    console.log("[FAKEPIWIK] set user id", arguments);
                    this.track("setUserId", arguments);
                },
                trackPageView:function()
                {
                    console.log("[FAKEPIWIK] track page view");

                },
                track: function(name:any, args:any):void
                {
                    this.requests.push({name:name, args:args});
                    this.checkPiwik();
                },
                checkPiwik:function()
                {
                    console.log("[FAKEPIWIK] Check real piwik");
                    if( window["Piwik"])
                    {
                        console.log("[FAKEPIWIK] Piwik detected");
                        var tracker:any = window["Piwik"].getTracker();
                        while(this.requests.length)
                        {
                            var request:any = this.requests.shift();
                            console.log("[FAKEPIWIK] Piwik reload: ", request.name, request.args);
                            tracker[request.name].apply(tracker, Array.prototype.slice.call(request.args));
                        }
                        tracker.trackPageView();

                        Analytics.instance()._piwik = tracker;
                    }

                }

            };
        }
        private static fakeGA():any
        {
            return function(){};
        }

        protected _piwik:IPiwik;

        public constructor()
        {
            Analytics._instance = this;
        }

        protected ga():any
        {
            return window["ga"]?window["ga"]:Analytics.fakeGA();
        }
        protected piwik():IPiwik
        {
            if(!this._piwik)
            {
                this._piwik = window["Piwik"]?window["Piwik"].getTracker()/*getAsyncTracker()*/:Analytics.fakePiwik();
                if(!window["Piwik"])
                {
                    setTimeout(()=>
                    {
                        if(this._piwik["checkPiwik"])
                        {
                            this._piwik["checkPiwik"]();
                        }
                    }, 5000);
                }
            }
            window["p"] = this._piwik;
            return this._piwik;
        }
        public trackEvent(category:string, action:string, label?:string, value?:number):void
        {
            this.piwik().trackEvent.apply(this.piwik(), Array.prototype.slice.call(arguments));
            this.ga().apply(null, ["send", "event"].concat(Array.prototype.slice.call(arguments)));
        }
        public trackSearch(keyword:string, category?:string, resultsCount?:number):void
        {
            this.piwik().trackSiteSearch.apply(this.piwik(), Array.prototype.slice.call(arguments));
            this.ga()("send","event", "search", category, keyword, resultsCount);
        }
        public setUserID(id:string):void
        {
            this.piwik().setUserId(id);
        }
        public setVariable(index, value, name?:string, scope?:string):void
        {
            if(name && index<=9)
            {
                if(!scope)
                {
                    scope = "visit";
                }
                console.log("[PIWIK] set Custom Variable", index+1, name, value, scope);
                this.piwik().setCustomVariable(index+1, name, value, scope);
                this.piwik().trackPageView();
            }
            if(index<20)
            {
                var data = {};
                var key:string = (typeof value == "number"?"metric":"dimension")+index;
                data[key] = value;
                this.ga()("set", data);
            }
            }

    }
    export interface IPiwik
    {
        trackEvent(category:string, action:string, name?:string, value?:number);
        trackSiteSearch(keyword:string, category?:string, resultsCount?:number);
        setCustomVariable(index:number, name:string, value:string, scope:string);
        setUserId(id:string);
        track(name:any, args:any):void;
        trackPageView():void;
        checkPiwik():void;
        requests:any;
    }

}