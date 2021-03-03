<h3>Rechercher une fiche par mot clé</h3>

<div class="tab-content" id="myTabContent">
    <div class="tab-pane fade show active" id="home" role="tabpanel" aria-labelledby="home-tab">
        <br>
        <form action="<?php echo getApplicationUrl()?>/index.php" method="POST">
            <input type="hidden" name="action" value="search" />
            <div class="form-group">
                <input type="text" name="keyword" value="<?php echo isset($keyword)?$keyword:"" ?>"/>
            </div>
            <div class="form-group">
                <button name="saveChange" type="submit" class="btn btn-primary">Rechercher</button>
            </div>
        </form>


        <?php
        if(isset($result)) {
        $count =sizeof($result);
        if ( $count> 0){
        echo "<h4>$count Résultat(s) pour le mot clé '$keyword'</h4>";
        ?>
        <table class="table" id="resultTable">
            <thead>
            <tr>
                <th scope="col">Référence</th>
                <th scope="col">Nom</th>
                <th scope="col">Statut</th>
                <th scope="col">Description</th>
                <th scope="col">Action</th>
            </tr>
            </thead>
            <tbody>
            <?php
            foreach ($result as $fiche) {
                $name = $ficheService->getFicheTitle($fiche);
                $viewLink =  $ficheService->getFicheUrl($fiche)."?mode=SEARCH&keyword=$keyword";;

                $status = "";
                if(isset($fiche->identity->shortDescription)){
                    $status =  getPropertieValue($fiche->identity->status);
                }

                $description = "";
                if(isset($fiche->identity->shortDescription)){
                    $description = getPropertieValue($fiche->identity->shortDescription);
                }

                ?>
                <tr>
                    <th scope="row"><?php echo $fiche->reference ?></th>
                    <td><?php echo $name ?></td>
                    <td><?php echo $status ?></td>
                    <td><?php echo $description ?></td>
                    <td><a class="btn btn-primary"
                           href="<?php echo $viewLink ?>">voir la
                            fiche</a></td>
                </tr>
            <?php }
            }else{
                echo "<h4>Aucun résultat</h4>";
            }
            }?>
            </tbody>
        </table>
    </div>
</div>


<?php
$pageScripts .='<script type="text/javascript" src="https://cdn.datatables.net/v/dt/dt-1.10.21/datatables.min.js"></script>';
$pageScripts .='<script src="https://cdn.datatables.net/1.10.21/js/jquery.dataTables.min.js"></script>';
$pageScripts .='<script src="https://cdn.datatables.net/1.10.19/js/dataTables.bootstrap4.min.js"></script>';

$pageScripts .='<script src="https://cdn.datatables.net/buttons/1.6.2/js/dataTables.buttons.min.js"></script>';
$pageScripts .='<script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.1.3/jszip.min.js"></script>';
$pageScripts .='<script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.53/pdfmake.min.js"></script>';
$pageScripts .='<script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.53/vfs_fonts.js"></script>';
$pageScripts .='<script src="https://cdn.datatables.net/buttons/1.6.2/js/buttons.html5.min.js"></script>';
$pageScripts .='<script src="https://cdn.jsdelivr.net/npm/vue/dist/vue.js"></script>';
$pageScripts .='<script type="text/javascript" src="https://cdn.datatables.net/buttons/1.6.2/js/dataTables.buttons.js"></script>';
$pageScripts .='<script type="text/javascript" src="https://cdn.datatables.net/buttons/1.6.2/js/buttons.colVis.js"></script>';
//$pageScripts .='<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.9.3/Chart.min.js"></script>';
$pageScripts .='<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.9.3/Chart.bundle.min.js"></script>';
$pageScripts .='<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/renderjson@1.4.0/renderjson.min.js"></script>';
$pageScripts .='<script type="text/javascript" src="https://unpkg.com/leaflet.markercluster@1.4.1/dist/leaflet.markercluster.js"></script>';

$pageScripts .='<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/hammerjs@2.0.8"></script>';
$pageScripts .='<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/chartjs-plugin-zoom@0.7.7"></script>';
$pageScripts .='<script src="https://cdn.jsdelivr.net/npm/leaflet.markercluster.list@0.4.4/dist/leaflet-markercluster-list.js"></script>';


$pageScripts .='<script src="https://canvasjs.com/assets/script/canvasjs.min.js"></script>';
$pageScripts .='<script src="https://cdn.plot.ly/plotly-latest.min.js"></script>';

$pageScripts .='<script src="'.getResourcesWebDirectory().'/js/recherche.js"></script>';
//$pageScripts .='<script src="'.getResourcesWebDirectory().'/js/rechercheGraphe.js"></script>';
//$pageScripts .='<script src="'.getResourcesWebDirectory().'/js/rechercheavancee.js"></script>';
$pageScripts .='<script src="'.getResourcesWebDirectory().'/js/rechercheGeo.js"></script>';


?>
