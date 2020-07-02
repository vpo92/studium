<h3>Rechercher une fiche par mot clé</h3>


<ul class="nav nav-tabs" id="myTab" role="tablist">
    <li class="nav-item">
        <a class="nav-link active" id="home-tab" data-toggle="tab" href="#home" role="tab" aria-controls="home" aria-selected="true">Recherche rapide</a>
    </li>
    <li class="nav-item">
        <a class="nav-link" id="profile-tab" data-toggle="tab" href="#profile" role="tab" aria-controls="profile" aria-selected="false">Recherche avancée</a>
    </li>
    <li class="nav-item">
        <a class="nav-link" id="profile-tab" data-toggle="tab" href="#graphics" role="tab" aria-controls="profile" aria-selected="false">Recherche graphique</a>
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
    </div>
    <div class="tab-pane fade" id="profile" role="tabpanel" aria-labelledby="profile-tab">

        <br>
        <div ref="formContainer" id="app">

            <h5>Nom</h5>
            <div class="form-inline">
                <div class="form-group">
                    <input type="text" v-model="searchRequest.name">
                </div>
            </div>

            <fieldset>
                <legend>Activité</legend>
                <div>
                    <div class="form-group">
                        <label>Médiane d'activité entre : </label>
                        <input type="number" v-model="searchRequest.activityMediane.from" placeholder="1100" step="100">
                        <label> et </label>
                        <input type="number" v-model="searchRequest.activityMediane.to" placeholder="1600" step="100">
                    </div>

                    <div class="form-group">
                        <label>Début d'activité entre : </label>
                        <input type="number" v-model="searchRequest.activity.start.from" step="100">
                        <label>et</label>
                        <input type="number" v-model="searchRequest.activity.start.to" step="100">
                    </div>


                    <div class="form-group">
                        <label>Fin d'activité entre : </label>
                        <input type="number" v-model="searchRequest.activity.end.from" step="100">
                        <label>et</label>
                        <input type="number" v-model="searchRequest.activity.end.to" step="100">
                    </div>
                </div>
            </fieldset>


            <div class="form-group">
                <fieldset>
                    <legend>Statut</legend>
                    <span style="margin: 20px" v-for="option in statusList">
                        <input type="checkbox" v-bind:id="option.label" v-bind:value="option.code"
                               v-model="searchRequest.status"/>
                        <label v-bind:for="option.label">{{ option.label }}</label>
                    </span>
                </fieldset>
            </div>

            <div class="form-group">
                <fieldset>
                    <legend>Sexe</legend>
                    <span style="margin: 20px" v-for="option in sexeList">
                        <input type="checkbox" v-bind:id="option.label" v-bind:value="option.code"
                               v-model="searchRequest.sexe"/>
                        <label v-bind:for="option.label">{{ option.label }}</label>
                    </span>
                </fieldset>
            </div>


            <h5>Cursus</h5>
            <div class="form-inline">


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
                <button v-if="!searching" type="submit" class="btn btn-primary" @click="searchs()">Rechercher</button>
                <button v-else class="btn btn-secondary" type="button" disabled>
                    <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    Recherche en cours...
                </button>
            </div>

            <div id="resultArea" v-if="!searching && results != null">
                <div v-if="results.length > 0">
                    <h2>Nombre de résultats : {{results.length}}</h2>
                    <table class="table" id="resultTable2">
                        <thead>
                        <tr>
                            <th scope="col">Référence</th>
                            <th scope="col">Nom</th>
                            <th scope="col">Statut</th>
                            <th scope="col">Description</th>
                            <th scope="col">Date d'activité</th>
                            <th scope="col">Mediane</th>
                            <th scope="col">Dernier grade</th>
                            <th scope="col">Nombre de grades</th>
                            <th scope="col">Diocèse d'origine</th>
                            <th scope="col">Dérnière actualisation</th>
                            <th scope="col">Action</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr v-for="record in results"  >
                            <td scope="row">{{record.reference}}</td>
                            <td v-if="record.auteur===true" style="color: red">{{record.identity.name?record.identity.name[0].value+"":'-'}}</td>
                            <td v-else>{{record.identity.name?record.identity.name[0].value+"":'-'}}</td>
                            <td>{{record.identity.status?record.identity.status[0].value:'-'}}</td>
                            <td>{{record.identity.shortDescription?record.identity.shortDescription[0].value:'-'}}</td>
                            <td>{{record.identity.datesOfActivity[0].value?record.identity.datesOfActivity[0].value:'?-?'}}</td>
                            <td>{{record.extras.activityMediane?record.extras.activityMediane:"-" }}</td>
                            <td></td>
                            <td>{{record.nbGrades?record.nbGrades:'?'}}</td>
                            <td>{{record.originDiocese?record.originDiocese:'?'}}</td>
                            <td></td>
                            <td>
                                <a class="btn btn-primary" :href="'.'+record.link">voir la fiche</a>
                                <button class="btn btn-secondary"><i class="fas fa-copy"></i></button>
                                <button class="btn btn-secondary"><i class="fas fa-file-word"></i></button>
                                <button class="btn btn-secondary"><i class="fas fa-file-pdf"></i></button>
                            </td>
                        </tr>

                        </tbody>
                    </table>
                </div>
                <div v-else>
                    Aucun résultat
                </div>
            </div>




            <!--<div>
                <table class="table" id="resultTable3">
                    <thead>
                    <tr>
                        <th>Ref</th>
                        <th>Nom</th>
                        <th>Status</th>
                        <th>Description</th>
                        <th>Dates d'activités</th>
                        <th>Mediane</th>
                        <th>Dernier grade</th>
                        <th>Nombre de grades</th>
                        <th>Diocése d'origine</th>
                        <th>Dernière actualisation</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                </table>
            </div>-->
            <div v-if="searching" class="text-center" >
                <div class="spinner-grow text-primary" style="width: 3rem; height: 3rem;" role="status">
                    <span class="sr-only">Recherche...</span>
                </div>
                <div class="spinner-grow text-success" style="width: 3rem; height: 3rem;" role="status">
                    <span class="sr-only">Recherche...</span>
                </div>
                <div class="spinner-grow text-warning" style="width: 3rem; height: 3rem;" role="status">
                    <span class="sr-only">Recherche...</span>
                </div>
                <div class="spinner-grow text-danger" style="width: 3rem; height: 3rem;" role="status">
                    <span class="sr-only">Recherche...</span>
                </div>
            </div>

        </div>

    </div>
    <div class="tab-pane fade" id="graphics" role="tabpanel" aria-labelledby="profile-tab">

        <div id="graphe">

            <canvas id="myChart" width="400" height="400"></canvas>
            <div id="resultArea" v-if=" resultsGraph !== null && resultsGraph.length > 0">
                <h2>Nombre de résultats : {{resultsGraph.length}}</h2>
                <table class="table" id="resultTable3">
                    <thead>
                    <tr>
                        <th scope="col">Référence</th>
                        <th scope="col">Nom</th>
                        <th scope="col">Statut</th>
                        <th scope="col">Description</th>
                        <th scope="col">Date d'activité</th>
                        <th scope="col">Mediane</th>
                        <th scope="col">Dernier grade</th>
                        <th scope="col">Nombre de grades</th>
                        <th scope="col">Diocèse d'origine</th>
                        <th scope="col">Dérnière actualisation</th>
                        <th scope="col">Action</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="record in resultsGraph"  >
                        <td scope="row">{{record.reference}}</td>
                        <td v-if="record.auteur===true" style="color: red">{{record.identity.name?record.identity.name[0].value+"":'-'}}</td>
                        <td v-else>{{record.identity.name?record.identity.name[0].value+"":'-'}}</td>
                        <td>{{record.identity.status?record.identity.status[0].value:'-'}}</td>
                        <td>{{record.identity.shortDescription?record.identity.shortDescription[0].value:'-'}}</td>
                        <td>{{record.identity.datesOfActivity[0].value?record.identity.datesOfActivity[0].value:'?-?'}}</td>
                        <td>{{record.extras.activityMediane?record.extras.activityMediane:"-" }}</td>
                        <td></td>
                        <td>{{record.nbGrades?record.nbGrades:'?'}}</td>
                        <td>{{record.originDiocese?record.originDiocese:'?'}}</td>
                        <td></td>
                        <td>
                            <a class="btn btn-primary" :href="'.'+record.link">voir la fiche</a>
                            <button class="btn btn-secondary"><i class="fas fa-copy"></i></button>
                            <button class="btn btn-secondary"><i class="fas fa-file-word"></i></button>
                            <button class="btn btn-secondary"><i class="fas fa-file-pdf"></i></button>
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
$pageScripts .='<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.9.3/Chart.min.js"></script>';

$pageScripts .='<script src="'.getResourcesWebDirectory().'/js/recherche.js"></script>';
$pageScripts .='<script src="'.getResourcesWebDirectory().'/js/rechercheGraphe.js"></script>';
$pageScripts .='<script src="'.getResourcesWebDirectory().'/js/rechercheavancee.js"></script>';

?>
