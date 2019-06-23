<?php
/**
 * Created by PhpStorm.
 * User: vincent
 * Date: 2019-06-20
 * Time: 08:58
 */

function drawData($data){

}

function drawProperties($prop){
    foreach($prop as $k => $v){
        echo "<li><b>".MessageUtils::getMessage('fr',$k).":</b> ";
        if(is_object($v)){

            echo $v->value;



            //If multiple value
        }else if(is_array($v)){
            echo "<ul>";
            foreach($v as $item){
                echo "<li>$item->value</li>";
            }
            echo "</ul>";
        }
        echo "</li>";
        //drawBlock($v);
    }
}

function drawBlock($name,$block){

    echo "<h5>".MessageUtils::getMessage('fr',$name)."</h5>";
    if(is_object($block)){
        echo "<ul>";
        drawProperties($block);
        echo "</ul>";
    }

}

function drawFiche($fiche){
    echo "<ul>";
    foreach($fiche as $k => $v){
        if (!in_array( $k, array("_id","reference","title","link","raw"))) {
            drawBlock($k, $v);
        }
    }
    echo "</ul>";
}