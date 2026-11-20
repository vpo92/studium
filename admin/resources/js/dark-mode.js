(function () {
    'use strict';

    // Même clé que le script « anti-flash » du <head> (header.php).
    var STORAGE_KEY = 'studium-dark-mode';
    var root = document.documentElement;

    function setDark(dark) {
        root.classList.toggle('dark', dark);
        // Bootstrap >= 5.3 : thème natif (variables --bs-*) + thème sombre
        // des composants (navbar, tableaux, formulaires, etc.).
        root.setAttribute('data-bs-theme', dark ? 'dark' : 'light');
        try {
            localStorage.setItem(STORAGE_KEY, dark ? '1' : '0');
        } catch (error) {
            // localStorage indisponible (navigation privée…) : le thème
            // s'applique quand même pour la page courante.
        }
    }

    function init() {
        var toggle = document.getElementById('dark-mode-switch');
        if (!toggle) {
            return;
        }

        // Synchroniser le switch avec l'état appliqué par le script du <head>.
        toggle.checked = root.classList.contains('dark');

        toggle.addEventListener('change', function () {
            setDark(toggle.checked);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
