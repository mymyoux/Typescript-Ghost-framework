var ROOT:any;
try
{
    ROOT = window;
    window["ROOT"] = ROOT;
    ROOT._isNode = false;
}catch(error)
{
    try
   	{

    	ROOT = eval("global");
    	ROOT.ROOT = ROOT;
   	}catch(error)
   	{

   	}
    ROOT._isNode = true;
}

namespace ghost
{
    export function hasClass(name?:string):boolean
    {
        if(!name)
        {
            return false;
        }
        var names:string[] = name.split(".");
        var root:any = ROOT;
        var len:number = names.length;
        for(var i:number=0; i<len; i++)
        {
            if(root[names[i]])
            {
                root = root[names[i]];
            }else
            {
                return false;
            }
        }
        return true;
    }
    export function getClassByName(name?:string):any
    {
        if(!name)
        {
            return null;
        }
        var names:string[] = name.split(".");
        var root:any = ROOT;
        var len:number = names.length;
        for(var i:number=0; i<len; i++)
        {
            if(root[names[i]])
            {
                root = root[names[i]];
            }else
            {
                return null;
            }
        }
        return root;
    }
    
}
function applyMixins(derivedCtor: any, baseCtors: any[], config:any = null) {
    if(!derivedCtor || !baseCtors)
    {
        return;
    }
    if (derivedCtor.prototype && typeof derivedCtor == "function")
    {
        baseCtors.forEach(baseCtor => {

            if (baseCtor.prototype.applyMixin) {
                baseCtor.prototype.applyMixin(derivedCtor.prototype, config);
            } else {
                Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
                    derivedCtor.prototype[name] = baseCtor.prototype[name];
                });
            }
        });
    }else
    {
        baseCtors.forEach(baseCtor => {
            if (baseCtor.prototype.applyMixin)
            {
                baseCtor.prototype.applyMixin(derivedCtor, config);
            }else
            {
                Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
                    derivedCtor[name] = baseCtor.prototype[name];
                });
            }
        });
    }
}
