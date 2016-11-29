///<reference path="../../ghost/core/core.class.d.ts"/>
///<module="framework/browser/services"/>
namespace ghost.phonegap
{
    import Env = ghost.services.Env;
    //TODO:remove this as it has been integrated into Eventer
    //simulate cordova for non phonegap projet
    if(ghost.core.Hardware.isBrowser())
    {
        if(!ROOT.cordova)
        {
            console.log("False Cordova is Ready");
            ghost.events.Eventer._triggerDeviceReady();
            ghost.constants.cordovaEmulated = true;
        }
        else
        {
            //emulator
            if(ROOT.location.href.indexOf("file://")==-1 || ROOT.location.href.indexOf("ripple")>-1 || Env.isLocal())
            {
                ghost.constants.cordovaEmulated = true;
                console.log("Cordova['emulated'] is Ready");
                
                if(ROOT.location.href.indexOf("ripple")==-1)
                {
                    ghost.events.Eventer._triggerDeviceReady();
                }
            }
        }
    }
  

}
