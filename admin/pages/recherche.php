<h3>Rechercher une fiche par mot clé</h3>

<div class="tab-content" id="myTabContent">
    <div class="tab-pane fade show active" id="home" role="tabpanel" aria-labelledby="home-tab">
        <br>
        <form action="<?php echo getApplicationUrl()?>/index.php" method="GET">
            <input type="hidden" name="action" value="search" />
            <div class="input-group input-group-lg">
                <input class="form-group" type="text" name="keyword" size="50" value="<?php echo isset($keyword)?$keyword:"" ?>"/>
                <button name="saveChange" type="submit" class="btn btn-primary input-group-text">Rechercher</button>
            </div>
        </form>
        <br/>

        <?php
        if(isset($result)) {
            if ( $totalCount> 0){
                echo "<h4>$totalCount Résultat(s) pour le mot clé '$keyword'</h4>";
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
                    if(isset($fiche->identity->status)){
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
            ?>
            </tbody>
            <?php
            if($totalCount > 0){?>
                <tfoot>
                <span> Page : </span>
                <!-- PAGE -->
                <?php
                $nbPage = $totalCount/$rows;
                if($nbPage < 10){
                    for($i=1;$i<$nbPage+1;$i++){?>
                        <form action="<?php echo getApplicationUrl()?>/index.php" method="GET">
                            <input type="hidden" name="action" value="search" />
                            <input type="hidden" name="currentPage" value="<?php echo $i?>" />
                            <input type="hidden" name="rows" value="<?php echo $rows?>" />
                            <input type="hidden" name="keyword" value="<?php echo isset($keyword)?$keyword:"" ?>"/>
                            <button type="submit" class="btn btn-primary"><?php echo $i?></button>
                        </form>
                        <?php
                    }
                }else{
                    // SELECT(0-nbPage)?>
                    <form action="<?php echo getApplicationUrl()?>/index.php" method="GET">
                        <input type="hidden" name="action" value="search" />
                        <input type="hidden" name="rows" value="<?php echo $rows?>" />
                        <input type="hidden" name="keyword" value="<?php echo isset($keyword)?$keyword:"" ?>"/>
                        <select name="currentPage" onchange="this.form.submit()">
                            <?php
                            for($i=1;$i<$nbPage+1;$i++){?>
                                <option value="<?php echo $i?>"  <?php echo $currentPage==$i?"selected":""?>><?php echo $i?></option>
                                <?php
                            }
                            ?>>
                        </select>
                    </form>
                    <?php
                }
                ?>
                <!-- NB ROWS -->
                <span> Nombre d'enregistrements par page : </span>
                <form action="<?php echo getApplicationUrl()?>/index.php" method="GET">
                    <input type="hidden" name="action" value="search" />
                    <input type="hidden" name="currentPage" value="<?php echo isset($currentPage)?$currentPage:"" ?>" />
                    <input type="hidden" name="keyword" value="<?php echo isset($keyword)?$keyword:"" ?>"/>
                    <select name="rows" onchange="this.form.submit()">
                        <option value="5"  <?php echo $rows==5?"selected":""?>>5</option>
                        <option value="10"  <?php echo $rows==10?"selected":""?>>10</option>
                        <option value="20"  <?php echo $rows==20?"selected":""?>>20</option>
                        <option value="50"  <?php echo $rows==50?"selected":""?>>50</option>
                        <option value="100" <?php echo $rows==100?"selected":""?>>100</option>
                    </select>
                </form>
                </tfoot>

                <a href="<?php echo getPublicAPIUrl()."/prosopography/search/$keyword?format=csv"?>" class="btn btn-primary" target="_blank">Export CSV</a>
                <a href="<?php echo getPublicAPIUrl()."/prosopography/search/$keyword?format=txt"?>" class="btn btn-primary" target="_blank">Export TXT</a>
                <!--
                <a href="<?php echo getPublicAPIUrl()."/prosopography/search/$keyword?format=xls"?>" class="btn btn-primary" target="_blank">Export Excel</a>
                <a href="<?php echo getPublicAPIUrl()."/prosopography/search/$keyword?format=pdf"?>" class="btn btn-primary" target="_blank">Export PDF</a>
                -->
                <?php
            }
            ?>
            </table>
        <?php }?>
    </div>
</div>
