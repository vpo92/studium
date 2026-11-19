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

<div class="card mb-4" id="backup-card" hidden>
    <div class="card-body">
        <h4 class="card-title">Sauvegarde de la base</h4>
        <p class="card-text">
            Produit un dump complet de la base MongoDB sur le serveur
            (collections compressées puis archive <code>tar</code>), exécuté
            en arrière-plan par le worker. Suivez la progression dans le
            panneau « Traitements longs » ci-dessus.
        </p>
        <button id="backup-start" type="button" class="btn btn-success">
            Lancer la sauvegarde
        </button>
        <div id="backup-status" class="mt-3" role="status" aria-live="polite"></div>
    </div>
</div>

<div class="card mb-4" id="restore-card" hidden>
    <div class="card-body">
        <h4 class="card-title text-danger">Restauration de la base</h4>
        <div class="alert alert-danger py-2">
            <strong>Opération destructrice :</strong> toutes les données
            actuelles seront supprimées et remplacées par le contenu de
            l'archive choisie. Une sauvegarde de sécurité de l'état courant
            est produite avant toute écriture (fortement recommandé de la
            laisser activée).
        </div>
        <div class="form-group">
            <label for="restore-archive">Archive de sauvegarde</label>
            <select id="restore-archive" class="form-control">
                <option value="">Chargement…</option>
            </select>
        </div>
        <div class="form-check mb-3">
            <input type="checkbox" class="form-check-input" id="restore-prebackup" checked>
            <label class="form-check-label" for="restore-prebackup">
                Sauvegarde de sécurité avant restauration
            </label>
        </div>
        <div class="form-group">
            <label for="restore-confirm">Tapez <strong>RESTAURER</strong> pour confirmer</label>
            <input type="text" class="form-control" id="restore-confirm"
                   autocomplete="off" placeholder="RESTAURER">
        </div>
        <button id="restore-start" type="button" class="btn btn-danger" disabled>
            Restaurer la base
        </button>
        <div id="restore-status" class="mt-3" role="status" aria-live="polite"></div>
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
