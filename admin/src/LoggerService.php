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
        $t = explode("\n",$string);
        for($i = 0; $i < sizeof($t);$i++){
            $this->applicationLog[] = $t[$i];
        }
    }

    function generateJSConsoleOutput(){
        echo "<script>\n";
        foreach ($this->applicationLog as $log){
            echo "console.log('### Backend says ### ".addslashes($log)."');\n";
        }
        echo "</script>";
    }

}