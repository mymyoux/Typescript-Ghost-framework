///<reference path="../../ghost/core/core.class.d.ts"/>
namespace ghost.phonegap
{

    //TODO:remove this as it has been integrated into Eventer
    //simulate cordova for non phonegap projet
    if(ghost.core.Hardware.isBrowser())
    {
        if(!ghost.core.Root.getRoot().cordova)
        {
            console.log("False Cordova is Ready");
            ghost.events.Eventer._triggerDeviceReady();
            ghost.constants.cordovaEmulated = true;
        }
        else
        {
            //emulator
            if(ghost.core.Root.getRoot().location.href.indexOf("file://")==-1 || ghost.core.Root.getRoot().location.href.indexOf("ripple")>-1 || ghost.core.Root.getRoot().location.href.indexOf("local")>-1)
            {
                ghost.constants.cordovaEmulated = true;
                console.log("Cordova['emulated'] is Ready");
                
                if(ghost.core.Root.getRoot().location.href.indexOf("ripple")==-1)
                {
                    ghost.events.Eventer._triggerDeviceReady();
                }
            }
        }
    }
  

}
