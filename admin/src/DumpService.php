<?php
/**
 * Created by PhpStorm.
 * User: vincent
 * Date: 2019-06-07
 * Time: 07:50
 */


class DumpService
{

    private static $dumps = null;


    public static function listDumps(){
        if($dumps == null){
            $file = file_get_contents("./mock/dump.json");
            self::$dumps = json_decode($file);
        }
        return self::dumps;
    }

    public static function createDump(){
        
    }


}