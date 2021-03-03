<?php
// Required Stylesheets
$pageCSS .='<link type="text/css" rel="stylesheet" href="https://unpkg.com/bootstrap-vue@latest/dist/bootstrap-vue.css"/>';

// Required scripts
$pageScripts .='<script src="https://unpkg.com/vue@latest/dist/vue.min.js"></script>';
$pageScripts .='<script src="https://unpkg.com/bootstrap-vue@latest/dist/bootstrap-vue.js"></script>';
$pageScripts .='<script src="'.getResourcesWebDirectory().'/js/recherche-avancee.js"></script>';
$pageScripts .='<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/renderjson@1.4.0/renderjson.min.js"></script>';
?>






<!-- Our application root element -->
<div id="app">

    <h3>Recherche avancée</h3>
    <div>

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
        <div>
            <button class="btn btn-primary" @click="constructRequest">Visualiser la requete</button>
            <button v-if="vizualisation" class="btn btn-danger" @click="closeRequestVizualisation">Fermer la visualisation</button>
            <div style="background: black; color: white" id ="test">
            </div>
        </div>
        <div class="form-group">
            <button v-if="!searching" type="submit" class="btn btn-primary" @click="search()">Rechercher</button>
            <button v-else class="btn btn-secondary" type="button" disabled>
                <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                Recherche en cours...
            </button>
        </div>
    </div>

    <div id="resultArea" v-if="!searching && items != null">
        <div v-if="items.length > 0">
            <h2>Nombre de résultats : {{items.length}}</h2>

            <!-- Main table element -->
            <b-table
                show-empty
                small
                stacked="md"
                :items="items"
                :fields="fields"
                :current-page="currentPage"
                :per-page="perPage"
                :filter="filter"
                :filter-included-fields="filterOn"
                :sort-by.sync="sortBy"
                :sort-desc.sync="sortDesc"
                :sort-direction="sortDirection"
                @filtered="onFiltered"
            >
                <template #cell(name)="row">
                    {{ row.value.first }} {{ row.value.last }}
                </template>

                <template #cell(actions)="row">
                    <a v-bind:href="'<?php echo getApplicationUrl()?>/'+ row.item.link +'?mode=FULLSEARCH'" size="sm" class="btn btn-primary">
                        Voir la fiche
                    </a>
                </template>

            </b-table>
            <b-row>
                <b-col lg="6" class="my-1">
                    <b-pagination
                        v-model="currentPage"
                        :total-rows="totalRows"
                        :per-page="perPage"
                        align="fill"
                        size="sm"
                        class="my-0"
                    ></b-pagination>
                </b-col>
            </b-row>

        </div>
        <div v-else>
            Aucun résultat
        </div>

    </div>


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
