///<lib="node"/>
///<module="events"/>
///<module="database"/>
///<module="utils"/>
namespace ghost.queue {
    var beanstalk = require("fivebeans");
    import Database = ghost.database.Database;
    import Maths = ghost.utils.Maths;
    export class Beanstalk extends ghost.events.EventDispatcher
    {
        public static EVENT_DEADLINE_SOON:string = "DEADLINE_SOON";
        public static EVENT_CONNECTED:string = "connected";
        public static EVENT_ERROR:string = "error";
        public static EVENT_DISCONNECTED:string = "disconnected";
        private static _instance: Beanstalk;


        public static instance():Beanstalk
        {
            if (!Beanstalk._instance)
            {
                Beanstalk._instance = new Beanstalk();
            }
            return Beanstalk._instance;
        }
        protected beanstalk: any;
        protected connected:boolean;
        protected watched: any = {};
        public constructor()
        {
            super();
            this.connected = false;
        }
        public config(options:any):void
        {
            this.beanstalk = new beanstalk.client(options.ip, options.port);
            this.beanstalk.on('connect', this.onConnect.bind(this));
            this.beanstalk.on('error', this.onError.bind(this));
            this.beanstalk.on('close', this.onClose.bind(this));
            this.beanstalk.connect();
        }
        public onConnect()
        {
            this.connected = true;
            console.log("beantalkd - connected");
            this.trigger(Beanstalk.EVENT_CONNECTED);
        }
        public onError(error)
        {
            console.error("beanstalkd error - ",error);
            this.trigger(Beanstalk.EVENT_ERROR,error);
        }
        public onClose()
        {
            this.connected = false;
            console.log("beantalkd - closed"); 
            this.trigger(Beanstalk.EVENT_DISCONNECTED);
        }
        public next(tube:string, callback:any):void
        {
            if(!this.watched[tube])
            {
                this.watch(tube, ()=>
                {
                    this.next(tube, callback);
                });
                return;
            }
            this.reserve(callback);
        }
        public watch(tube:string, callback:any):void
        {
            if(!this.connected)
            {
                this.once(Beanstalk.EVENT_CONNECTED, ()=> {
                    this.watch(tube, callback);
                });
                return;
            }
            this.watched[tube] = true;
            this.beanstalk.watch(tube, callback);
        }
        public touch(id):void
        {
            // console.log("touch:"+id);
            this.beanstalk.touch(id, function(error)
            {
                console.log("touch error:", error);
            });
        }
        public reserve(callback:any):void
        { 
            var reserve_id: number = Maths.getUniqueID();
            console.log('reserve:' + reserve_id);
            this.beanstalk.reserve((error: any, id: string, payload: any): void =>
                {
                console.log('reserved:' + reserve_id+" => "+id);
                    if(error)
                    {
                        console.error("beanstalk reserve error:", error);
                        console.log(id);
                        console.log(payload);
                        if(error == Beanstalk.EVENT_DEADLINE_SOON)
                        {
                            this.trigger(Beanstalk.EVENT_DEADLINE_SOON);
                            setTimeout(()=>
                            {
                                console.log("retry");
                                this.reserve(callback);
                            }, 5000);
                        }else{
                            console.log("no deadline");
                        }
                        return;
                    }
                    var data:any = JSON.parse(payload.toString('utf8'));
                    
                    if(data && data._id_beanstalkd)
                    {
                        Database.instance().query('SELECT * FROM beanstalkd_log WHERE id=?', [data._id_beanstalkd], (error, results, fields)=>
                        {
                             if(error)
                             {
                                 console.error("beanstalk reserve mysql error:", error);
                                 return;
                             }   
                             if (!results.length)
                             {
                                 console.error("beanstalk mysql error: no beanstalkd with id = ", data._id_beanstalkd);
                                 return;
                             }
                             var job: Job = new Job(this, id, data, results[0]);
                             console.log("job reserver["+reserve_id+"] => "+job.id);
                             Database.instance().query('UPDATE beanstalkd_log SET state=?,tries=? WHERE id=?', [job.state, job.tries, job.id_database], function(error) 
                             {
                                 if (error) {
                                     console.error("beanstalk reserve mysql update error:", error);
                                     return;
                                 }   
                                 callback(job);
                             });
                        });
                    }else
                        callback(new Job(this, id, data));
                });
        }
        public success(job: Job): void
        {
            this.beanstalk.destroy(job.id, function() { });
             this.updateJob(job);
        }
        public fail(job:Job):void
        {
            if(!job.hard_failed && job.tries<job.maxTries())
            {
                this.beanstalk.release(job.id, 0, 60,function(){});
            }else{
                this.beanstalk.bury(job.id, 0, function() { });
            }
           this.updateJob(job);
        }
        protected updateJob(job:Job):void
        {
            if (job.id_database) {
                Database.instance().query('UPDATE beanstalkd_log SET state=?, duration=? WHERE id=?', [job.state, job.getDuration(),job.id_database]);
            }
        }
    }
}
