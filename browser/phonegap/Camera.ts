namespace ghost.phonegap
{
    var _Camera:any;
    if(!ROOT.Camera)
    {
        _Camera = 
        {
            DestinationType:
            {
                DATA_URL:0,
                FILE_URI:1   
            },
            PictureSourceType:
            {
                CAMERA:0,
                PHOTOLIBRARY:1,
                SAVEDPHOTOALBUM:2
            },
            EncodingType:
            {
                JPEG:0,
                PNG:1
            },
            MediaType:
            {
                PICTURE:0,
                VIDEO:1,
                ALLMEDIA:2
            }
        };
    }else
    {
        _Camera = ROOT.Camera;
    }
    /**
     * @private
     */
    export class _CameraManager
    {
         /**
         * Get Media data as base64
         * @type {int}
         * @private
         */
        private _SOURCE_TYPE_BASE64 = _Camera.DestinationType.DATA_URL;
        /**
         * Get Media data as file URL
         * @type {int}
         * @private
         */
        private _SOURCE_TYPE_URL = _Camera.DestinationType.FILE_URI;
        /**
         * Media's source : Camera
         * @type {int}
         * @private
         */
        private _SOURCE_CAMERA = _Camera.PictureSourceType.CAMERA;
        /**
         * Media's source : Library
         * @type {int}
         * @private
         */
        private _SOURCE_LIBRARY = _Camera.PictureSourceType.PHOTOLIBRARY;
        /**
         * Media's source : Saved photo album
         * @type {int}
         * @private
         */
        private _SOURCE_SAVED_PHOTOS = _Camera.PictureSourceType.SAVEDPHOTOALBUM;
        /**
         * Media's type : JPG
         * @type {int}
         */
        public ENCODING_JPEG = _Camera.EncodingType.JPEG;
        /**
         * Media's type : PNG
         * @type {int}
         */
        public ENCODING_PNG = _Camera.EncodingType.PNG;
        /**
         * Allows user to take only picture
         * @type {int}
         */
        public MEDIA_TYPE_PICTURE = _Camera.MediaType.PICTURE;
        /**
         * Allows user to take only video
         * @type {int}
         */
        public MEDIA_TYPE_VIDEO = _Camera.MediaType.VIDEO;
        /**
         * Allows user to take picture or video
         * @type {int}
         */
        public MEDIA_TYPE_ALL = _Camera.MediaType.ALLMEDIA;
        /**
         * Error returned when no picture has been selected
         * @type {string}
         */
        public ERROR_NO_PICTURE_SELECTED = "no image selected";
        /**
         * Error returned when the device has no camera available
         * @type {string}
         */
        public ERROR_NO_CAMERA = "no camera available";
        /**
         * @private
         */
        private _camera:any;
        /**
         * Constructor
         */
        constructor()
        {
            this._camera = ROOT.navigator["camera"];
        }
        /**
         * Gets picture from saved photos. ie: on android there is no difference between this function and #getPictureFromLibrary()
         * @param callback callback's function
         * @param isBase64 If true the result will be into base64 format otherwise the file url is given
         * @param mediaType Can be Camera.MEDIA_TYPE_PICTURE, Camera.MEDIA_TYPE_VIDEO or Camera.MEDIA_TYPE_ALL
         * @param allowEdit If true allow edition of the picture (only on iOS)
         * @param cameraOptions cameraOptions, see phonegap docs for more info
         */
        public getPictureFromSavedPhotos( callback, isBase64,  mediaType, allowEdit, cameraOptions ):void
        {
            this._getPicture(callback, CameraManager._SOURCE_SAVED_PHOTOS, isBase64, mediaType, allowEdit, cameraOptions);
        }
        /**
         * Gets picture from library. ie: on android there is no difference between this function and #getPictureFromSavedPhotos()
         * @param callback callback's function
         * @param isBase64 If true the result will be into base64 format otherwise the file url is given
         * @param mediaType Can be Camera.MEDIA_TYPE_PICTURE, Camera.MEDIA_TYPE_VIDEO or Camera.MEDIA_TYPE_ALL
         * @param allowEdit If true allow edition of the picture (only on iOS)
         * @param cameraOptions cameraOptions, see phonegap docs for more info
         */
        public getPictureFromLibrary( callback, isBase64,  mediaType, allowEdit, cameraOptions )
        {
            this._getPicture(callback, CameraManager._SOURCE_LIBRARY, isBase64, mediaType, allowEdit, cameraOptions);
        }
        /**
         * Gets picture with the device's camera
         * @param callback callback's function
         * @param isBase64 If true the result will be into base64 format otherwise the file url is given
         * @param mediaType Can be Camera.MEDIA_TYPE_PICTURE, Camera.MEDIA_TYPE_VIDEO or Camera.MEDIA_TYPE_ALL
         * @param allowEdit If true allow edition of the picture (only on iOS)
         * @param cameraOptions cameraOptions, see phonegap docs for more info
         */
        public getPicture( callback, isBase64,  mediaType, allowEdit, cameraOptions )
        {
            this._getPicture(callback, CameraManager._SOURCE_CAMERA, isBase64, mediaType, allowEdit, cameraOptions);
        }
        /**
         * Gets picture
         * @param callback callback's function
         * @param isBase64 If true the result will be into base64 format otherwise the file url is given
         * @param mediaType Can be Camera.MEDIA_TYPE_PICTURE, Camera.MEDIA_TYPE_VIDEO or Camera.MEDIA_TYPE_ALL
         * @param allowEdit If true allow edition of the picture (only on iOS)
         * @param cameraOptions cameraOptions, see phonegap docs for more info
         * @private
         */
        private _getPicture(callback, sourceType, isBase64,  mediaType, allowEdit, cameraOptions)
        {
            if(!cameraOptions)
            {
                cameraOptions = {};
            }
            var options = { quality : cameraOptions.quality?cameraOptions.quality:75,
                destinationType : isBase64?CameraManager._SOURCE_TYPE_BASE64:CameraManager._SOURCE_TYPE_URL,
                sourceType : sourceType,
                allowEdit : allowEdit === true,
                encodingType: cameraOptions.encodingType?cameraOptions.encodingType:CameraManager.ENCODING_PNG,
                targetWidth: cameraOptions.targetWidth?cameraOptions.targetWidth:100,
                targetHeight: cameraOptions.targetHeight?cameraOptions.targetHeight:100,
                popoverOptions: cameraOptions.popoverOptions,
                saveToPhotoAlbum: cameraOptions.saveToPhotoAlbum!=undefined?cameraOptions.saveToPhotoAlbum:false,
                mediaType:mediaType!=undefined?mediaType:CameraManager.MEDIA_TYPE_PICTURE,
                correctOrientation:cameraOptions.correctOrientation!=undefined?cameraOptions.correctOrientation:true
            };
            this._camera.getPicture(function(data)
            {
                console.log("SUCCESS");
                if(callback)
                {
                    callback(null, data);
                }
            }, function(error)
            {
                if(callback)
                    callback(error);
                console.log("FAILED");
            },options);
        }
    }
    /**
     * Camera manager
     * @type Camera
     */
    export var CameraManager:_CameraManager = ghost.core.Hardware.isBrowser()?new _CameraManager():null;
}