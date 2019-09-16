<?php
/**
 * Created by PhpStorm.
 * User: vincent
 * Date: 2019-06-20
 * Time: 08:58
 */

function drawReference($refList){
    echo "<ul>";
    foreach($refList as $ref){
        echo "<li class=\"app-reference\">Référence : $ref</li>";
    }
    echo "</ul>";
}

function drawOpus($opusList){
    $id = uniqid();
    $i = 0;
    echo "<ul>";
    foreach($opusList as $opus){
        echo "<li>";
        echo "<a class=\"app-opusCollapseLink\" data-toggle=\"collapse\" href=\"#collapseOpus$id$i\">".$opus->mainTitle."</a>";
        echo "<div id=\"collapseOpus$id$i\" class=\"collapse\">";
        echo "<ul>";
        foreach($opus as $k => $v){
            drawProperties($opus);
            //echo "<li><b>".MessageUtils::getMessage('fr',$k).":</b> $v";
        }
        echo "</ul>";
        echo "</div>";
        echo "</li>";
        $i++;
    }
    echo "</ul>";
}


function drawProperties($prop){
    foreach($prop as $k => $v){
        echo "<li><b>".MessageUtils::getMessage('fr',$k).":</b> ";

        if(is_object($v)){

            echo $v->value;

            //REFERENCE
            if(isset($v->reference)){
                drawReference($v->reference);
            }


            //If multiple value
        }else if(is_array($v)){
            echo "<ul>";
            foreach($v as $item){
                echo "<li>$item->value</li>";

                //OPUS
                if(isset($item->opus)){
                    drawOpus($item->opus);
                }

                //REFERENCE

                if(isset($item->reference)){
                    drawReference($item->reference);
                }
            }
            echo "</ul>";
        }
        echo "</li>";
        //drawBlock($v);
    }
}

function drawBlock($name,$block){

    echo "<h5>".MessageUtils::getMessage('fr',$name)."</h5>";
    if(is_object($block) || is_array($block)){
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