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
<table class="table">
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
        $name = is_object($fiche->identity->name)?$fiche->identity->name->value:$fiche->identity->name[0]->value;
        $viewLink =  getApplicationUrl()."/individus/".$fiche->reference."-".str_replace(' ', '', $name)."&mode=SEARCH&keyword=$keyword";
        $status = getPropertieValue($fiche->identity->status);
        $description = getPropertieValue($fiche->identity->shortDescription);
        $link = getApplicationUrl()."?action=view&reference=".$fiche->reference."&mode=SEARCH&keyword=$keyword";
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

