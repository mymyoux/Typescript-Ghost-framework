//convert
 /* ghost.events.Eventer.*/
import {Eventer} from "ghost/events/Eventer";
//convert
 /* ghost.constants.*/
import {constants} from "ghost/core/Constants";
//convert
 /*(ghost.core.Hardware.*/
import {Hardware} from "ghost/core/Hardware";
//convert
 /*!ghost.core.Root.*/
import {Root} from "ghost/core/Root";
///<reference path="../../ghost/core/core.class.d.ts"/>


    //TODO:remove this as it has been integrated into Eventer
    //simulate cordova for non phonegap projet
    if(Hardware.isBrowser())
    {
        if(!Root.getRoot().cordova)
        {
            console.log("False Cordova is Ready");
            Eventer._triggerDeviceReady();
            constants.cordovaEmulated = true;
        }
        else
        {
            //emulator
            if(Root.getRoot().location.href.indexOf("file://")==-1 || Root.getRoot().location.href.indexOf("ripple")>-1 || Root.getRoot().location.href.indexOf("local")>-1)
            {
                constants.cordovaEmulated = true;
                console.log("Cordova['emulated'] is Ready");
                
                if(Root.getRoot().location.href.indexOf("ripple")==-1)
                {
                    Eventer._triggerDeviceReady();
                }
            }
        }
    }
  

