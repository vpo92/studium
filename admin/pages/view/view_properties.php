<?php
/**
 * Created by PhpStorm.
 * User: vincent
 * Date: 2019-06-20
 * Time: 08:58
 */
$GLOBALS['globalOpusList'] = [];

/**
 * Normalise une valeur en tableau, afin de pouvoir parcourir aussi bien
 * une valeur unique qu'une liste de valeurs.
 */
function asList($value){
    if($value === null){
        return [];
    }
    return is_array($value) ? $value : [$value];
}

/**
 * Transforme une valeur (chaîne, objet {value/data}, liste) en texte affichable.
 */
function valueToText($v){
    if(is_object($v)){
        if(isset($v->value)){
            return valueToText($v->value);
        }
        if(isset($v->data)){
            return valueToText($v->data);
        }
        return '';
    }
    if(is_array($v)){
        $parts = [];
        foreach($v as $part){
            $text = valueToText($part);
            if($text !== ''){
                $parts[] = $text;
            }
        }
        return implode(', ', $parts);
    }
    if($v === null){
        return '';
    }
    return preg_replace("/[$&:£*%]/","",(string)$v);
}

/**
 * Affiche les commentaires d'une valeur.
 * Les <li> sont destinés à être placés dans la liste .app-annotations
 * de la valeur concernée.
 */
function drawComment($comList){
    foreach(asList($comList) as $com){
        $text = valueToText($com);
        if($text === ''){
            continue;
        }
        echo "<li class=\"app-comment\">Commentaire : ".$text."</li>";
    }
}

/**
 * Affiche les références d'une valeur.
 * Les <li> sont destinés à être placés dans la liste .app-annotations
 * de la valeur concernée.
 */
function drawReference($refList){
    foreach(asList($refList) as $ref){
        $text = valueToText($ref);
        if($text === ''){
            continue;
        }
        echo "<li class=\"app-reference\">Référence : ".$text."</li>";
    }
}

/**
 * Affiche les commentaires et références rattachés à une valeur.
 * Le bloc est imbriqué dans le <li class="app-value-item"> de la valeur,
 * ce qui garantit qu'il reste visuellement et structurellement avec elle.
 */
function drawAnnotations($item){
    if(!is_object($item)){
        return;
    }

    $references = isset($item->reference) ? asList($item->reference) : [];
    $comments = isset($item->comment) ? asList($item->comment) : [];

    if(count($references) === 0 && count($comments) === 0){
        return;
    }

    echo "<ul class=\"app-annotations\">";
    drawReference($references);
    drawComment($comments);
    echo "</ul>";
}

function drawOpus($opusList){
    $opusList = asList($opusList);
    if(count($opusList) === 0){
        return;
    }

    $id = uniqid();
    $i = 0;
    echo "<ul class=\"app-opus-list\">";
    foreach($opusList as $opus){
        if(!is_object($opus)){
            continue;
        }

        $mainTitle = isset($opus->mainTitle) ? $opus->mainTitle : '';
        echo "<li>";
        echo "<a class=\"app-opusCollapseLink\" data-toggle=\"collapse\" href=\"#collapseOpus$id$i\">".$mainTitle."</a>";
        echo "<div id=\"collapseOpus$id$i\" class=\"collapse\">";
        echo "<ul>";
        drawProperties($opus);
        //Version
        if(isset($opus->versions)){
            echo "<li class=\"app-versions\">";
            drawVersion($opus->versions);
            echo "</li>";
        }

        echo "</ul>";
        echo "</div>";
        echo "</li>";
        $i++;
    }
    echo "</ul>";
}


function drawVersion($versionList){
    $versionList = asList($versionList);
    if(count($versionList) === 0){
        return;
    }

    $id = uniqid();
    $i = 1;
    echo "<ul class=\"app-version-list\">";
    foreach($versionList as $version){
        if(!is_object($version)){
            continue;
        }

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

/**
 * Affiche une valeur et, à l'intérieur de son propre <li>, ses opus,
 * ses références puis ses commentaires.
 */
function drawValue($item){
    echo "<li class=\"app-value-item\">";

    if(is_object($item)){
        echo "<span class=\"app-value\">".valueToText(isset($item->value) ? $item->value : $item)."</span>";

        //OPUS
        if(isset($item->opus)){
            drawOpus($item->opus);
        }

        //REFERENCE + COMMENTAIRE
        drawAnnotations($item);
    }else{
        echo "<span class=\"app-value\">".valueToText($item)."</span>";
    }

    echo "</li>";
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
    if(is_object($prop)){
        $prop = get_object_vars($prop);
    }
    if(!is_array($prop)){
        return;
    }

    foreach($prop as $k => $v){
        if($k === "mainTitle" || $k === "versions"){
            continue;
        }

        if($k === "manuscrits"){
            foreach(asList($v) as $item){
                if(is_object($item)){
                    $GLOBALS['globalOpusList'][] = $item;
                }
            }
        }

        echo "<li class=\"app-property\">";
        echo "<b>".MessageUtils::getMessage('fr',$k).":</b> ";

        if(is_object($v)){
            echo "<ul class=\"app-values\">";
            drawValue($v);
            echo "</ul>";
        }else if(is_array($v)){
            echo "<ul class=\"app-values\">";
            foreach($v as $item){
                drawValue($item);
            }
            echo "</ul>";
        }else{
            echo "<ul class=\"app-values\"><li class=\"app-value-item\"><span class=\"app-value\">".valueToText($v)."</span></li></ul>";
        }

        echo "</li>";
    }
}

function drawChapter($name,$block){
    echo "<h6>".MessageUtils::getMessage('fr',$name)."</h6>";
    if(is_object($block) || is_array($block)){
        echo "<ul class=\"app-properties\">";
        drawProperties($block);
        echo "</ul>";
    }
}

function drawFiche($fiche){
    echo "<div class=\"app-fiche\">";
    foreach($fiche as $k => $v){
        if (!in_array( $k, array("_id","reference","title","link","raw","extras"))) {
            drawChapter($k, $v);
        }
    }
    echo "</div>";

    $srv = $GLOBALS['msSrv'];

    echo "<script type='application/javascript'>";
    echo "var globalOpusList = [];";
    foreach($GLOBALS['globalOpusList'] as $k => $v){
        if(isset($v->meta) && isset($v->meta->id)){
            $m = $srv->findById($v->meta->id);
            $s = json_encode($m);
            echo "globalOpusList.push(".$s.");";
        }

    }
    echo "</script>";

    $GLOBALS['msSrv'] = null;

}
