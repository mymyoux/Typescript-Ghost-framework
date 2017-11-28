import {LocalForage} from "browser/data/Forage";
import {Router} from "./Router";

export class Auth
{
    protected static _user:any;
    public static check():any
    {
        return !!this.id();
    }
    public static listenLogout():void
    {
        Router.instance().register('logout',this.logout.bind(this));
    }
    public static setUser(user:any):void
    {
        window["user"] = user;
        Auth._user = user;
        if(user && user.token)
        {
            this.cache().setItem('user', user.writeExternal?user.writeExternal():user);
        }else{
            this.cache().removeItem('user');
        }
    }
    public static user():any
    {
        return  Auth._user;
    }
    public static id():number
    {
        return  Auth._user?Auth._user.getID():null;
    }
     public static type():string
    {
        return  Auth._user?Auth._user.type:null;
    }
    public static getCacheUser():Promise<any>
    {
        return this.cache().getItem('user');
    }
    public static logout():void
    {
        this.cache().removeItem('user').then(()=>
        {
            window.location.href="/logout";
        });
    }
    public static cache(): LocalForage {
        return LocalForage.instance().war("auth");
    }
}
