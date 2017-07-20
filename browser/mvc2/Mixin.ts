import {Inst} from "./Inst";





export {Unique, Sorted} from "./Collection";
export {Table} from "./components/Table"; 

type Constructor<T extends {}> = new(...args: any[]) => T;
export function Singleton<X extends Constructor<{}>>( Child:X ) {
    type T =  typeof Child.prototype;
    return class extends Child {
        constructor(...args: any[]) {
            super(...args);
            Inst.register(this);
        }

    }
};
export function applyCustomMixin(original, mixin)
{
    var tocopy = mixin(original.constructor);
    var virginClass = mixin(function(){});
    var virgin = new virginClass();
    for(var p in virgin)
    {
        if(typeof virgin[p] == "function")
        {
            console.log("copy:"+p+" as function");
            original[p] = tocopy.prototype[p];//.bind(original);
        }else{
            console.log("copy:"+p+" as variable");
            original[p] = virgin[p];
        }
    }
    return original;
}

