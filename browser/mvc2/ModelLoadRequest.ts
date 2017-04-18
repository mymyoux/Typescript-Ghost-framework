export class ModelLoadRequest
{
    protected static regexp = /%([^%]+)%/g;
    public constructor(public path:string, public params:any = null, public config:any = null)
    {

    }
    
}