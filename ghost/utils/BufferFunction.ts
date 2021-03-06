
//convert-files
import {MFunction} from "./MFunction";

  
    export interface BufferFunction extends Function {
        waiting: boolean;
        delay: number;
        isWaiting(): void;
        cancel(): void;
        pause(): void;
        resume(): void;
        delayed(customDelay: number, ...args): void;
        now(): void;
        getTimeRemaining(): number;
    }
