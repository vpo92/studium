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
        if (is_object($string)) {
            if (method_exists($string, '__toString')) {
                $string = (string)$string;
            } elseif ($string instanceof Throwable) {
                $string = $string->getMessage() . "\n" . $string->getTraceAsString();
            } else {
                $string = print_r($string, true);
            }
        } elseif (is_array($string)) {
            $string = print_r($string, true);
        } elseif (!is_string($string)) {
            $string = var_export($string, true);
        }
        $t = explode("\n", $string);
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