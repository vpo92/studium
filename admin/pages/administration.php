<?php
// Required scripts
$pageScripts .='<script src="'.getResourcesWebDirectory().'/js/administration.js"></script>';
?>
<h3>Administration</h3>

<div class="card">
    <div class="card-body">
        <h4 class="card-title">Réindexation de la base</h4>
        <p class="card-text">
            Lance la réindexation complète de la base de données via l'API.
            Cette opération peut prendre plusieurs minutes selon le volume de données.
        </p>
        <button id="reindex-db" type="button" class="btn btn-warning">
            Re-indexation complète de la base
        </button>
        <div id="reindex-status" class="mt-3" role="status" aria-live="polite"></div>
    </div>
</div>
