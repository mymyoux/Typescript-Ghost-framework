///<lib="facebook"/>    
///<lib="jquery"/>    
///<module="ghost/core"/>    
module ghost.browser.apis
{
 
    export interface IFacebookInitParameters {
        // Your application ID.
        appId: string;	// default null	
        permissions:string[];
        // true to enable cookie support.
        cookie?:boolean; // default false			
    
        // false to disable logging.
        logging?: boolean;	// default true			
        
        // true to fetch fresh status.
        status?: boolean; // default true
        
        // true to parse XFBML tags.
        xfbml?: boolean; // default false
        
        // Specifies the URL of a custom URL channel file. This file must contain a single 
        // script element pointing to the JavaScript SDK URL.
        channelUrl?: string; // default true
    
        // Manually set the object retrievable from getAuthResponse.
        authResponse?: Object; // default true
        
        /**
         * Frictionless Requests enable users to send Requests to specific friends from within 
         * an app without having to click on a pop-up confirmation dialog. Upon sending a Request 
         * to a friend from within an app, a user may authorize the app to send subsequent Requests 
         * to the same friend without a Dialog prompt. This removes a Dialog from the flow and 
         * streamlines the process of sharing with friends.
         * 
         * @see http://developers.facebook.com/docs/reference/dialogs/requests/#frictionless_requests
         */
        frictionlessRequests?: boolean; // default false
    
        /**
         * Developers who wish to provide a custom hide and display experience may pass a 
         * JavaScript function in the hideFlashCallback option for FB.init. This function 
         * will be executed whenever the Flash object is hidden or displayed due to user 
         * behavior (clicking on a Notification, etc.) and can be used by a developer to 
         * take the appropriate actions: hiding or displaying their Flash object. It receives 
         * a parameter of type object that contains two properties
         */
        hideFlashCallback?: (params: { 
            state: string; // 'opened' or 'closed'
            elem: HTMLElement; 
        }) => {};	
    }
        
    
    export class Facebook
    {
        private static TIMEOUT:number = 3000;
        private _ready:boolean = false
        private static options:any;
        private _permissions:any;
        constructor(options:IFacebookInitParameters, callback:(success:boolean)=>void = null)
        {
            console.log("FACEBOOK INIT");
            this._permissions = options.permissions;
            this.init(options, callback);
        }  
        private init(options:IFacebookInitParameters, callback:(success:boolean)=>void = null)
        {
            if(this._ready)
            {
                if(callback)
                {
                    this.getLoginStatus(callback);
                }
                return;
            }
            console.log("initializing");
            var _this:Facebook = this;
            var toolate:boolean = false;
            var timeout:number = <any>setTimeout(function()
            {
                toolate = true;
                if(callback)
                {
                    callback(false);
                }
            },Facebook.TIMEOUT);
                if(!window["fbAsyncInit"])
                {
                    console.log("CREATE FB ASYNC");
                window["fbAsyncInit"] = function() {
                    console.log("cALL FB ASYNC");
                    if(toolate)
                    {
                        return;
                    }else
                    {
                        clearTimeout(<any>timeout);
                    }
                    console.log("fb init..");
                    
                    FB.init(options);
                    _this._ready = true;
                    if(callback)
                        _this.getLoginStatus(callback);
                  };
              }else
              {

            }
            if($("#fb-root").length == 0)
            {
                $("body").append('<div id="fb-root"></div>');
            }
//            alert("ok");
            if(window["fbAsyncInit"] && window["fbAsyncInit"].hasRun)
            {
                console.log("call FB ASYNC");
                window["fbAsyncInit"]();
            }else
            {
                console.log("create facebook");
                $("#facebook-jssdk").remove();
                (function(d){
                    var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
                    if (d.getElementById(id)) {return;}
                    js = d.createElement('script'); js.id = id; js.async = true;
                    js.src = "https://connect.facebook.net/"+ghost.core.Hardware.getLocale()+"/all"+((ghost.constants.debug && false)?"/debug.js":".js");
                    ref.parentNode.insertBefore(js, ref);
                }(document));
             }
        }
        
        public isReady():boolean
        {
            return this._ready;
        }
        public login(callback:(success:boolean, response?:any)=>void):void
        {
            
            console.log("FACEBOOK LOGIN");
            if(this.isReady())   
            {
                console.log("FACEBOOK READY");
                var _this:Facebook = this;
                FB.login
                (
                    function(auth:any):void 
                    {
                        console.log("FACEBOOK AUTH");
                        if (auth.authResponse) 
                        {
                            FB.api('/me', function(response) {
                            console.log("FACEBOOK ME");
                                for(var p in auth)
                                {
                                    response[p] = auth[p];
                                }
                                //ghost.user.populateByFacebook(response);
                                if(callback)
                                    callback(true, response);
                            });
                            //TODO:if /me doesn't work
                           
                        }
                        else 
                        {
                            console.log('User cancelled login or did not fully authorize.');
                            if(callback)
                                callback(false);
                        }
                    },
                    {scope:_this._permissions.join(",")}
                );
            }else
            {
                            console.log('Facebook not ready');
                

                if(callback)
                    callback(false);
            }
        }
        public getLoginStatus (callback:(success:boolean, response?:any)=>void):void
        {
            console.log("FACEBOOK PRELOGIN STATUS");
            var toolate:boolean;
            var timeout:number = <any>setTimeout(function()
            {
                console.log("Facebook Timeout");
                toolate = true;
                if(callback)
                {
                    callback(false);
                }
            },2000);
            FB.getLoginStatus(function(response:any):void
            {
                if(toolate)
                {
                    return;
                }
                clearTimeout(<any>timeout);

                console.log("FACEBOOK GET LOGIN STATUS");
                console.log(response);
                if(response.status == "connected")
                {
                //    ghost.user.populateByFacebook(response);
                    if(callback)
                        callback(true, response);
                    return;
                }else
                if(response.status == "not_authorized")
                {
                    //pas authorisé
                }else
                {
                    //pas connecté à facebook
                    if(response.status == "unknown")
                    {
                        if(callback)
                        {
                            callback(true);
                            return;
                        }
                    }
                }
                if(callback)
                    callback(false);
            });
        }
        
        public static PERMISSIONS:any = 
        {
            EMAIL : "email",
            MANAGE_PAGES : "manage_pages",
            READ : 
            {
                FRIENDS_LIST : "read_friendlists",
                INSIGHTS : "read_insights",
                MAILBOX : "read_mailbox",
                REQUESTS : "read_requests",
                STREAM : "read_stream",
                XMPP_LOGIN : "xmpp_login",
                ONLINE_PRESENCE : "user_online_presence",
                FRIENDS_ONLINE_PRESENCE : "friends_online_presence"
            },
            PUBLISH :
            {
                ADS_MANAGEMENT : "ads_management",
                CREATE_EVENT : "create_event",
                MANAGE_FRIENDS_LIST : "manage_friendlists",
                MANAGE_NOTIFICATIONS : "manage_notifications",
                ACTIONS : "publish_actions",
                STREAM : "publish_stream",
                RSVP_EVENTS : "rsvp_event" 
            },
            USER : 
            {
                ABOUT_ME : "user_about_me",
                ACTIVITIES : "user_activities",
                BIRTHDAY : "user_birthday",
                CHECKINS : "user_checkins",
                EDUCATIONAL_HISTORY : "user_education_history",
                EVENTS : "user_events",
                GROUPS : "user_groups",
                HOMETOWN : "user_hometown",
                INTERESTS : "user_interests",
                LIKES : "user_likes",
                LOCATION : "user_location",
                NOTES : "user_notes",
                PHOTOS : "user_photos",
                QUESTIONS : "user_questions",
                RELATIONSHIPS : "user_relationships",
                RELATIONSHIPS_DETAILS : "user_relationship_details",
                RELIGION_POLITICS : "user_religion_politics",
                STATUS : "user_status",
                SUBSCRIPTIONS : "user_subscriptions",
                VIDEOS : "user_videos",
                WEBSITE : "user_website",
                WORK_HISTORY : "user_work_history",
                ACTIONS : 
                {
                    PUBLISH : "publish_actions",
                    MUSIC : "user_actions.music",
                    NEWS : "user_actions.news",
                    VIDEO : "user_actions.video",
                    NAMESPACED : "user_actions:",
                    GAME_ACTIVITIES : "user_games_activity"
                }
            },
            FRIENDS : 
            {
                ABOUT_ME : "friends_about_me",
                ACTIVITIES : "friends_activities",
                BIRTHDAY : "friends_birthday",
                CHECKINS : "friends_checkins",
                EDUCATIONAL_HISTORY : "friends_education_history",
                EVENTS : "friends_events",
                GROUPS : "friends_groups",
                HOMETOWN : "friends_hometown",
                INTERESTS : "friends_interests",
                LIKES : "friends_likes",
                LOCATION : "friends_location",
                NOTES : "friends_notes",
                PHOTOS : "friends_photos",
                QUESTIONS : "friends_questions",
                RELATIONSHIPS : "friends_relationships",
                RELATIONSHIPS_DETAILS : "friends_relationship_details",
                RELIGION_POLITICS : "friends_religion_politics",
                STATUS : "friends_status",
                SUBSCRIPTIONS : "friends_subscriptions",
                VIDEOS : "friends_videos",
                WEBSITE : "friends_website",
                WORK_HISTORY : "friends_work_history",
                ACTIONS : 
                {
                    MUSIC : "friends_actions.music",
                    NEWS : "friends_actions.news",
                    VIDEO : "friends_actions.video",
                    NAMESPACED : "friends_actions:",
                    GAME_ACTIVITIES : "friends_games_activity"
                }

            }
        };

        public static config(appId:string):void
        public static config(options:IFacebookInitParameters):void
        public static config(options:any):void
        {
            if(typeof options == "string")
            {
                    options = {appId:options, permissions:[]};
            }
            Facebook.options = options;
        }
        public ready(callback:(success:boolean)=>void ):void
        public ready(appId:string,  callback:(success:boolean, response?:any)=>void ):void
        public ready(options:IFacebookInitParameters,  callback?:(success:boolean, response?:any)=>void ):void
        public ready(options:any, callback:(success:boolean, response?:any)=>void = null):void
        {
            Facebook.ready(options, callback);
        }
        public static ready(callback:(success:boolean)=>void ):void
        public static ready(appId:string,  callback?:(success:boolean, response?:any)=>void ):void
        public static ready(options:IFacebookInitParameters,  callback?:(success:boolean, response?:any)=>void ):void
        public static ready(options:any, callback:(success:boolean)=>void = null):void
        {

            
            if(typeof options == "string")
            {
                    options = {appId:options, permissions:[]};
            }
            if(typeof options == "function")
            {
                    callback = options;
                    //no options
                    options = Facebook.options;
            }
            if(!(ghost.browser.apis.fb instanceof Facebook))
            {

                console.log("create fb",options);
                ghost.browser.apis.fb = new Facebook(options, callback);
            }else
            {
                //already exists
                console.log("FB ALREADY EXISTS");
                ghost.browser.apis.fb.init(options, callback);
            }
        }
    }
    
   export var fb:Facebook;

    
}