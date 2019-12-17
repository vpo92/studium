<?php
 require "view/view_properties.php"
?>

<h3>Confirmer la suppression de la fiche <?php echo $reference ?> ?</h3>

<?php
$backLink = getApplicationUrl()."?action=view&reference=$reference";
if(isset($mode) && $mode == "SEARCH") {
    $backLink .= "&mode=SEARCH&keyword=$keyword";
}
$removeLink = getApplicationUrl()."?action=delete&reference=$reference&mode=$mode&letter=$letter&keyword=$keyword";

?>
<a href="<?php echo $backLink ?>" class="btn btn-secondary">
    Annuler
</a>
<?php if(isAuthenticated()){?>
<a href="<?php echo $removeLink?>" class="btn btn-danger">
    Supprimer la fiche
</a>
<?php }else{
    echo "Vous n'avez pas l'authorisation d'accéder à cette page";
} ?>
<br>
