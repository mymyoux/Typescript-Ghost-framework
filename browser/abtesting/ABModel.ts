
///<module="framework/browser/api"/>
///<module="framework/browser/mvc"/>

    //convert-import
import {APIExtended} from "browser/api/APIExtended";
    //convert-import
import {ModelAPI} from "browser/mvc/ModelAPI";
    //convert-import
import {Model} from "browser/mvc/Model";
       //convert-import
import {Application} from "browser/mvc/Application";
      export class ABModel extends ModelAPI {
        public static PART_UPDATE: string = "part_update";
        public static PART_CREATE: string = "part_create"; 

        public id_abtesting:number;
        public id_user:number;
        public abname:string;
        public test:number;
        public version:number;
        public previous:any;
        public value:any;
        public result:any;
        public state:string;
        public step:number;
        public id_external:number; 

        public static getABTesting(name:string, id_user:number = null, version:number = null):ABModel
        {
            var model: ABModel = new ABModel();
            if(!id_user)
            {
                id_user = Application.instance().user.id_user; 
            }
            model.readExternal({ name: name, id_user: id_user, version: version });
            return model;
        }
        //TODO:end model
        protected saveInstance(): boolean {
            return false;
        }
        public name(): string {
            return "ab";
        }
        public hasRemoteData():boolean
        {
            return this.id_abtesting != null;
        }
        public isActivated():boolean
        {
            return this.test != undefined;
        }
        public retrieve():Promise<any>
        {
            var promise:Promise<any> = new Promise<any>((resolve:any, reject:any):void=>
            {
                this.getRequest(Model.PART_DEFAULT).then((data: any) => {
                    this.readExternal(data);
                    if(!this.hasRemoteData())
                    {
                        reject("no_data");
                        return;
                    }
                    resolve(data);
                }, reject);

            });
            return promise;
        }
        public save(): APIExtended
        {
            return this.getRequest(ABModel.PART_UPDATE);
        }
        public nextStep(): APIExtended {

            if (this.step == undefined)
            {
                this.step = 0;
            }
            this.set("step", this.step + 1);
            return this.save();
        }
        public done():APIExtended
        {
            this.set("state", "end");
            return this.save();
        }
        protected getRequest(name: string, params: any = null): APIExtended {
            switch (name) {
                case Model.PART_DEFAULT:

                    var request:APIExtended = this.request(name).controller("ab").method("GET").action("get");
                    if(this.id_abtesting)
                    {    
                        request = request.param("id_abtesting", this.id_abtesting);
                    }else
                    {
                        request = request.param("name", this.abname);
                        if(this.version)
                        {
                            request = request.param("version", this.version);
                        }
                    }
                    return request;
                case ABModel.PART_UPDATE:

                    var request: APIExtended = this.request(name).controller("ab").method("POST").action("update");
                    if (this.id_abtesting) {
                        request = request.param("id_abtesting", this.id_abtesting);
                    } else {
                        request = request.param("name", this.abname);
                        if (this.version) {
                            request = request.param("version", this.version);
                        }
                    }
                    var keys: string[] = ["previous", "value", "result", "id_external", "state", "step"];
                    var key: string;
                    for(var p in keys)
                    {
                        key = keys[p];
                        if(this[key] != undefined)
                            request = request.param(key, this[key]);
                    }
                    return request;
            }
            return null;
        }
        public readExternal(data: any): void {
            if (!data) {
                return;
            }
            if(data.name)
            {
                this.abname = data.name;
                delete data.name;
            }
            super.readExternal(data);
        }
        public toRactive(): any {
            return this;
        }
    }
