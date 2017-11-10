import {Collection} from "browser/mvc2/Collection";
import {Router} from "browser/mvc2/Router";
import {Sorted,Unique,Singleton,Table} from "browser/mvc2/Mixin";
import {ErrorModel} from "../models/ErrorModel";
import {API2} from "browser/api/API2";

import {Model,ModelLoadRequest} from "browser/mvc2/Model";
type Constructor<T extends Model> = new(...args: any[]) => T;
function A<X extends Constructor<Model>>( CModel:X ) {
   type T =  typeof CModel.prototype;
   return class A extends CModel {

   }
} 

export class ErrorCollection extends A(Singleton(Table(Unique(Sorted(Collection(ErrorModel))))))
{
    public static PATH_REALTIME:()=>ModelLoadRequest =
    ()=>new ModelLoadRequest("error/interval", {}, {replaceDynamicParams:false, removePreviousModels:true, readExternal:true,marksPathAsLoaded:false,ignorePathLoadState:true});
   //
   public max:number = 0;
   public constructor()
   {
      super();
      this.order(['last_created_time'], [-1]);
   }
       public bindColumns()
    { 
        this.config.creatable = true;
        this.config.deletable = true;
        // this.addColumn('Flag', {type:"flag"});
         this.addColumn('Count', {prop:"count",searchable:true,sortable:true,columns:["count","last_created_time"]}/*{type:"name",link:true,sortable:true,headerClasses:["TEST","NON"]}*/);
         this.addColumn('Path', {prop:"url",searchable:true,sortable:true,columns:["url","last_created_time"]}/*{type:"name",link:true,sortable:true,headerClasses:["TEST","NON"]}*/);
         this.addColumn('File', {prop:"file",searchable:true,sortable:true,columns:["file","last_created_time"]}/*{type:"name",link:true,sortable:true,headerClasses:["TEST","NON"]}*/);
         this.addColumn('Type', {prop:"type",searchable:true,sortable:true,columns:["type","last_created_time"]}/*{type:"name",link:true,sortable:true,headerClasses:["TEST","NON"]}*/);
         this.addColumn('Message', {prop:"message",searchable:true,sortable:true,columns:["message","last_created_time"]}/*{type:"name",link:true,sortable:true,headerClasses:["TEST","NON"]}*/);
         this.addColumn('Line', {prop:"line",searchable:true,sortable:true,columns:["line","last_created_time"]}/*{type:"name",link:true,sortable:true,headerClasses:["TEST","NON"]}*/);
        // this.addColumn('Locale', {prop:"locale", editable:true,searchable:true} /*{type:"name",link:true,sortable:true,headerClasses:["TEST","NON"]}*/);
        // this.addColumn('singular', {prop:"singular", editable:true,searchable:true} /*{type:"name",link:true,sortable:true,headerClasses:["TEST","NON"]}*/);
        // this.addColumn('plurial', {prop:"plurial", editable:true,searchable:true} /*{type:"name",link:true,sortable:true,headerClasses:["TEST","NON"]}*/);
        // this.addColumn('type', {prop:"type", editable:true,searchable:true} /*{type:"name",link:true,sortable:true,headerClasses:["TEST","NON"]}*/);
        // this.addChoice('trad',['empty',{label:'empty plurial',value:'empty_plurial'},'all']);
    }
   
    public loadRealtime(params?:any,config?:any):any
    {
        return this.load(this.constructor["PATH_REALTIME"], params, config);
    }
};