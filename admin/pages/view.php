<?php
$GLOBALS['msSrv'] = $manuscritService;
include "view/view_properties.php"
?>

<h3><?php if(isset($action) && $action == "view-draft"){ echo "BROUILLON - "; }?>Fiche <?php echo $fiche->reference ?> - <?php echo $fiche->title ?></h3>
<h6>permalien : <a href="<?php echo getApplicationUrl().$fiche->link ?>"><?php echo getApplicationUrl().$fiche->link ?></a></h6>

<?php


$name = is_object($fiche->identity->name)?$fiche->identity->name->value:$fiche->identity->name[0]->value;

$backLink = getApplicationUrl()."?action=index&letter=$name[0]";
if(isset($mode) && $mode == "SEARCH") {
    $backLink = getApplicationUrl()."?action=search&keyword=$keyword";
}else if(isset($mode) && $mode == "FULLSEARCH") {
    $backLink = getApplicationUrl()."?page=recherche-avancee";
}else if(isset($mode) && $mode == "DRAFTLIST") {
    $backLink = getApplicationUrl()."?page=draft";
}
$keyword= isset($keyword)?$keyword:"";
$removeRedirect = "&mode=$mode&letter=$name[0]&keyword=$keyword";


//$pageCSS .='';


$pageScripts .='<script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js" integrity="sha512-XQoYMqMTK8LvdxXYG3nZ448hOEQiglfqkJs1NOQV44cWnUrBc8PkAOcXy20w0vlaXaVUearIOBhiXZ5V3ynxwA==" crossorigin=""></script>';
$pageScripts .='<script src="'.getResourcesWebDirectory().'/js/view.js"></script>';



?>
<a href="<?php echo $backLink ?>" class="btn btn-secondary">
    Retourner à la liste
</a>
<!--
<a href="<?php echo getPublicAPIUrl()?>/prosopography/<?php echo $fiche->reference ?>" class="btn btn-success" target="_blank">
    Voir la fiche au format JSON
</a>
-->
<?php
if(isAuthenticated()){?>
<?php if($action != "view-draft"){?>
<a href="<?php echo getApplicationUrl()?>?action=view-draft&reference=<?php echo $fiche->reference ?>" class="btn btn-success">
    Voir le brouillon
</a>
<?php }else{ ?>
<a href="<?php echo getApplicationUrl()?>?action=view&reference=<?php echo $fiche->reference ?>" class="btn btn-success">
    Retour à la fiche public
</a>
<?php    } ?>
<a href="<?php echo getApplicationUrl()?>?action=prepare-edit&reference=<?php echo $fiche->reference ?>" class="btn btn-primary">
    Modifier la fiche
</a>
<?php if(isAdmin()){?>
<a href="<?php echo getApplicationUrl()?>?action=prepare-delete&reference=<?php echo $fiche->reference ?>&redirect=<?php echo $removeRedirect?>" class="btn btn-danger">
    Supprimer la fiche
</a>
<?php }
} ?>

<br>
<br>

<div class="container">
    <div class="row">
        <div class="col-sm">
            <h5>Informations prosopographiques</h5>
            <ul class="nav nav-tabs" id="myTab" role="tablist">
                <li class="nav-item">
                    <a class="nav-link active" id="home-tab" data-toggle="tab" href="#home" role="tab" aria-controls="home" aria-selected="true">Fiche</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" id="profile-tab" data-toggle="tab" href="#profile" role="tab" aria-controls="profile" aria-selected="false">Format brut</a>
                </li>
            </ul>
            <div class="tab-content" id="myTabContent">
                <div class=" tab-pane fade show active" id="home" role="tabpanel" aria-labelledby="home-tab">
                    <?php
                    drawFiche($fiche);
                    ?>
                </div>
                <div class="tab-pane fade" id="profile" role="tabpanel" aria-labelledby="profile-tab">
                    <ul class="list-group app-view-list">
                        <?php
                        foreach($fiche->raw as $r){
                            echo "<li class=\"list-group-item\">".htmlspecialchars($r)."</li>";
                        } ?>
                    </ul>
                </div>
            </div>
        </div>
        <div class="col-sm" id="visuGeo">
            <h5>Visualisation géographique</h5>
            <div id="map">
                <!-- Ici s'affichera la carte -->
            </div>
        </div>
    </div>

</div>
