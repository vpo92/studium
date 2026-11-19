<?php
$GLOBALS['msSrv'] = $manuscritService;
include "view/view_properties.php"
?>

<h3><?php if(isset($action) && $action == "view-draft"){ echo "BROUILLON - "; }?>Fiche <?php echo htmlspecialchars($fiche->reference, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') ?> - <?php echo htmlspecialchars($fiche->title, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') ?></h3>
<h6>permalien : <a href="<?php echo htmlspecialchars(getApplicationUrl().$fiche->link, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') ?>"><?php echo htmlspecialchars(getApplicationUrl().$fiche->link, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') ?></a></h6>

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
$pageScripts .='<script src="https://cdn.jsdelivr.net/npm/cytoscape@3.35.0/dist/cytoscape.min.js"></script>';
$pageScripts .='<script src="'.getResourcesWebDirectory().'/js/view.js"></script>';



?>
<a href="<?php echo $backLink ?>" class="btn btn-secondary">
    Retourner à la liste
</a>
<a href="<?php echo getPublicAPIUrl()?>/prosopography/<?php echo $fiche->reference ?>" class="btn btn-success" target="_blank">
    Voir la fiche au format JSON
</a>
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
<?php if($action != "view-draft"){?>
<form method="post" action="<?php echo getApplicationUrl()?>" class="d-inline">
    <input type="hidden" name="action" value="re-index">
    <input type="hidden" name="reference" value="<?php echo htmlspecialchars($fiche->reference, ENT_QUOTES, 'UTF-8'); ?>">
    <?php if(isset($mode)){ ?>
    <input type="hidden" name="mode" value="<?php echo htmlspecialchars($mode, ENT_QUOTES, 'UTF-8'); ?>">
    <?php } ?>
    <?php if(isset($keyword)){ ?>
    <input type="hidden" name="keyword" value="<?php echo htmlspecialchars($keyword, ENT_QUOTES, 'UTF-8'); ?>">
    <?php } ?>
    <button type="submit" class="btn btn-warning" onclick="return confirm('Réindexer la fiche <?php echo htmlspecialchars($fiche->reference, ENT_QUOTES, 'UTF-8'); ?> à partir du format brut ?');">
        Re-index
    </button>
</form>
<?php } ?>
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
                <li class="nav-item">
                    <a class="nav-link" id="graph-tab" data-toggle="tab" href="#graph" role="tab" aria-controls="graph" aria-selected="false">Graphe</a>
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
                <div class="tab-pane fade" id="graph" role="tabpanel" aria-labelledby="graph-tab">
                    <div class="app-graph-toolbar">
                        <span class="app-graph-hint">Graphe Neo4j de la fiche (relations directes).</span>
                        <span class="app-graph-actions">
                            <button type="button" class="btn btn-sm btn-outline-secondary" id="prosopography-graph-fit" disabled>Recentrer</button>
                            <button type="button" class="btn btn-sm btn-outline-primary" id="prosopography-graph-reload">Recharger</button>
                        </span>
                    </div>
                    <div class="alert alert-info" id="prosopography-graph-status" role="status">
                        Le graphe sera chargé à l'ouverture de cet onglet.
                    </div>
                    <div id="prosopography-graph" data-reference="<?php echo htmlspecialchars($fiche->reference, ENT_QUOTES, 'UTF-8'); ?>"></div>
                    <div class="app-graph-legend" id="prosopography-graph-legend"></div>
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
