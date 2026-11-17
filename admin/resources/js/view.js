if (typeof globalOpusList !== 'undefined' && globalOpusList != null && globalOpusList.length > 0) {

  var map = L.map('map').setView([47.4700, 6.8116], 7);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  var latLngs = [];

    for(var i = 0; i < globalOpusList.length; i++){

        var m  = globalOpusList[i];
        console.log(m);
        var mar = L.marker([m.x, m.y]);
        mar.addTo(map)
            .bindPopup(m.Ville)
            .openPopup();
        latLngs.push(mar.getLatLng());

    }

    var markerBounds = L.latLngBounds(latLngs);
    map.fitBounds(markerBounds);
}else{
  document.getElementById("visuGeo").style.display = 'none';
}

/**
 * Onglet « Graphe » de la fiche prosopographique.
 *
 * Le graphe est chargé à la première ouverture de l'onglet depuis la route
 * `/prosopography/{reference}/graph`, puis rendu avec Cytoscape.
 */
(function () {
    'use strict';

    var container = document.getElementById('prosopography-graph');
    if (!container) {
        return;
    }

    var reference = (container.getAttribute('data-reference') || '').trim();
    var statusBox = document.getElementById('prosopography-graph-status');
    var legendBox = document.getElementById('prosopography-graph-legend');
    var fitButton = document.getElementById('prosopography-graph-fit');
    var reloadButton = document.getElementById('prosopography-graph-reload');
    var graphTab = document.getElementById('graph-tab');

    var cy = null;
    var loaded = false;
    var loading = false;

    var GROUP_COLORS = {
        PhysicalPerson: '#3f51b5',
        Name: '#7986cb',
        Role: '#90a4ae',
        Factoid: '#ffb74d',
        FactoidType: '#bcaaa4',
        Document: '#4db6ac',
        Person: '#9575cd',
        Place: '#81c784',
        Zone: '#aed581',
        MoralEntity: '#ba68c8',
        Exemplaire: '#b0bec5',
        Edition: '#b0bec5',
        Incipit: '#b0bec5'
    };

    var GROUP_LABELS = {
        PhysicalPerson: 'Personne',
        Name: 'Nom',
        Role: 'Rôle',
        Factoid: 'Fait',
        FactoidType: 'Type de fait',
        Document: 'Document',
        Person: 'Personne citée',
        Place: 'Lieu',
        Zone: 'Zone',
        MoralEntity: 'Institution',
        Exemplaire: 'Témoin',
        Edition: 'Édition',
        Incipit: 'Incipit'
    };

    var EDGE_LABELS = {
        HAS_FACTOID: 'a pour fait',
        MAIN_NAME: 'nom principal',
        NAMED: 'nom',
        AT_PLACE: 'lieu',
        IN_ZONE: 'zone',
        HAS_ROLE_IN: 'rôle dans',
        CITES: 'cite',
        REFERS_TO: 'référence',
        HAS_ROLE: 'rôle',
        IS_TYPE_OF: 'type',
        PRODUCED: 'a produit',
        HAS_VERSION: 'version',
        MENTIONS: 'mentionne',
        HAS_WITNESS: 'témoin',
        HAS_EDITION: 'édition',
        PUBLISHED_AT: 'publié à',
        HAS_INCIPIT: 'incipit',
        HAS_BIBLIOGRAPHY: 'bibliographie',
        SOURCED_BY: 'source'
    };

    function apiBaseUrl() {
        var base = typeof window.apiUrl === 'string' ? window.apiUrl : '';
        return base.trim().replace(/\/+$/, '');
    }

    function setStatus(message, level) {
        if (!statusBox) {
            return;
        }
        if (!message) {
            statusBox.textContent = '';
            statusBox.classList.add('d-none');
            return;
        }
        statusBox.className = 'alert alert-' + (level || 'info');
        statusBox.textContent = message;
    }

    function updateButtons() {
        if (reloadButton) {
            reloadButton.disabled = loading;
        }
        if (fitButton) {
            fitButton.disabled = loading || !cy;
        }
    }

    function stringValue(value) {
        if (value === null || value === undefined) {
            return '';
        }
        if (Array.isArray(value)) {
            return value.map(stringValue).filter(function (item) {
                return item !== '';
            }).join(', ');
        }
        if (typeof value === 'object') {
            if (value.value !== undefined) {
                return stringValue(value.value);
            }
            if (value.data !== undefined) {
                return stringValue(value.data);
            }
            return '';
        }
        return String(value).trim();
    }

    function truncate(value, maxLength) {
        if (value.length <= maxLength) {
            return value;
        }
        return value.slice(0, maxLength - 1) + '…';
    }

    function humanize(value) {
        return String(value || '')
            .replace(/_/g, ' ')
            .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
            .replace(/\s+/g, ' ')
            .trim()
            .toLowerCase();
    }

    function nodeLabel(node) {
        var properties = node.properties || {};
        var candidates = [
            'name',
            'title',
            'completeName',
            'mainTitle',
            'label',
            'value',
            'role_label',
            'role_description',
            'place_description',
            'zone_description',
            'description',
            'shortdesc',
            'text',
            'reference',
            'incipit_id'
        ];

        for (var i = 0; i < candidates.length; i++) {
            var text = stringValue(properties[candidates[i]]);
            if (text) {
                return truncate(text, 80);
            }
        }

        var normKey = stringValue(properties.norm_key);
        if (normKey) {
            var parts = normKey.split(':').filter(function (part) {
                return part !== '';
            });
            if (parts.length > 0) {
                return truncate(parts[parts.length - 1], 80);
            }
        }

        return (node.labels && node.labels[0]) || 'Nœud';
    }

    function edgeLabel(link) {
        var properties = link.properties || {};
        var base = EDGE_LABELS[link.type] || humanize(link.type);
        var detail = stringValue(properties.role_label) ||
            stringValue(properties.role) ||
            stringValue(properties.category) ||
            stringValue(properties.edition_type) ||
            stringValue(properties.kind);

        if (detail) {
            return truncate(base + ' · ' + humanize(detail), 60);
        }
        return base;
    }

    function groupColor(group) {
        return GROUP_COLORS[group] || '#78909c';
    }

    function groupLabel(group) {
        return GROUP_LABELS[group] || group;
    }

    function buildElements(graph) {
        var nodesById = {};
        var elements = [];

        (graph.nodes || []).forEach(function (node, index) {
            var id = 'node-' + index;
            var group = (node.labels && node.labels[0]) || 'Node';
            nodesById[String(node.id)] = id;
            elements.push({
                group: 'nodes',
                data: {
                    id: id,
                    label: nodeLabel(node),
                    group: group,
                    color: groupColor(group),
                    properties: node.properties || {}
                }
            });
        });

        (graph.links || []).forEach(function (link, index) {
            var source = nodesById[String(link.source)];
            var target = nodesById[String(link.target)];
            if (!source || !target) {
                return;
            }
            elements.push({
                group: 'edges',
                data: {
                    id: 'edge-' + index,
                    source: source,
                    target: target,
                    label: edgeLabel(link),
                    type: link.type || '',
                    properties: link.properties || {}
                }
            });
        });

        return elements;
    }

    function renderLegend(nodes) {
        if (!legendBox) {
            return;
        }

        var counts = {};
        (nodes || []).forEach(function (node) {
            var group = (node.labels && node.labels[0]) || 'Node';
            counts[group] = (counts[group] || 0) + 1;
        });

        legendBox.innerHTML = '';
        Object.keys(counts).sort().forEach(function (group) {
            var item = document.createElement('span');
            item.className = 'app-graph-legend-item';

            var swatch = document.createElement('span');
            swatch.className = 'app-graph-legend-swatch';
            swatch.style.backgroundColor = groupColor(group);

            var label = document.createElement('span');
            label.textContent = groupLabel(group) + ' (' + counts[group] + ')';

            item.appendChild(swatch);
            item.appendChild(label);
            legendBox.appendChild(item);
        });
    }

    function renderGraph(graph) {
        if (cy) {
            cy.destroy();
            cy = null;
        }

        var elements = buildElements(graph);
        if (elements.length === 0) {
            if (legendBox) {
                legendBox.innerHTML = '';
            }
            setStatus('Le graphe de cette fiche ne contient aucun élément.', 'warning');
            updateButtons();
            return false;
        }

        cy = window.cytoscape({
            container: container,
            elements: elements,
            wheelSensitivity: 0.2,
            style: [
                {
                    selector: 'node',
                    style: {
                        'background-color': 'data(color)',
                        'label': 'data(label)',
                        'color': '#263238',
                        'font-size': 10,
                        'font-family': 'Poppins, sans-serif',
                        'text-valign': 'bottom',
                        'text-halign': 'center',
                        'text-margin-y': 4,
                        'text-wrap': 'wrap',
                        'text-max-width': 120,
                        'min-zoomed-font-size': 7,
                        'width': 28,
                        'height': 28,
                        'border-width': 2,
                        'border-color': '#ffffff'
                    }
                },
                {
                    selector: 'node[group = "PhysicalPerson"]',
                    style: {
                        'width': 52,
                        'height': 52,
                        'font-size': 12,
                        'font-weight': 'bold',
                        'border-width': 3,
                        'border-color': '#1a237e'
                    }
                },
                {
                    selector: 'node[group = "Name"]',
                    style: {
                        'shape': 'round-rectangle',
                        'width': 42,
                        'height': 26
                    }
                },
                {
                    selector: 'node[group = "Factoid"]',
                    style: {
                        'shape': 'round-rectangle',
                        'width': 44,
                        'height': 28
                    }
                },
                {
                    selector: 'node[group = "FactoidType"], node[group = "Role"]',
                    style: {
                        'shape': 'hexagon'
                    }
                },
                {
                    selector: 'node[group = "Document"]',
                    style: {
                        'shape': 'rectangle',
                        'width': 48,
                        'height': 30
                    }
                },
                {
                    selector: 'node[group = "Place"]',
                    style: {
                        'shape': 'diamond'
                    }
                },
                {
                    selector: 'node[group = "Zone"]',
                    style: {
                        'shape': 'round-diamond'
                    }
                },
                {
                    selector: 'node[group = "MoralEntity"]',
                    style: {
                        'shape': 'hexagon'
                    }
                },
                {
                    selector: 'node[group = "Exemplaire"], node[group = "Edition"], node[group = "Incipit"]',
                    style: {
                        'shape': 'tag',
                        'width': 40,
                        'height': 26
                    }
                },
                {
                    selector: 'edge',
                    style: {
                        'width': 1.5,
                        'line-color': '#b0bec5',
                        'target-arrow-color': '#b0bec5',
                        'target-arrow-shape': 'triangle',
                        'arrow-scale': 0.8,
                        'curve-style': 'bezier',
                        'label': 'data(label)',
                        'color': '#607d8b',
                        'font-size': 8,
                        'font-family': 'Poppins, sans-serif',
                        'text-rotation': 'autorotate',
                        'text-background-color': '#fafafa',
                        'text-background-opacity': 0.85,
                        'text-background-padding': '2px',
                        'text-wrap': 'wrap',
                        'text-max-width': 110,
                        'min-zoomed-font-size': 7
                    }
                },
                {
                    selector: 'edge[type = "HAS_FACTOID"]',
                    style: {
                        'line-color': '#ffb74d',
                        'target-arrow-color': '#ffb74d'
                    }
                },
                {
                    selector: 'edge[type = "PRODUCED"]',
                    style: {
                        'line-color': '#4db6ac',
                        'target-arrow-color': '#4db6ac'
                    }
                },
                {
                    selector: 'edge[type = "SOURCED_BY"], edge[type = "HAS_BIBLIOGRAPHY"]',
                    style: {
                        'line-style': 'dashed',
                        'target-arrow-shape': 'none'
                    }
                },
                {
                    selector: 'node:selected',
                    style: {
                        'border-width': 4,
                        'border-color': '#ff5722'
                    }
                }
            ],
            layout: {
                name: 'cose',
                animate: false,
                fit: true,
                padding: 30,
                nodeRepulsion: 450000,
                idealEdgeLength: 90,
                edgeElasticity: 100,
                gravity: 80,
                numIter: 1000,
                randomize: true,
                componentSpacing: 80
            }
        });

        renderLegend(graph.nodes || []);
        setStatus('');
        updateButtons();
        return true;
    }

    async function loadGraph(force) {
        if (loading || (loaded && !force)) {
            return;
        }
        if (!reference) {
            setStatus('La référence de la fiche est introuvable.', 'danger');
            return;
        }
        if (typeof window.cytoscape !== 'function') {
            setStatus('La librairie Cytoscape n\'a pas pu être chargée.', 'danger');
            return;
        }

        loading = true;
        updateButtons();
        setStatus('Chargement du graphe…', 'info');

        var url = apiBaseUrl() + '/prosopography/' + encodeURIComponent(reference) + '/graph';

        try {
            var response = await fetch(url, {
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.status === 404) {
                setStatus('Aucun graphe n\'a été trouvé pour cette fiche dans Neo4j.', 'warning');
                return;
            }
            if (!response.ok) {
                throw new Error('HTTP ' + response.status);
            }

            var graph = await response.json();
            if (!graph || !graph.nodes || graph.nodes.length === 0) {
                setStatus('Le graphe de cette fiche est vide.', 'warning');
                return;
            }

            if (renderGraph(graph)) {
                loaded = true;
            }
        } catch (error) {
            console.error('Erreur lors du chargement du graphe', error);
            setStatus('Impossible de charger le graphe de la fiche. Veuillez réessayer.', 'danger');
        } finally {
            loading = false;
            updateButtons();
        }
    }

    if (reloadButton) {
        reloadButton.addEventListener('click', function () {
            loadGraph(true);
        });
    }

    if (fitButton) {
        fitButton.addEventListener('click', function () {
            if (cy) {
                cy.fit(cy.elements(), 30);
            }
        });
    }

    if (graphTab && window.jQuery) {
        window.jQuery(graphTab).on('shown.bs.tab', function () {
            loadGraph(false);
        });
    } else if (graphTab) {
        graphTab.addEventListener('click', function () {
            window.setTimeout(function () {
                loadGraph(false);
            }, 150);
        });
    }

    if (window.location.hash === '#graph' && window.jQuery) {
        window.jQuery('#graph-tab').tab('show');
    }

    updateButtons();
})();
