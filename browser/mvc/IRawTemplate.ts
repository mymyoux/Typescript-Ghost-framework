

     export interface IRawTemplate
    {
        md5:string;
        content:string;
        url:string;
        parsed:string;
        version:number;
        components: any[];    
        loaded:()=> boolean;
    }
