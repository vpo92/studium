<?php
/**
 * Created by PhpStorm.
 * User: vincent
 * Date: 2019-06-07
 * Time: 07:50
 */


class LoggerService
{

    private $applicationLog = [];


    function log($string){
        $this->applicationLog[] = $string;
    }

    function generateJSConsoleOutput(){
        echo "<script>";
        foreach ($this->applicationLog as $log){
            echo "console.log('##BACK## ".addslashes($log)."');";
        }
        echo "</script>";
    }

}