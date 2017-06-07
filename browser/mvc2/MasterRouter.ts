import {Router} from "./Router";
import {IRoute} from "./IRoute";
import {Scope} from "browser/mvc/Scope";
export class MasterRouter
{
    protected static instances:any[] = [];
    protected static instancesClass:any[] = [];
    protected static _scopes:any = {};
    public static addPackage(cls:any):void
    {
        for(var p in cls)
        {
            if(cls[p] && cls[p].prototype && cls[p].prototype.route)
            {
                this.addMaster(cls[p]);
            }
        }
    }
    public static router():Router
    {
        return Router.instance();
    }
    public static addMaster(cls:any):void
    {
        var route:IRoute = cls.prototype.route.call(cls.prototype   , MasterRouter);
        if(!route)
        {
            //custom route or no route
            return;
        }
        MasterRouter.register(route, cls);
        console.log("register", route);
      
    }
    public static register(route:IRoute, cls:any)
    {
        
        Router.instance().register(route, this.onRoute.bind(null, cls));
    }
    protected static onRoute(cls:any, route:IRoute, url:string):any
    {
        var index:number = MasterRouter.instancesClass.indexOf(cls);
        var object:any;
        if(index == -1)
        {
            index = MasterRouter.instancesClass.length;
            MasterRouter.instancesClass.push(cls);
            object = new cls();
            MasterRouter.instances.push(object);
            object.boot();
        }
        object = MasterRouter.instances[index];
         //TODO:remove only for mvc1 compatibility
        if(object.scoping && route.scope)
        {
            console.log("prescope:", route.scope);
            object.scope(require("browser/mvc/Scope").Scope.getScope(route.scope));
        }
        var load:any = object.handleRoute(url, route);
        if(load !== false && typeof load != "string")
        {
            var scope:string = object.scope();
            console.log("scope:", scope);
            if(scope)
            {
                //TODO:remove only for mvc1 compatibility
                if(typeof scope != "string")
                {
                    scope = (<any>scope).name();
                }
                console.log("scope_name:", scope);
                if(MasterRouter._scopes[scope] && (MasterRouter._scopes[scope]!==object || MasterRouter._scopes[scope].scope().name()!=scope))
                {
                console.log("remove_old:", MasterRouter._scopes[scope]);
                    console.log("[MASTERROUTER]disactivation:"+scope, MasterRouter._scopes[scope]);
                    MasterRouter._scopes[scope].handleDisactivation();
                }else
                if(MasterRouter._scopes[scope]===object)
                {
                        MasterRouter._scopes[scope].handleDisactivation();
                        MasterRouter._scopes[scope].scope(require("browser/mvc/Scope").Scope.getScope(route.scope));
                }
                console.log("add_new:", object);
                MasterRouter._scopes[scope] = object;
                object._activated = false;
            }else
            {
            }
            console.log("[MASTERROUTER]activation:"+scope+" => "+url, object);
            object.handleActivation(url, route);
        }
        return load;
    }
    public static disactivate(scope:string):void
    {
        if(MasterRouter._scopes[scope])
        {
            MasterRouter._scopes[scope].handleDisactivation();
            MasterRouter._scopes[scope] = null;
        }
    }
    public static listen():void
    {
        Router.instance().listen();
        Router.instance().on('remove_all',this.onRemoveAll);
    }
    public static onRemoveAll(scope:string):void
    {
        debugger;
        if(MasterRouter._scopes[scope])
        {
            console.log("[MASTERROUTER]disactivation:"+scope, MasterRouter._scopes[scope]);
            MasterRouter._scopes[scope].handleDisactivation();
        }
        MasterRouter._scopes[scope] = null;
    }
    public static parseInitialUrl():void
    {
        Router.instance().parseInitialUrl();
    }
    public static getCurrentMaster(scope:string):any
    {
        return MasterRouter._scopes[scope];
    }
}