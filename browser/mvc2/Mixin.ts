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

