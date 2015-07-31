module ghost.browser.data
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
                trackEvent:function(){},
                trackSiteSearch:function(){},
                setCustomVariable:function(){},
                setUserId:function(){}
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
                this._piwik = window["Piwik"]?window["Piwik"].getAsyncTracker():Analytics.fakePiwik();
            }
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
            if(name && index<4)
            {
                if(!scope)
                {
                    scope = "visit";
                }
                this.piwik().setCustomVariable(index+1, name, value, scope);
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
    }

}