<?php
// Required Stylesheets
$pageCSS .='<link type="text/css" rel="stylesheet" href="https://unpkg.com/bootstrap-vue@latest/dist/bootstrap-vue.css"/>';

// Required scripts
$pageScripts .='<script src="https://unpkg.com/vue@latest/dist/vue.min.js"></script>';
$pageScripts .='<script src="https://unpkg.com/bootstrap-vue@latest/dist/bootstrap-vue.js"></script>';
$pageScripts .='<script src="'.getResourcesWebDirectory().'/js/recherche-mongo.js"></script>';

?>

<div id="app">
    <h3>Recherche Mongo</h3>
    <div>
        <div class="container-fluid">
            <div class="row">
                <div class="form-inline">
                    <label>Find : </label>
                    <textarea type="text" cols="50" rows="10" v-model="searchRequest.find"></textarea>
                </div>
                <div class="form-inline">
                    <label>Projection : </label>
                    <textarea type="text" cols="50" rows="10" v-model="searchRequest.projection"></textarea>
                </div>
            </div>
            <div class="row">
                <div class="form-group">
                    <button v-if="!searching" type="submit" class="btn btn-primary" @click="executeQuery()">Rechercher</button>
                    <button v-else class="btn btn-secondary" type="button" disabled>
                        <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        Recherche en cours...
                    </button>
                </div>
            </div>
        </div>
    </div>

    <div id="resultArea" v-if="!searching && items != null">
        <div v-if="items.length > 0">
            <h2>Nombre de résultats : {{items.length}}</h2>
            <div>
                <button type="submit" :disabled="exporting" class="btn btn-primary" @click="exportJSON()">Export JSON</button>
                <button type="submit" :disabled="exporting" class="btn btn-primary" @click="exportCSV()">Export CSV</button>
            </div>

            <div v-if="exporting" class="text-center" >
                <div class="spinner-grow text-primary" style="width: 3rem; height: 3rem;" role="status">
                    <span class="sr-only">Export...</span>
                </div>
                <div class="spinner-grow text-success" style="width: 3rem; height: 3rem;" role="status">
                    <span class="sr-only">Export...</span>
                </div>
                <div class="spinner-grow text-warning" style="width: 3rem; height: 3rem;" role="status">
                    <span class="sr-only">Export...</span>
                </div>
                <div class="spinner-grow text-danger" style="width: 3rem; height: 3rem;" role="status">
                    <span class="sr-only">Export...</span>
                </div>
            </div>

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
                    <a v-bind:href="'<?php echo getApplicationUrl()?>/'+ row.item.link +'?mode=MONGOSEARCH'" size="sm" class="btn btn-primary">
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
<a id="downloadAnchorElem" style="display:none"></a>
