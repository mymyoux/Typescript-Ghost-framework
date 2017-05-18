import {Objects} from "ghost/utils/Objects";
import {Component} from "browser/mvc2/Component";

type Constructor<T extends any> = new(...args: any[]) => T;

export function Table<X extends Constructor<any>>( Child:X ) {
    type T =  typeof Child.prototype;
    return class K extends Child {
        protected columns:IColumn[];
        protected config:any;
        private static defaultOptions:any = 
        {
            resizable:true,
            sortable:false,
            filterable:false,
            visible:true,
            link:false
        };
        constructor(...args: any[]) {
            super(...args);
            this.columns = [];
            this.bootColumns();
            window["taa"] = this;
        }
        public order(index:number | string | string[], direction:number|number[] = 1):void
        {
            if(typeof index != "number")
            {
                return super.order(index, direction);
            }
            var column:IColumn = this.columns[index];
            if(!column.sortable)
                return;
            var order:string[];
            if(!column.columns)
            {
                order = [column.prop];
            }else
            {
                order = column.columns;
            }
            super.order(order, direction);

        }
        protected bootColumns():void
        {
            this.columns = [];
            this.config = {};
            this.bindColumns();

        }
        public bindColumns()
        {
        } 
        protected onClick(item:any, column:IColumn):void
        {
            
        }
        protected addColumn(name:string, options?:IColumn)
        {
            if(!options)
            {
                options = Objects.clone(K.defaultOptions);
            }else
            {
                if(options.columns && options.sortable === undefined )
                {
                    options.sortable = true;
                }
                for(var p in K.defaultOptions)
                {
                    if(options[p] === undefined)
                    {
                        options[p] = K.defaultOptions[p];
                    }
                }
            }
            options.title = name;
            if(!options.type)
            {
                options.type = null;
                options.prop = name;
            }else
            {
                console.log("ICI");
                Component.addVueComponent("table-"+options.type, {props:["item","column","data"]});
                options.type = "component-table-"+options.type;
            }
           
            this.columns.push(options);
        }

    }
};
export interface IColumn
{
    type?:string;
    title?:string;
    prop?:string;
    sortable?:boolean;
    visible?:boolean;
    filterable?:boolean;
    resizable?:boolean;
    headerClasses?:string[];
    columns?:string[];
    link?:boolean|string;

    //order
    up?:boolean;
    down?:boolean;
}

