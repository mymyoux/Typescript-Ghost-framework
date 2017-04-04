
//convert-files
import {Root} from "./Root";
//convert-files
import {applyMixins} from "./applyMixins";
// var ROOT:any;
// try
// {
//     ROOT = window;
//     window["ROOT"] = ROOT;
//     ROOT._isNode = false;
// }catch(error)
// {
//     try
//    	{

//     	ROOT = eval("global");
//     	ROOT.ROOT = ROOT;
//    	}catch(error)
//    	{

//    	}
//     ROOT._isNode = true;
// }

 
    export function hasClass(name?:string):boolean
    {
        if(!name)
        {
            return false;
        }
        var names:string[] = name.split(".");
        var root:any = Root.getRoot();
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
        var root: any = Root.getRoot();
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
    
