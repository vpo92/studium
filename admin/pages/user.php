<?php
// Required Stylesheets
$pageCSS .='<link type="text/css" rel="stylesheet" href="https://unpkg.com/bootstrap-vue@latest/dist/bootstrap-vue.css"/>';

// Required scripts
$pageScripts .='<script src="https://cdn.jsdelivr.net/npm/vue@2/dist/vue.js"></script>';
$pageScripts .='<script src="https://unpkg.com/bootstrap-vue@latest/dist/bootstrap-vue.js"></script>';
$pageScripts .='<script src="'.getResourcesWebDirectory().'/js/user.js"></script>';
?>
<h3>Gestion des utilisateurs</h3>
<div id="app" v-cloak>

    <h4>Liste des utilisateurs ({{items.length}})</h4>

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
                <li v-for="rLabel in row.item.role">{{rLabel}}</li>
            </ul>
        </template>

        <template #cell(actions)="row">
            <button class="btn btn-danger" @click="reinitPwd(row.item._id)">Réinitialiser le mot de passe</button>
            <button class="btn btn-danger" @click="remove(row.item._id)">Supprimer le compte</button>
        </template>

    </b-table>

    <h4>Créer un utilisateur</h4>

        <div class="row">
            <div class="form-group col">
                <label for="nom">Nom :</label>
                <input id="nom" type="text" class="form-control" v-model="newUser.name">
            </div>
            <div class="form-group  col">
                <label for="email" class="form-group">Email de connexion :</label>
                <input name="email" type="email" class="form-control" v-model="newUser.email">
            </div>
            <div class="form-group  col">
                <label class="form-group">Mot de passe :</label>
                <input type="password" class="form-control" v-model="newUser.password">
            </div>
            <div class="form-group  col">
                <label class="form-group">Role :</label>
                <select class="form-control" v-model="newUser.role" multiple>
                    <option value="user">Utilisateur</option>
                    <option value="admin">Administrateur</option>
                </select>
            </div>
            <div class="col">
                <button class="btn btn-primary" class="form-control" @click="add()">Enregistrer</button>
            </div>
        </div>
</div>
