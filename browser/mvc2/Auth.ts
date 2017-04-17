export class Auth
{
    protected static _user:any;
    public static check():any
    {
        return  Auth._user && Auth._user.id_user;
    }
    public static setUser(user:any):void
    {
        Auth._user = user;
    }
    public static user():any
    {
        return  Auth._user;
    }
    public static id():number
    {
        return  Auth._user?Auth._user.id_user:null;
    }
     public static type():string
    {
        return  Auth._user?Auth._user.type:null;
    }
}