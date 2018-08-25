import {Master} from "browser/mvc2/Master";
import {Model} from "browser/mvc2/Model";
import {Inst} from "browser/mvc2/Inst";
import {Auth} from "browser/mvc2/Auth";
import {Router} from "browser/mvc2/Router";
import {Component} from "browser/mvc2/Component";
import {Buffer} from "ghost/utils/Buffer";
import {API2} from "browser/api/API2";


export class FileUpload extends Component
{
    public constructor(template:any)
    {
        super(template);
    }
    public props():any {
        return {
            "user":
            {
                required:true
            },
            "type":
            {
                required:false,
                default:'picture'
            },
            "who":
            {
                required:false,
                default:'user'
            },
            "picture":
            {
                required:false,
                default:'profile'
            },
            "index":
            {
                required:false
            }
        };
    }

    protected bindVue():void
    {
        this.$addData('image', false);
    }
    public bindEvents():void
    {
    }

    public $uploadPicture(e) : void
    {
        var file = e.target.files;
        if (!file.length)
            return;

        var formData = new FormData();
        formData.append('file', file[0]);
        formData.append('id_user', this.template.user.id_user);

        if (this.template.type == 'picture')
        {
            formData.append('picture', this.template.picture);
            if (this.template.picture == 'picture')
            {
                var index = this.template.index;
                var pictures = this.template.user.company.profile.pictures;
                formData.append('id_picture', pictures[index].id_picture);
            }
        }

        API2.request().path('file/upload').params(formData).then((data) =>
        {
            this.emit("updatePicture", data, this.template.picture, this.template.index);
        });

        var reader = new FileReader();
        reader.onload = (event:any) => {
            this.template.image = event.target.result;
        };
        reader.readAsDataURL(file[0]);
    }

    public $open():void
    {
        var input = $(this.template.$el).find("input[type='file']").click();
    }

    public activate():void{
        
    }
}