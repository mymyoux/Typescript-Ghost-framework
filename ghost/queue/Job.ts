///<lib="node"/>
namespace ghost.queue {
    export class Job{
      protected beanstalk: Beanstalk;
      public static STATE_EXECUTING: string = "executing";
      public static STATE_EXECUTED: string = "executed";
      public static STATE_FAILED: string = "failed";
      public static STATE_RETRYING: string = "retrying";

      public id: string;
      public data: any;
      public tries: number = 0;
      public state: string;
      public id_database: string;
      public start_time: number;
      public hard_failed: boolean = false;
      public constructor(beanstalk:Beanstalk, id:string, data:any, databaseData?:any)
      {
          this.beanstalk = beanstalk;
          this.id = id;
          if (databaseData)
          {
            this.data = JSON.parse(databaseData["json"]);
            this.tries = parseInt(databaseData["tries"], 10);
            this.state = databaseData["state"];
            this.id_database = databaseData["id"];
          }else{
            this.data = data;
          }
          this.tries++;
          this.state = Job.STATE_EXECUTING;
          this.start_time = Date.now();
      }
      public maxTries(): number {
        return 3;
      }
      public success()
      {
          this.state = Job.STATE_EXECUTED;
          this.beanstalk.success(this);
      }
      public hardFail()
      {
          this.state = Job.STATE_FAILED;  
          this.hard_failed = true;
          this.beanstalk.fail(this);
      }
      public fail()
      {
      if (this.maxTries()==0 || this.tries < this.maxTries())
        {
          this.state = Job.STATE_RETRYING;
        }else{
          this.state = Job.STATE_FAILED;  
        }
        this.beanstalk.fail(this);
      }
      public getDuration():number
      {
        return Date.now() - this.start_time;
      }
    }
}
