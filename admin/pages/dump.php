<?php
// Required Stylesheets
$pageCSS .='<link type="text/css" rel="stylesheet" href="https://unpkg.com/bootstrap-vue@latest/dist/bootstrap-vue.css"/>';

// Required scripts
$pageScripts .='<script src="https://cdn.jsdelivr.net/npm/vue@2/dist/vue.js"></script>';
$pageScripts .='<script src="https://unpkg.com/bootstrap-vue@latest/dist/bootstrap-vue.js"></script>';
$pageScripts .='<script src="'.getResourcesWebDirectory().'/js/dump.js"></script>';
?>
<h3>Gestion des Dumps</h3>
<div id="app" v-cloak>

    <h4>Dumps</h4>

    <button class="btn btn-primary" @click="list()">Rafraichir</button>
    <button class="btn btn-danger" @click="new()">Créer un dump</button>

    <b-table
        show-empty
        small
        stacked="md"
        :items="items"
        :fields="fields"
        :filter="filter"
        :filter-included-fields="filterOn"
        :sort-by.sync="sortBy"
        :sort-desc.sync="sortDesc"
        :sort-direction="sortDirection"
        @filtered="onFiltered"
    >

        <template #cell(role)="row">
            <ul>
                <li v-for="rLabel in row.item.name">{{name}}</li>
                <li><button class="btn btn-primary">Télécharger</button></li>
            </ul>
        </template>

    </b-table>

</div>
