import {Router} from "./Router";
import {IRoute} from "./IRoute";
export class MasterRouter
{
    protected static instances:any[] = [];
    protected static instancesClass:any[] = [];
    public static addPackage(cls:any):void
    {
        for(var p in cls)
        {
            if(cls[p].prototype.route)
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
        var load:any = object.handleRoute(url, route);
        if(load === true)
        {
            object.handleActivation(url, route);
        }
        return load;
    }
    public static listen():void
    {
        Router.instance().listen();
    }
}