<?php
// Required Stylesheets
$pageCSS .='<link type="text/css" rel="stylesheet" href="https://unpkg.com/bootstrap-vue@latest/dist/bootstrap-vue.css"/>';

// Required scripts
$pageScripts .='<script src="https://unpkg.com/vue@latest/dist/vue.min.js"></script>';
$pageScripts .='<script src="https://unpkg.com/bootstrap-vue@latest/dist/bootstrap-vue.js"></script>';
$pageScripts .='<script src="'.getResourcesWebDirectory().'/js/draft.js"></script>';
?>

<h3>Gestion des brouillons</h3>
<div id="app" v-cloak>
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

        <template #cell(actions)="row">
            <a v-bind:href="applicationUrl+'?action=view-draft&mode=DRAFTLIST&reference='+ row.item.reference" class="btn btn-success">
                Voir le brouillon
            </a>
            <button class="btn btn-primary" @click="publish(row.item.reference)">Publier le brouillon</button>
            <button class="btn btn-danger" @click="remove(row.item.reference)">Supprimer le brouillon</button>
        </template>

    </b-table>
</div>