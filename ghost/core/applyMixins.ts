
//convert-files
import {Root} from "./Root";

    export function applyMixins(derivedCtor: any, baseCtors: any[], config: any = null) {
        if (!derivedCtor || !baseCtors) {
            return;
        }
        if (derivedCtor.prototype && typeof derivedCtor == "function") {
            baseCtors.forEach(baseCtor => {

                if (baseCtor.prototype.applyMixin) {
                    baseCtor.prototype.applyMixin(derivedCtor.prototype, config);
                } else {
                    Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
                        derivedCtor.prototype[name] = baseCtor.prototype[name];
                    });
                }
            });
        } else {
            baseCtors.forEach(baseCtor => {
                if (baseCtor.prototype.applyMixin) {
                    baseCtor.prototype.applyMixin(derivedCtor, config);
                } else {
                    Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
                        derivedCtor[name] = baseCtor.prototype[name];
                    });
                }
            });
        }
    }
    var root: any = Root.getRoot();
    root['applyMixins'] = applyMixins;
