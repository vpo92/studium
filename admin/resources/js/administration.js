(function () {
    var button = document.getElementById('reindex-db');
    var status = document.getElementById('reindex-status');

    if (!button || !status) {
        return;
    }

    function setStatus(message, type) {
        status.className = 'mt-3 alert alert-' + type;
        status.textContent = message;
    }

    function clearStatus() {
        status.className = 'mt-3';
        status.textContent = '';
    }

    function setBusy(busy) {
        button.disabled = busy;
        button.textContent = busy
            ? 'Réindexation en cours...'
            : 'Re-indexation complète de la base';
    }

    button.addEventListener('click', async function () {
        if (!confirm('Confirmez-vous la réindexation complète de la base ?')) {
            return;
        }

        clearStatus();
        setBusy(true);

        try {
            var baseUrl = String(apiUrl).trim();
            var token = String(sessionToken).trim();

            var response = await fetch(baseUrl + '/admin/indexDB', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: '{}'
            });

            if (response.status === 401 || response.status === 403) {
                setStatus("Vous n'avez pas l'autorisation de réindexer la base.", 'danger');
                return;
            }

            if (!response.ok) {
                throw new Error('HTTP ' + response.status);
            }

            setStatus('Réindexation de la base terminée.', 'success');
        } catch (error) {
            console.error('reindex error', error);
            setStatus('Erreur lors de la réindexation de la base.', 'danger');
        } finally {
            setBusy(false);
        }
    });
})();
