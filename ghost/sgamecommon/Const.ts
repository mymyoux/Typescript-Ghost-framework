namespace ghost.sgamecommon
{
    export class Const
    {
        public static MSG_APPLICATION:string = "application_msg";
        public static MSG_APPLICATION_INTERNAL:string = "application_msg_internal";
        public static MSG_APPLICATION_IN:string = "application_in";
        public static MSG_APPLICATION_OUT:string = "application_out";


        public static LOGIN_APP:string = "LOGINAPP";
        public static LOGIN_COMMAND:string = "login";

        public static APPLICATION_COMMAND_ENTER_ROOM:string = "enter_room";
        public static APPLICATION_COMMAND_LEAVE_ROOM:string = "leave_room";

        public static ROOM_COMMAND_USER_ENTER = "room_user_enter";
        public static ROOM_COMMAND_USER_MESSAGE = "room_user_message";
        public static ROOM_COMMAND_USER_LEAVE = "room_user_leave";
        public static ROOM_COMMAND_USER_DATA = "room_user_data";

        public static ALL_APP:string = "*all";
        public static ROOM_VISIBILITY_PUBLIC:string = "public";
        public static ROOM_VISIBILITY_PRIVATE:string = "private";


        public static ERROR_LOGIN:string = "error_login_failed";
        public static ERROR_NEED_LOGIN:string = "error_need_login";
        public static ERROR_BAD_FORMAT:string = "error_bad_format";
        public static ERROR_ROOM_NEED_ENTER:string = "error_room_need_enter";
        public static ERROR_ROOM_RECIPIENT_UNKNOWN:string = "error_room_recipient_unknown";
        public static ERROR_ROOM_ENTER_FAILED:string = "error_bad_room_enter";
        public static ERROR_NEED_APPLICATION_ENTER:string = "error_need_application_enter";

 
        public static USER_CLASS_CHANGE:string = "user_class_change";
        public static USER_DISCONNECTED:string = "user_disconnected";

        public static USER_CUSTOM_VAR:string = "set_user_custom_var"; 
    }
}
