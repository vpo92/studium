<h3>Rechercher une fiche par mot clé</h3>

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
        $viewLink =  $ficheService->getFicheUrl($fiche);
        $status = getPropertieValue($fiche->identity->status);
        $description = getPropertieValue($fiche->identity->shortDescription);
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

<?php
$pageScripts .='<script src="https://cdn.datatables.net/1.10.19/js/jquery.dataTables.min.js"></script>';
$pageScripts .='<script src="https://cdn.datatables.net/1.10.19/js/dataTables.bootstrap4.min.js"></script>';


$pageScripts .='<script src="https://cdn.datatables.net/buttons/1.5.6/js/dataTables.buttons.min.js"></script>';
$pageScripts .='<script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.1.3/jszip.min.js"></script>';
$pageScripts .='<script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.53/pdfmake.min.js"></script>';
$pageScripts .='<script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.53/vfs_fonts.js"></script>';
$pageScripts .='<script src="https://cdn.datatables.net/buttons/1.5.6/js/buttons.html5.min.js"></script>';


$pageScripts .='<script src="'.getResourcesWebDirectory().'/js/recherche.js"></script>';

 ?>
