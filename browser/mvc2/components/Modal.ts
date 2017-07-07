import {Objects} from "ghost/utils/Objects";
import {Component} from "browser/mvc2/Component";

type Constructor<M extends any> = new(...args: any[]) => M;

export function Modal<X extends Constructor<any>>( Child:X ) {
    type M =  typeof Child.prototype;
    return class K extends Child {
        protected config:any;
        private static defaultOptions:any = 
        {
            resizable:true,
            sortable:false,
            filterable:false,
            visible:true,
            link:false
        };
        public skills: string;

        constructor(...args: any[]) {
            super(...args);
            window["modal"] = this;
        }
    }
};
