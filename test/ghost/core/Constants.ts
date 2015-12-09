namespace ghost
{
    import CoreObject = ghost.core.CoreObject;
    export class _Constant
    {
        public debug:boolean = true;
        public cordovaEmulated:boolean = false;
    }

    export var constants:_Constant = new _Constant();
}