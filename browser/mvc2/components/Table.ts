import {Objects} from "ghost/utils/Objects";
import {Component} from "browser/mvc2/Component";
import {API2} from "browser/api/API2";
type Constructor<T extends any> = new(...args: any[]) => T;

export function Table<X extends Constructor<any>>( Child:X ) {
    type T =  typeof Child.prototype;
    return class K extends Child {
        protected columns:IColumn[];
        protected config:any;
        public filter:any;
        public search:any;
        private static defaultOptions:any = 
        {
            resizable:true,
            sortable:false,
            filterable:false,
            visible:true,
            link:false,
            editable:false,
            searchable:false,
            //edition:false,
            error:null,
            search:null
        };
        constructor(...args: any[]) {
            super(...args);
            this.filter = {};
            this.search = null;
            this.columns = [];
            this.bootColumns();
        }
        public loadGet(params?:any):Promise<any>
        {
            var request:API2 =  this.request();

            for (var key in params)
            {
                request.param(key, params[key]);
            }
            if(this.filter && (!params || !params.filter))
            {
                request.param("filter", this.filter);
            }

            return request.then(function(data)
            {
                return data;
            });
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
            this.config = {
                creatable:false,
                searchable:false,
                deletable:false
            };
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
            if(options.searchable)
            {
                this.config.searchable = true;
                if(options.prop)
                {
                    this.filter[options.prop] = "";
                }
            }
            options.title = name;
            if(!options.type)
            {
                options.type = null;
                if(!options.prop)
                    options.prop = name.toLowerCase();
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
    editable?:boolean;
    searchable?:boolean;
    search?:string;
 //   edition?:string; 
    error?:string;
    //order
    up?:boolean;
    down?:boolean;
}

