import {Master} from "browser/mvc2/Master";
import {Model} from "browser/mvc2/Model";
import {Inst} from "browser/mvc2/Inst";
import {Auth} from "browser/mvc2/Auth";
import {Router} from "browser/mvc2/Router";
import {Component} from "browser/mvc2/Component";
import {AutocompleteComponent} from "browser/mvc2/components/Autocomplete";
import {API2} from "browser/api/API2";

export class ModalComponent extends Component
{
    public place: any;
    public modalInfo: any;
    public tags: any;
    public skills: string;
    public search: string = "";
    protected language:any = [];
    protected experience:any = [];
    protected position:any = [];
    protected choice:any = null;

    protected bindVue():void
    {
        window["modal"] = this;
    }

    public props():any {
        return {
            "actions":
            {
                type:Boolean,
                default:true
            },
            "data":
            {
                required:true
            }
        };
    }

    protected $onAutocompleteChoice(autocomplete:AutocompleteComponent, choice:any):void
    {
        this.choice = choice;
        // this.modalInfo.id_company = choice.id_company;
        console.log(choice);
        //   this.triggerSubmit.now();
        //   var place:PlaceModel = new PlaceModel();
        //   place.load('place/get-by-google-id', {id_google_place : choice.place_id}).then((data:any):void=>
        //   {
        //         this.$getModel(MarketPlaceCollection).setPlace(data);
        //         this.triggerSubmit.delayed(1000);
        //         this.triggerSubmit.now();
        //   });

        //get choosen place
    }
    protected $onAutocomplete(autocomplete:AutocompleteComponent):void
    {
        var choice:any = autocomplete.getChoice();

        //var marketplace = this.$getModel('marketplaces');
        //marketplace.location = choice;

        API2.request().path('admin/company/all').param('search', choice).then((data) => {
            autocomplete.setAutocomplete(data);
        });
        console.log(choice);
        // GMap.autocomplete(choice).then((data:any)=>
        // {
        //     if(data && data.length)
        //     {
        //         for(var item of data)
        //         {
        //             item.name = item.description;
        //         }
        //     }
        //    autocomplete.setAutocomplete(data);

        // }, (error:any)=>
        // {
        //     autocomplete.setAutocomplete([]);
        // });
    }


    public $closeModal():void
    {
        $(".job").find('.modal').addClass('hide');
    }

    public $alert(jobboards:any):void
    {
        if (this.choice)
            jobboards.id_company = this.choice.id_company;

        this.$getData("data").alert(jobboards);
    }

    public $getTags(jobboards: any): any
    {
        var result = [];

        if (jobboards) {
            for (var l in jobboards) {
                if (jobboards[l].selected == true) {
                    result.push(jobboards[l].type);
                }
            }
        }

        return result.join(", ");
    }

    public $eventSelect(jobboards: any):void
    {
        if (jobboards.selected == false) {
            jobboards.selected = true;
        } else {
            jobboards.selected = false;
        }
    }

    protected $show():void{
    }
    protected $debug(data:any):void
    {
        debugger;
    }

    public activate():void{
        debugger;
    }
}