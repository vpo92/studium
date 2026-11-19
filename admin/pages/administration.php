<?php
// Required scripts
$pageScripts .='<script src="'.getResourcesWebDirectory().'/js/administration.js"></script>';
?>
<h3>Administration</h3>

<div class="card mb-4">
    <div class="card-body">
        <h4 class="card-title">Traitements longs</h4>
        <p class="card-text">
            Les traitements sont exécutés en arrière-plan par le worker.
            Vous pouvez fermer cette page : le traitement continue et vous
            pourrez suivre sa progression en revenant ici.
        </p>

        <div class="form-row align-items-end">
            <div class="col-md-6">
                <label for="job-type">Traitement</label>
                <select id="job-type" class="form-control">
                    <option value="">Chargement…</option>
                </select>
                <small id="job-type-description" class="form-text text-muted"></small>
            </div>
            <div class="col-md-4">
                <button id="job-start" type="button" class="btn btn-primary btn-block">
                    Lancer le traitement
                </button>
            </div>
        </div>

        <div id="job-start-status" class="mt-3" role="status" aria-live="polite"></div>

        <div id="job-panel" class="mt-4" hidden>
            <div class="d-flex flex-wrap justify-content-between align-items-center mb-2">
                <div class="mb-2">
                    <span id="job-status-badge" class="badge badge-secondary">En attente</span>
                    <strong id="job-title" class="ml-2"></strong>
                </div>
                <div class="mb-2">
                    <button id="job-cancel" type="button" class="btn btn-sm btn-outline-danger">
                        Annuler
                    </button>
                    <button id="job-retry" type="button" class="btn btn-sm btn-outline-warning" hidden>
                        Relancer les erreurs
                    </button>
                </div>
            </div>

            <div class="progress" style="height: 28px;">
                <div id="job-progress-bar"
                     class="progress-bar"
                     role="progressbar"
                     style="width: 0%;"
                     aria-valuenow="0"
                     aria-valuemin="0"
                     aria-valuemax="100">0 %</div>
            </div>

            <div id="job-progress-text" class="mt-2 text-muted small"></div>
            <div id="job-failures" class="mt-3"></div>
        </div>
    </div>
</div>

<div class="card mb-4">
    <div class="card-body">
        <h4 class="card-title">Index de recherche</h4>
        <p class="card-text">
            Met à jour l'index MongoDB de recherche plein texte.
            Opération rapide : elle ne régénère pas le JSON des fiches.
        </p>
        <button id="reindex-db" type="button" class="btn btn-warning">
            Mettre à jour l'index de recherche
        </button>
        <div id="reindex-status" class="mt-3" role="status" aria-live="polite"></div>
    </div>
</div>

<div class="card">
    <div class="card-body">
        <h4 class="card-title">Derniers traitements</h4>
        <div class="table-responsive">
            <table class="table table-sm table-hover mb-0">
                <thead>
                <tr>
                    <th>Traitement</th>
                    <th>Statut</th>
                    <th>Progression</th>
                    <th>Créé le</th>
                    <th></th>
                </tr>
                </thead>
                <tbody id="job-history">
                <tr>
                    <td colspan="5" class="text-muted">Chargement…</td>
                </tr>
                </tbody>
            </table>
        </div>
    </div>
</div>
