<?php
/**
 * Created by PhpStorm.
 * User: vincent
 * Date: 2019-06-20
 * Time: 08:58
 */

function drawComment($comList){
    //echo "<ul>";
    foreach($comList as $com){
        echo "<li class=\"app-comment\">Commentaire : ".$com."</li>";
    }
    //echo "</ul>";
}

function drawReference($refList){
    //echo "<ul>";
    foreach($refList as $ref){
        echo "<li class=\"app-reference\">Référence : $ref</li>";
    }
    //echo "</ul>";
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
        drawProperties($opus);
        //Version
        if(isset($opus->versions)){
            drawVersion($opus->versions);
        }

        echo "</ul>";
        echo "</div>";
        echo "</li>";
        $i++;
    }
    echo "</ul>";
}


function drawVersion($versionList){
    $id = uniqid();
    $i = 1;
    echo "<ul>";
    foreach($versionList as $version){
        echo "<li>";
        echo "<a class=\"app-versionCollapseLink\" data-toggle=\"collapse\" href=\"#collapseVersion$id$i\">Autre version ".$i."</a>";
        echo "<div id=\"collapseVersion$id$i\" class=\"collapse\">";
        echo "<ul>";
        drawProperties($version);
        echo "</ul>";
        echo "</div>";
        echo "</li>";
        $i++;
    }
    echo "</ul>";
}

function drawValue($item){
    echo "<li class=\"app-value\">".valueToText($item->value)."</li>";
    /**
    if(isset($item->meta->names)){
        drawNames($item->meta->names);
    }
    if(isset($item->meta->dates)){
        drawDates($item->meta->dates);
    }
    if(isset($item->meta->places)){
        drawPlaces($item->meta->places);
    }
    if(isset($item->meta->titles)){
        drawTitles($item->meta->titles);
    }
    if(isset($item->meta->institutions)){
        drawInstitutions($item->meta->institutions);
    }
    if(isset($item->meta->manuscrit)){
        drawMS($item->meta->manuscrit);
    }
     */
}

function valueToText($v){
    return preg_replace("/[$&:£*%]/","",$v);
}

function dateToText($d){
    switch($d->type){
        case "SIMPLE":{
            return $d->date;
        }
        case "AFTER":{
            return ">".$d->date;
        }
        case "BEFORE":{
            return "<".$d->date;
        }
        case "NEAR":{
            return "~".$d->date;
        }
        case "INTERVAL":{
            return dateToText($d->startDate)." - ".dateToText($d->endDate);
        }
    }
}

function drawDates($dates){
    foreach($dates as $d){
        echo "<li style=\"list-style:none\"><i class=\"fas fa-calendar\"></i> ";
        echo dateToText($d);
        echo "</li>";
    }
}

function drawPlaces($places){
    foreach($places as $p){
        echo "<li style=\"list-style:none\"><i class=\"fas fa-map-marker-alt\"></i> $p</li>";
    }
}

function drawNames($names){
    foreach($names as $n){
        echo "<li style=\"list-style:none\"><i class=\"fas fa-tag\"></i> $n</li>";
    }
}

function drawTitles($titles){
    foreach($titles as $t){
        echo "<li style=\"list-style:none\"><i class=\"fas fa-heading\"></i> $t</li>";
    }
}

function drawInstitutions($institutions){
    foreach($institutions as $i){
        echo "<li style=\"list-style:none\"><i class=\"fas fa-university\"></i> $i</li>";
    }
}

function drawMS($ms){
    echo "<li style=\"list-style:none\">";
    if(isset($ms->place)){
        echo "<i class=\"fas fa-map-marker-alt\"></i> ".$ms->place."&nbsp;";
    }
    if(isset($ms->placeType)){
        echo "<i class=\"fas fa-university\"></i> ".$ms->placeType."&nbsp;";
    }
    if(isset($ms->cote)){
        echo "<i class=\"fas fa-book\"></i> ".$ms->cote."&nbsp;";
    }
    if(isset($ms->page)){
        echo "<i class=\"fas fa-sticky-note\"></i> ".$ms->page."&nbsp;";
    }
    echo "</li>";
}

function drawProperties($prop){
    foreach($prop as $k => $v){
        if($k != "mainTitle" && $k != "versions"){
            echo "<li><b>".MessageUtils::getMessage('fr',$k).":</b> ";

            if(is_object($v)){

                drawValue($v);//echo $v->value;

                //OPUS
                if(isset($v->opus)){
                    drawOpus($v->opus);
                }

                //REFERENCE
                if(isset($v->reference)){
                    drawReference($v->reference);
                }

                //COMMENTAIRE
                if(isset($v->comment)){
                    drawComment($v->comment);
                }

                //If multiple value
            }else if(is_array($v)){
                echo "<ul>";
                foreach($v as $item){
                    //echo "<li>$item->value</li>";
                    drawValue($item);

                    //OPUS
                    if(isset($item->opus)){
                        drawOpus($item->opus);
                    }

                    //REFERENCE

                    if(isset($item->reference)){
                        drawReference($item->reference);
                    }

                    //COMMENTAIRE
                    if(isset($item->comment)){
                        drawComment($item->comment);
                    }
                }
                echo "</ul>";
            }
            echo "</li>";
        }

    }
}

function drawChapter($name,$block){

    echo "<h6>".MessageUtils::getMessage('fr',$name)."</h6>";
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
            drawChapter($k, $v);
        }
    }
    echo "</ul>";
}