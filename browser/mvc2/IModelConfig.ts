export interface IModelConfig
{
    /**
     * Loaded data will be sent to readExternal
     * default:true
     */
    readExternal?:boolean;
     /**
     * Load will be called immediatly (return instance of Promise instead of API2)
     * @default true
     */
    execute?:boolean;
    /**
     * Will mark path as loaded and will not attempt to reload them in the future
     * @default true
     */
    marksPathAsLoaded?:boolean;
    /**
     * Will shortcircuit path loading mechanism and reload data in any case.
     * If execute = false and ignorePathLoadState = false the loading mechanisme is bypassed
     * @default false
     */
    ignorePathLoadState?:boolean;
    /**
     * Call will be cached if failed 
     * @default false
     */
    always?:boolean;
}