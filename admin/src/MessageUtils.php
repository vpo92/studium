<?php
/**
 * Created by PhpStorm.
 * User: vincent
 * Date: 2019-06-21
 * Time: 08:51
 */

class MessageUtils
{

    private static $messages = null;


    private static function loadMessage(){
        $file = file_get_contents("./resources/messages.json");
        self::$messages = json_decode($file);
    }

    public static function getMessage($locale,$message){
        if(self::$messages == null){
            self::loadMessage();
        }

        if(!isset(self::$messages->{$locale})){
            $locale = 'fr';
        }
        $msg = self::$messages->{$locale};
        $m = $message;
        if(isset($msg->{$message})){
            $m = $msg->{$message};
        }
        return $m;
    }

}