import {Singleton} from "../mvc2/Mixin";
export class _Step
{
    public steps:{name:string, time:number, time2?:number}[];
    private stepsName:string[];
    public constructor()
    {
        this.steps = [];
        this.stepsName = [];
        window["time"] = this;
    }
    public register(name:string):void
    {
        var index:number = this.stepsName.indexOf(name);
        if(index == -1)
        {
            this.steps.push({name:name, time:Date.now()});
            this.stepsName.push(name);
        }else{
            this.steps[index].time2 = Date.now();
        }
    }
    public resume():void
    {
        var start:number = window["time_start"]?window["time_start"]:this.steps[0].time;
        for(var t of this.steps)
        {
            console["log"](t.name+": "+(t.time - start)+" ms" +(t.time2?' => '+(t.time2-t.time)+"ms":''));
        }
    }
}
export class Step extends Singleton(_Step){}