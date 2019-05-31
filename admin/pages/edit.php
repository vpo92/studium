<?php
$targetAction = $mode == "EDIT"?"process-edit":"process-create";
?>
<h3>Fiche <?php echo $mode == "EDIT"?$fiche->reference:"" ?> </h3>

<form action="<?php echo getApplicationUrl()?>/index.php" method="POST">
    <div class="form-group">
        <?php if($mode == "EDIT"){?>
            <a href="<?php echo getApplicationUrl()?>?action=view&reference=<?php echo $fiche->reference ?>" class="btn btn-secondary">Annuler</a>
        <?php }else{?>
            <a href="<?php echo getApplicationUrl()?>?action=index&letter=A" class="btn btn-secondary">Annuler</a>
        <?php }?>
        <button name="saveChange" type="submit" class="btn btn-primary">Enregistrer</button>
    </div>
    <input type="hidden" name="reference" value="<?php echo $fiche->reference ?>" />
    <input type="hidden" name="action" value="<?php echo $targetAction ?>" />
    <div class="form-group">
        <textarea name="raw" cols="100" rows="30" placeholder="Copier la fiche ici"><?php
            foreach ($fiche->raw as $r)
                echo "$r\n";
            ?></textarea>
    </div>

</form>
