(function () {
    'use strict';

    var STATUS_LABELS = {
        queued: 'En attente',
        running: 'En cours',
        done: 'Terminé',
        failed: 'Échec',
        cancelled: 'Annulé'
    };

    var typesByType = {};
    var currentJobId = null;
    var pollTimer = null;

    // Exposé par setupJobs() : permet à d'autres cartes de la page (ex.
    // « Sauvegarde de la base ») de lancer un job via le panneau de suivi.
    var launchJobType = null;

    // Exposé par setupBackupDownloads() : recharge la liste des archives
    // téléchargeables (appelé notamment quand un traitement se termine).
    var refreshBackupDownloads = null;

    // Exposé par setupRestore() : recharge la liste d'archives du sélecteur
    // de restauration (notamment après un téléversement).
    var refreshRestoreArchives = null;

    function baseUrl() {
        return String(apiUrl).trim().replace(/\/+$/, '');
    }

    function sessionTokenValue() {
        return String(sessionToken).trim();
    }

    function escapeHtml(value) {
        return String(value === null || value === undefined ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    async function apiFetch(path, options) {
        var opts = options || {};
        var headers = Object.assign({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + sessionTokenValue()
        }, opts.headers || {});

        var response = await fetch(baseUrl() + path, Object.assign({}, opts, { headers: headers }));
        var data = null;
        try {
            data = await response.json();
        } catch (error) {
            data = null;
        }

        if (!response.ok) {
            var message = data && data.message ? data.message : ('HTTP ' + response.status);
            var error = new Error(message);
            error.status = response.status;
            error.data = data;
            throw error;
        }

        return data;
    }

    function formatDate(value) {
        if (!value) {
            return '—';
        }
        var date = new Date(value);
        if (isNaN(date.getTime())) {
            return '—';
        }
        return date.toLocaleString('fr-FR');
    }

    function formatSize(bytes) {
        if (bytes === null || bytes === undefined) {
            return '';
        }
        var units = ['o', 'Ko', 'Mo', 'Go', 'To'];
        var value = bytes;
        var unit = 0;
        while (value >= 1024 && unit < units.length - 1) {
            value /= 1024;
            unit += 1;
        }
        return (unit === 0 ? value : Math.round(value * 10) / 10) + ' ' + units[unit];
    }

    function formatDuration(durationMs) {
        if (durationMs === null || durationMs === undefined) {
            return '';
        }
        var seconds = Math.round(durationMs / 1000);
        if (seconds < 60) {
            return seconds + ' s';
        }
        var minutes = Math.floor(seconds / 60);
        var remaining = seconds % 60;
        if (minutes < 60) {
            return minutes + ' min ' + remaining + ' s';
        }
        var hours = Math.floor(minutes / 60);
        return hours + ' h ' + (minutes % 60) + ' min';
    }

    function statusLabel(job) {
        return STATUS_LABELS[job.status] || job.status;
    }

    function statusBadgeClass(job) {
        if (job.status === 'running') {
            return 'badge-primary';
        }
        if (job.status === 'done') {
            return job.failedCount > 0 ? 'badge-warning' : 'badge-success';
        }
        if (job.status === 'failed') {
            return 'badge-danger';
        }
        if (job.status === 'cancelled') {
            return 'badge-dark';
        }
        return 'badge-secondary';
    }

    function progressBarClass(job) {
        if (job.status === 'running') {
            return 'bg-primary progress-bar-striped progress-bar-animated';
        }
        if (job.status === 'done') {
            return job.failedCount > 0 ? 'bg-warning' : 'bg-success';
        }
        if (job.status === 'failed') {
            return 'bg-danger';
        }
        if (job.status === 'cancelled') {
            return 'bg-dark';
        }
        return 'bg-secondary';
    }

    function typeLabel(type) {
        return typesByType[type] ? typesByType[type].label : type;
    }

    // Libellé de l'unité de travail (« fiche », « collection », …) fourni
    // par le registre des traitements (GET /admin/jobs/types).
    function typeUnitLabel(type) {
        var known = typesByType[type];
        return (known && known.unitLabel) ? known.unitLabel : 'fiche';
    }

    /* ------------------------------------------------------------------ *
     *  Index de recherche (opération rapide, sans worker)
     * ------------------------------------------------------------------ */

    function setupIndexDb() {
        var button = document.getElementById('reindex-db');
        var status = document.getElementById('reindex-status');

        if (!button || !status) {
            return;
        }

        function setStatus(message, type) {
            status.className = type ? 'mt-3 alert alert-' + type : 'mt-3';
            status.textContent = message || '';
        }

        function setBusy(busy) {
            button.disabled = busy;
            button.textContent = busy
                ? 'Mise à jour en cours...'
                : "Mettre à jour l'index de recherche";
        }

        button.addEventListener('click', async function () {
            if (!confirm("Confirmez-vous la mise à jour de l'index de recherche ?")) {
                return;
            }

            setStatus('', null);
            setBusy(true);

            try {
                await apiFetch('/admin/indexDB', {
                    method: 'POST',
                    body: '{}'
                });
                setStatus("Index de recherche mis à jour.", 'success');
            } catch (error) {
                if (error.status === 401 || error.status === 403) {
                    setStatus("Vous n'avez pas l'autorisation de réindexer la base.", 'danger');
                } else {
                    console.error('reindex error', error);
                    setStatus("Erreur lors de la mise à jour de l'index de recherche.", 'danger');
                }
            } finally {
                setBusy(false);
            }
        });
    }

    /* ------------------------------------------------------------------ *
     *  Traitements longs (jobs exécutés par le worker)
     * ------------------------------------------------------------------ */

    function setupJobs() {
        var typeSelect = document.getElementById('job-type');
        var typeDescription = document.getElementById('job-type-description');
        var startButton = document.getElementById('job-start');
        var startStatus = document.getElementById('job-start-status');
        var panel = document.getElementById('job-panel');
        var title = document.getElementById('job-title');
        var badge = document.getElementById('job-status-badge');
        var bar = document.getElementById('job-progress-bar');
        var progressText = document.getElementById('job-progress-text');
        var failuresBox = document.getElementById('job-failures');
        var cancelButton = document.getElementById('job-cancel');
        var retryButton = document.getElementById('job-retry');
        var historyBody = document.getElementById('job-history');

        if (!typeSelect || !startButton || !panel) {
            return;
        }

        function setStartStatus(message, type) {
            startStatus.className = type ? 'mt-3 alert alert-' + type : 'mt-3';
            startStatus.textContent = message || '';
        }

        function stopPolling() {
            if (pollTimer) {
                clearTimeout(pollTimer);
                pollTimer = null;
            }
        }

        function renderFailures(failures) {
            if (!failures || failures.length === 0) {
                failuresBox.innerHTML = '';
                return;
            }

            var items = failures.map(function (failure) {
                return '<li><code>' + escapeHtml(failure.reference) + '</code> — ' +
                    escapeHtml(failure.message) + '</li>';
            }).join('');

            failuresBox.innerHTML =
                '<div class="alert alert-warning mb-0">' +
                '<strong>' + failures.length + ' erreur(s)</strong>' +
                '<ul class="mb-0 mt-2 pl-4">' + items + '</ul>' +
                '</div>';
        }

        function renderJob(job) {
            panel.hidden = false;

            title.textContent = typeLabel(job.type);
            badge.textContent = statusLabel(job);
            badge.className = 'badge ' + statusBadgeClass(job);

            var percent = job.percent || 0;
            bar.style.width = percent + '%';
            bar.setAttribute('aria-valuenow', String(percent));
            bar.className = 'progress-bar ' + progressBarClass(job);
            bar.textContent = percent + ' %';

            var parts = [];
            parts.push(job.processed + ' / ' + (job.total || '?') + ' ' +
                typeUnitLabel(job.type) + '(s)');
            parts.push(job.succeeded + ' réussie(s)');
            parts.push(job.failedCount + ' erreur(s)');
            if (job.durationMs !== null && job.durationMs !== undefined) {
                parts.push('durée : ' + formatDuration(job.durationMs));
            }
            progressText.textContent = parts.join(' · ') + (job.message ? ' — ' + job.message : '');

            cancelButton.disabled = !job.isActive || job.cancelRequested;
            cancelButton.textContent = job.cancelRequested ? 'Annulation…' : 'Annuler';
            retryButton.hidden = !(job.failedCount > 0 && !job.isActive);

            renderFailures(job.failures);
        }

        function schedulePoll(jobId, delay) {
            stopPolling();
            pollTimer = setTimeout(function () {
                poll(jobId);
            }, delay || 2000);
        }

        async function poll(jobId) {
            if (currentJobId !== jobId) {
                return;
            }
            try {
                var job = await apiFetch('/admin/jobs/' + encodeURIComponent(jobId));
                if (currentJobId !== jobId) {
                    return;
                }
                renderJob(job);
                if (job.isActive) {
                    schedulePoll(jobId);
                } else {
                    loadHistory();
                    // Une sauvegarde (ou une sauvegarde de sécurité) vient
                    // peut-être de se terminer : rafraîchir les archives.
                    if (refreshBackupDownloads) {
                        refreshBackupDownloads();
                    }
                    if (refreshRestoreArchives) {
                        refreshRestoreArchives();
                    }
                }
            } catch (error) {
                if (error.status === 401 || error.status === 403) {
                    setStartStatus("Vous n'avez pas l'autorisation de suivre ce traitement.", 'danger');
                    return;
                }
                setStartStatus('Suivi impossible : ' + error.message, 'danger');
                schedulePoll(jobId, 5000);
            }
        }

        function attachToJob(job) {
            currentJobId = job.id;
            renderJob(job);
            if (job.isActive) {
                schedulePoll(job.id);
            } else {
                stopPolling();
            }
        }

        async function loadTypes() {
            try {
                var types = await apiFetch('/admin/jobs/types');
                typeSelect.innerHTML = '';

                if (!types || types.length === 0) {
                    var empty = document.createElement('option');
                    empty.value = '';
                    empty.textContent = 'Aucun traitement disponible';
                    typeSelect.appendChild(empty);
                    startButton.disabled = true;
                    return;
                }

                types.forEach(function (type) {
                    typesByType[type.type] = type;
                    var option = document.createElement('option');
                    option.value = type.type;
                    option.textContent = type.label;
                    option.title = type.description || '';
                    typeSelect.appendChild(option);
                });
                updateTypeDescription();

                // Les cartes « Sauvegarde » et « Restauration » n'ont de sens
                // que si le traitement existe côté API.
                var backupCard = document.getElementById('backup-card');
                if (backupCard) {
                    backupCard.hidden = !typesByType.backup;
                }
                var restoreCard = document.getElementById('restore-card');
                if (restoreCard) {
                    restoreCard.hidden = !typesByType.restore;
                }
            } catch (error) {
                typeSelect.innerHTML = '<option value="">Erreur de chargement</option>';
                startButton.disabled = true;
                if (error.status === 401 || error.status === 403) {
                    setStartStatus("Vous n'avez pas l'autorisation de lancer des traitements.", 'danger');
                } else {
                    setStartStatus('Impossible de charger les traitements : ' + error.message, 'danger');
                }
            }
        }

        function updateTypeDescription() {
            var type = typesByType[typeSelect.value];
            typeDescription.textContent = type && type.description ? type.description : '';
        }

        async function loadHistory() {
            try {
                var list = await apiFetch('/admin/jobs?limit=10');
                historyBody.innerHTML = '';

                if (!list || list.length === 0) {
                    historyBody.innerHTML =
                        '<tr><td colspan="5" class="text-muted">Aucun traitement lancé.</td></tr>';
                    return;
                }

                list.forEach(function (job) {
                    var row = document.createElement('tr');
                    var percent = job.percent || 0;
                    row.innerHTML =
                        '<td>' + escapeHtml(typeLabel(job.type)) + '</td>' +
                        '<td><span class="badge ' + statusBadgeClass(job) + '">' +
                        escapeHtml(statusLabel(job)) + '</span>' +
                        (job.failedCount > 0 ? ' <small class="text-danger">' + job.failedCount + '</small>' : '') +
                        '</td>' +
                        '<td style="min-width:120px;">' +
                        '<div class="progress" style="height:12px;">' +
                        '<div class="progress-bar ' + progressBarClass(job) + '" role="progressbar" ' +
                        'style="width:' + percent + '%;" aria-valuenow="' + percent + '" ' +
                        'aria-valuemin="0" aria-valuemax="100"></div>' +
                        '</div>' +
                        '<small class="text-muted">' + job.processed + ' / ' + (job.total || '?') + '</small>' +
                        '</td>' +
                        '<td><small>' + escapeHtml(formatDate(job.createdAt)) + '</small></td>' +
                        '<td class="text-right">' +
                        '<button type="button" class="btn btn-sm btn-outline-secondary" ' +
                        'data-job-id="' + escapeHtml(job.id) + '">' +
                        (job.isActive ? 'Suivre' : 'Détails') + '</button>' +
                        '</td>';
                    historyBody.appendChild(row);
                });

                // Au chargement de la page, se rattacher automatiquement au
                // traitement actif s'il y en a un.
                if (!currentJobId) {
                    var active = list.filter(function (job) { return job.isActive; })[0];
                    if (active) {
                        attachToJob(active);
                    }
                }
            } catch (error) {
                historyBody.innerHTML =
                    '<tr><td colspan="5" class="text-danger">Impossible de charger l\'historique : ' +
                    escapeHtml(error.message) + '</td></tr>';
            }
        }

        typeSelect.addEventListener('change', updateTypeDescription);

        /**
         * Lance un traitement par son type et rattache le panneau de suivi.
         * Réutilisable par d'autres boutons de la page (sauvegarde…).
         * Résout { job, reused } ; rejette l'erreur (déjà affichée via setStatus).
         */
        async function launch(type, setStatus, params) {
            setStatus('Démarrage…', 'info');
            startButton.disabled = true;
            try {
                var job = await apiFetch('/admin/jobs', {
                    method: 'POST',
                    body: JSON.stringify({ type: type, params: params || {} })
                });
                setStatus('Traitement démarré en arrière-plan.', 'success');
                attachToJob(job);
                loadHistory();
                return { job: job, reused: false };
            } catch (error) {
                if (error.status === 409 && error.data && error.data.job) {
                    setStatus(error.message + ' Suivi du traitement existant.', 'warning');
                    attachToJob(error.data.job);
                    loadHistory();
                    return { job: error.data.job, reused: true };
                }
                if (error.status === 401 || error.status === 403) {
                    setStatus("Vous n'avez pas l'autorisation de lancer ce traitement.", 'danger');
                } else {
                    setStatus('Erreur : ' + error.message, 'danger');
                }
                throw error;
            } finally {
                startButton.disabled = false;
            }
        }
        launchJobType = launch;

        startButton.addEventListener('click', async function () {
            var type = typeSelect.value;
            if (!type) {
                return;
            }
            if (!confirm('Confirmez-vous le lancement de « ' + typeLabel(type) + ' » ?')) {
                return;
            }
            try {
                await launch(type, setStartStatus);
            } catch (error) {
                // Déjà affiché par launch().
            }
        });

        cancelButton.addEventListener('click', async function () {
            if (!currentJobId) {
                return;
            }
            if (!confirm('Confirmez-vous l\'annulation du traitement ?')) {
                return;
            }

            cancelButton.disabled = true;
            try {
                var job = await apiFetch(
                    '/admin/jobs/' + encodeURIComponent(currentJobId) + '/cancel',
                    { method: 'POST', body: '{}' }
                );
                setStartStatus('Annulation demandée.', 'warning');
                renderJob(job);
                schedulePoll(currentJobId, 1000);
            } catch (error) {
                setStartStatus('Annulation impossible : ' + error.message, 'danger');
                cancelButton.disabled = false;
            }
        });

        retryButton.addEventListener('click', async function () {
            if (!currentJobId) {
                return;
            }
            if (!confirm('Relancer uniquement les fiches en erreur ?')) {
                return;
            }

            retryButton.disabled = true;
            try {
                var job = await apiFetch(
                    '/admin/jobs/' + encodeURIComponent(currentJobId) + '/retry-failed',
                    { method: 'POST', body: '{}' }
                );
                setStartStatus('Relance des erreurs démarrée.', 'success');
                attachToJob(job);
                loadHistory();
            } catch (error) {
                if (error.status === 409) {
                    setStartStatus(error.message, 'warning');
                } else {
                    setStartStatus('Relance impossible : ' + error.message, 'danger');
                }
            } finally {
                retryButton.disabled = false;
            }
        });

        historyBody.addEventListener('click', function (event) {
            var button = event.target.closest ? event.target.closest('button[data-job-id]') : null;
            if (!button) {
                return;
            }
            var jobId = button.getAttribute('data-job-id');
            apiFetch('/admin/jobs/' + encodeURIComponent(jobId))
                .then(function (job) {
                    setStartStatus('', null);
                    attachToJob(job);
                })
                .catch(function (error) {
                    setStartStatus('Impossible de charger ce traitement : ' + error.message, 'danger');
                });
        });

        loadTypes();
        loadHistory();
    }

    /* ------------------------------------------------------------------ *
     *  Sauvegarde de la base (raccourci du job « backup »)
     * ------------------------------------------------------------------ */

    function setupBackup() {
        var card = document.getElementById('backup-card');
        var button = document.getElementById('backup-start');
        var status = document.getElementById('backup-status');

        if (!card || !button || !status) {
            return;
        }

        function setStatus(message, type) {
            status.className = type ? 'mt-3 alert alert-' + type : 'mt-3';
            status.textContent = message || '';
        }

        button.addEventListener('click', async function () {
            if (!confirm('Confirmez-vous le lancement de la sauvegarde de la base ?')) {
                return;
            }
            if (typeof launchJobType !== 'function') {
                setStatus('Panneau des traitements longs indisponible.', 'danger');
                return;
            }

            button.disabled = true;
            try {
                var result = await launchJobType('backup', setStatus);
                if (!result.reused) {
                    setStatus(
                        'Sauvegarde lancée : suivez sa progression dans le panneau '
                        + '« Traitements longs » ci-dessus.',
                        'success'
                    );
                }
            } catch (error) {
                // Déjà affiché par launch().
            } finally {
                button.disabled = false;
            }
        });
    }

    /* ------------------------------------------------------------------ *
     *  Téléchargement des dumps (liste des archives de sauvegarde)
     * ------------------------------------------------------------------ */

    function setupBackupDownloads() {
        var tbody = document.getElementById('backup-downloads');
        var status = document.getElementById('backup-downloads-status');

        if (!tbody || !status) {
            return;
        }

        function setStatus(message, type) {
            status.className = type ? 'mt-2 alert alert-' + type : 'mt-2';
            status.textContent = message || '';
        }

        function renderMessage(message, type) {
            tbody.innerHTML =
                '<tr><td colspan="4" class="' + (type || 'text-muted') + '">' +
                escapeHtml(message) + '</td></tr>';
        }

        async function load() {
            try {
                var archives = await apiFetch('/admin/jobs/backups');
                tbody.innerHTML = '';

                if (!archives || archives.length === 0) {
                    renderMessage('Aucune archive disponible.');
                    return;
                }

                archives.forEach(function (archive) {
                    var row = document.createElement('tr');
                    row.innerHTML =
                        '<td><code>' + escapeHtml(archive.name) + '</code></td>' +
                        '<td>' + escapeHtml(formatSize(archive.size)) + '</td>' +
                        '<td><small>' + escapeHtml(formatDate(archive.modifiedAt)) + '</small></td>' +
                        '<td class="text-right">' +
                        '<button type="button" class="btn btn-sm btn-outline-primary" ' +
                        'data-archive-name="' + escapeHtml(archive.name) + '">' +
                        'Télécharger</button>' +
                        '</td>';
                    tbody.appendChild(row);
                });
            } catch (error) {
                if (error.status === 401 || error.status === 403) {
                    renderMessage("Vous n'avez pas l'autorisation de lister les sauvegardes.", 'text-danger');
                } else {
                    renderMessage('Impossible de charger les sauvegardes : ' + error.message, 'text-danger');
                }
            }
        }

        async function download(button) {
            var name = button.getAttribute('data-archive-name');
            var label = button.textContent;

            button.disabled = true;
            button.textContent = 'Téléchargement…';
            setStatus('', null);

            try {
                // Flux binaire authentifié par en-tête : on récupère l'archive
                // en mémoire puis on déclenche l'enregistrement côté navigateur.
                var response = await fetch(
                    baseUrl() + '/admin/jobs/backups/' + encodeURIComponent(name) + '/download',
                    { headers: { 'Authorization': 'Bearer ' + sessionTokenValue() } }
                );
                if (!response.ok) {
                    var message = 'HTTP ' + response.status;
                    try {
                        var data = await response.json();
                        if (data && data.message) {
                            message = data.message;
                        }
                    } catch (error) {
                        // réponse non JSON (proxy, erreur HTML…) : on garde le code HTTP
                    }
                    throw new Error(message);
                }

                var blob = await response.blob();
                var url = window.URL.createObjectURL(blob);
                var link = document.createElement('a');
                link.href = url;
                link.download = name;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            } catch (error) {
                setStatus('Téléchargement de « ' + name + ' » impossible : ' + error.message, 'danger');
            } finally {
                button.disabled = false;
                button.textContent = label;
            }
        }

        tbody.addEventListener('click', function (event) {
            var button = event.target.closest ? event.target.closest('button[data-archive-name]') : null;
            if (!button) {
                return;
            }
            download(button);
        });

        refreshBackupDownloads = load;
        load();
    }

    /* ------------------------------------------------------------------ *
     *  Téléversement d'archives dans le répertoire des sauvegardes
     * ------------------------------------------------------------------ */

    // Doit rester ≤ BACKUP_UPLOAD_MAX_BYTES côté API (et client_max_body_size
    // côté nginx) : au-delà, le navigateur verrait la connexion coupée.
    var UPLOAD_MAX_BYTES = 2 * 1024 * 1024 * 1024;

    function setupBackupUpload() {
        var button = document.getElementById('backup-upload');
        var input = document.getElementById('backup-upload-file');
        var status = document.getElementById('backup-upload-status');

        if (!button || !input || !status) {
            return;
        }

        function setStatus(message, type) {
            status.className = type ? 'mt-2 alert alert-' + type : 'mt-2';
            status.textContent = message || '';
        }

        function parseResponse(text) {
            try {
                return JSON.parse(text);
            } catch (error) {
                return null;
            }
        }

        function upload(file) {
            if (file.size > UPLOAD_MAX_BYTES) {
                setStatus('« ' + file.name + ' » dépasse la taille maximale (2 Go).', 'danger');
                return;
            }

            button.disabled = true;
            setStatus('Envoi de « ' + file.name + ' » (' + formatSize(file.size) + ')…', 'info');

            // Le dump peut peser plusieurs centaines de Mo : envoi du fichier
            // en corps de requête brut (l'API le lit en flux) via XMLHttpRequest
            // pour bénéficier de la progression d'upload.
            var xhr = new XMLHttpRequest();
            xhr.open('POST', baseUrl() + '/admin/jobs/backups?filename=' + encodeURIComponent(file.name));
            xhr.setRequestHeader('Authorization', 'Bearer ' + sessionTokenValue());

            xhr.upload.addEventListener('progress', function (event) {
                if (!event.lengthComputable) {
                    return;
                }
                var percent = Math.round((event.loaded * 100) / event.total);
                setStatus('Envoi de « ' + file.name + ' »… ' + percent
                    + ' % (' + formatSize(event.loaded) + ' / ' + formatSize(event.total) + ')', 'info');
            });

            xhr.addEventListener('load', function () {
                button.disabled = false;
                var data = parseResponse(xhr.responseText);
                if (xhr.status === 201) {
                    setStatus(
                        'Archive importée' + (data && data.name ? ' : ' + data.name : '')
                        + (data && data.size ? ' (' + formatSize(data.size) + ')' : '')
                        + '. Elle est disponible en téléchargement et pour la restauration.',
                        'success'
                    );
                    if (refreshBackupDownloads) {
                        refreshBackupDownloads();
                    }
                    if (refreshRestoreArchives) {
                        refreshRestoreArchives();
                    }
                } else {
                    var message;
                    if (xhr.status === 401 || xhr.status === 403) {
                        message = "Vous n'avez pas l'autorisation de téléverser des archives.";
                    } else {
                        message = data && data.message ? data.message : ('HTTP ' + xhr.status);
                    }
                    setStatus('Import impossible : ' + message, 'danger');
                }
            });

            xhr.addEventListener('error', function () {
                button.disabled = false;
                setStatus('Import interrompu : la connexion a été perdue pendant l\'envoi '
                    + '(taille refusée par le serveur ou réseau instable).', 'danger');
            });

            xhr.addEventListener('abort', function () {
                button.disabled = false;
                setStatus('Import annulé.', 'warning');
            });

            xhr.send(file);
        }

        button.addEventListener('click', function () {
            input.value = '';
            input.click();
        });

        input.addEventListener('change', function () {
            var file = input.files && input.files[0];
            if (file) {
                upload(file);
            }
        });
    }

    /* ------------------------------------------------------------------ *
     *  Restauration de la base (job « restore » — opération destructive)
     * ------------------------------------------------------------------ */

    function setupRestore() {
        var card = document.getElementById('restore-card');
        var archiveSelect = document.getElementById('restore-archive');
        var preBackupCheck = document.getElementById('restore-prebackup');
        var confirmInput = document.getElementById('restore-confirm');
        var button = document.getElementById('restore-start');
        var status = document.getElementById('restore-status');

        if (!card || !archiveSelect || !confirmInput || !button || !status) {
            return;
        }

        function setStatus(message, type) {
            status.className = type ? 'mt-3 alert alert-' + type : 'mt-3';
            status.textContent = message || '';
        }

        function updateButtonState() {
            var ready = confirmInput.value.trim() === 'RESTAURER'
                && archiveSelect.value !== '';
            button.disabled = !ready;
        }

        async function loadArchives() {
            try {
                var archives = await apiFetch('/admin/jobs/backups');
                archiveSelect.innerHTML = '';

                if (!archives || archives.length === 0) {
                    var empty = document.createElement('option');
                    empty.value = '';
                    empty.textContent = 'Aucune archive disponible';
                    archiveSelect.appendChild(empty);
                    return;
                }

                archives.forEach(function (archive) {
                    var option = document.createElement('option');
                    option.value = archive.name;
                    option.textContent = archive.name +
                        ' — ' + formatSize(archive.size) +
                        ' (' + formatDate(archive.modifiedAt) + ')';
                    archiveSelect.appendChild(option);
                });
            } catch (error) {
                archiveSelect.innerHTML = '<option value="">Erreur de chargement</option>';
                if (error.status !== 401 && error.status !== 403) {
                    setStatus('Archives indisponibles : ' + error.message, 'warning');
                }
            } finally {
                updateButtonState();
            }
        }

        confirmInput.addEventListener('input', updateButtonState);
        archiveSelect.addEventListener('change', updateButtonState);

        button.addEventListener('click', async function () {
            var archive = archiveSelect.value;
            if (!archive || confirmInput.value.trim() !== 'RESTAURER') {
                return;
            }
            if (!confirm('Toutes les données actuelles seront remplacées par le contenu de « '
                + archive + ' ». Confirmer la restauration ?')) {
                return;
            }
            if (typeof launchJobType !== 'function') {
                setStatus('Panneau des traitements longs indisponible.', 'danger');
                return;
            }

            button.disabled = true;
            try {
                var result = await launchJobType('restore', setStatus, {
                    archive: archive,
                    preBackup: preBackupCheck ? preBackupCheck.checked : true,
                    confirm: 'RESTAURER'
                });
                if (!result.reused) {
                    setStatus(
                        'Restauration lancée : suivez sa progression dans le panneau '
                        + '« Traitements longs » ci-dessus. Ne redémarrez pas le worker '
                        + 'pendant la phase de restauration.',
                        'warning'
                    );
                }
                confirmInput.value = '';
            } catch (error) {
                // Déjà affiché par launch().
            } finally {
                updateButtonState();
            }
        });

        refreshRestoreArchives = loadArchives;
        loadArchives();
    }

    setupIndexDb();
    setupJobs();
    setupBackup();
    setupBackupDownloads();
    setupBackupUpload();
    setupRestore();
})();
