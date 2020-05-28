<h3>Rechercher une fiche par mot clé</h3>


<ul class="nav nav-tabs" id="myTab" role="tablist">
    <li class="nav-item">
        <a class="nav-link active" id="home-tab" data-toggle="tab" href="#home" role="tab" aria-controls="home" aria-selected="true">Recherche rapide</a>
    </li>
    <li class="nav-item">
        <a class="nav-link" id="profile-tab" data-toggle="tab" href="#profile" role="tab" aria-controls="profile" aria-selected="false">Recherche avancée</a>
    </li>
</ul>


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
    </div>
    <div class="tab-pane fade" id="profile" role="tabpanel" aria-labelledby="profile-tab">

        <br>
        <div id="app">

            <h5>Activité</h5>
            <div class="form-inline">
                <div class="form-group">
                    <label>Médianne d'activité entre</label>
                    <input type="number" v-model="searchRequest.activityMediane.from" placeholder="1100" step="100">
                    <label> et </label>
                    <input type="number" v-model="searchRequest.activityMediane.to" placeholder="1600" step="100">
                </div>

                <div class="form-group">
                    <label>Début d'activité :</label>
                    <input type="number" v-model="searchRequest.activity.from" step="100">
                </div>

                <div class="form-group">
                    <label>Fin d'activité :</label>
                    <input type="number" v-model="searchRequest.activity.to" step="100">
                </div>
            </div>

            <h5>Cursus</h5>
            <div class="form-inline">

                <div class="form-group">
                    <label>Statut :</label>
                    <select v-model="searchRequest.status">
                        <option v-for="option in statusList" v-bind:value="option.code" >{{ option.label }}</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Grade obtenu :</label>
                    <select v-model="searchRequest.grade">
                        <option v-for="option in gradeList" v-bind:value="option.code" >{{ option.label }}</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Discipline :</label>
                    <select v-model="searchRequest.discipline">
                        <option v-for="option in disciplineList" v-bind:value="option.code" >{{ option.label }}</option>
                    </select>
                </div>
            </div>
            <h5>Biographie</h5>
            <div>
                <search-criterion v-for="item in searchRequest.prosopography"
                                  v-bind:prosopography="item"
                                  v-bind:rows="searchRequest.prosopography.length"
                                  v-on:add-row="handleAddProsopographyRow()"
                                  v-on:remove-row="handleRemoveProsopographyRow(item)"/>
            </div>
            <div class="form-group">
                <button type="submit" class="btn btn-primary" @click="search()">Rechercher</button>
            </div>

            <div id="resultArea" v-if="results != null">
                <div v-if="results.length > 0">
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
                            <tr v-for="record in results">
                                <th scope="row">{{record.reference}}</th>
                                <td>{{record.identity.name?record.identity.name[0].value+"":'-'}}</td>
                                <td>{{record.identity.status?record.identity.status[0].value:'-'}}</td>
                                <td>{{record.identity.shortDescription?record.identity.shortDescription[0].value:'-'}}</td>
                                <td>
                                    <a class="btn btn-primary" :href="'.'+record.link">voir la fiche</a>
                                    <button class="btn btn-secondary">Télecharger la fiche</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div v-else>
                    Aucun résultat
                </div>
            </div>

        </div>

    </div>
</div>

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
$pageScripts .='<script src="https://cdn.jsdelivr.net/npm/vue/dist/vue.js"></script>';


$pageScripts .='<script src="'.getResourcesWebDirectory().'/js/recherche.js"></script>';
$pageScripts .='<script src="'.getResourcesWebDirectory().'/js/rechercheavancee.js"></script>';

 ?>
