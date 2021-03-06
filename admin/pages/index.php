<h3>Index alphabétique</h3>

<?php
if(isAuthenticated()){?>
    <a href="<?php echo getApplicationUrl()?>?action=prepare-create" class="btn btn-primary">Créer une nouvelle fiche</a>
<?php } ?>

<ul class="nav nav-tabs">
    <?php for($i = 65; $i < (65+26); $i++){
        $c = chr($i);
        $link = getApplicationUrl()."?action=index&letter=$c";
        $active = isset($letter) && $letter == $c ?"active":"";
        ?>
        <li class="nav-item">
            <?php echo "<a class=\"nav-link $active\" href=\"$link \" >$c</a>" ?>
        </li>
    <?php } ?>
</ul>

<?php
if($liste){?>
    <div class="container app-index-result">
        <div class="row">
            <?php

            foreach ($liste as $fiche) {?>
                <div class="col">
                    <div class="card" style="width: 12rem;height:100%">
                        <div class="card-body">
                            <h5 class="card-title">
                                <a href="<?php echo $ficheService->getFicheUrl($fiche) ?>"><?php echo $fiche->reference ?> - <?php echo $ficheService->getFicheTitle($fiche) ?></a>
                            </h5>
                        </div>
                    </div>
                </div>
           <?php } ?>
        </div>
    </div>
<?php }else{
    echo "<h4>Aucun résultat</h4>";
}
?>