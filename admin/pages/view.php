<h3>Fiche <?php echo $fiche->reference ?></h3>

<?php
$name = is_object($fiche->identity->name)?$fiche->identity->name->value:$fiche->identity->name[0]->value;
?>
<a href="index.php?action=index&letter=<?php echo $name[0] ?>" class="btn btn-secondary">
    Retourner à l'index
</a>

<a href="index.php?action=prepare-edit&reference=<?php echo $fiche->reference ?>" class="btn btn-primary">
    Modifier la fiche
</a>


<ul class="list-group app-view-list">
    <?php
    foreach($fiche->raw as $r){
        echo "<li class=\"list-group-item\">$r</li>";
    } ?>
</ul>


