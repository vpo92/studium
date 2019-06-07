<h3>Fiche <?php echo $fiche->reference ?></h3>

<?php
$name = is_object($fiche->identity->name)?$fiche->identity->name->value:$fiche->identity->name[0]->value;

$backLink = getApplicationUrl()."?action=index&letter=$name[0]";
if(isset($mode) && $mode == "SEARCH") {
    $backLink = getApplicationUrl()."?action=search&keyword=$keyword";
}
?>
<a href="<?php echo $backLink ?>" class="btn btn-secondary">
    Retourner à la liste
</a>
<?php
if(isAuthenticated()){?>
    <a href="<?php echo getApplicationUrl()?>?action=prepare-edit&reference=<?php echo $fiche->reference ?>" class="btn btn-primary">
        Modifier la fiche
    </a>
<?php } ?>

<ul class="list-group app-view-list">
    <?php
    foreach($fiche->raw as $r){
        echo "<li class=\"list-group-item\">".htmlspecialchars($r)."</li>";
    } ?>
</ul>


