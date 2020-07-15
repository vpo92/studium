
var buttons = [
    {
        extend: 'copyHtml5',
        text:      'Copier <i class="fas fa-copy"></i>',
        titleAttr: 'Copier',
        className: 'btn btn-secondary',
        exportOptions: {
            columns: ':visible'
        }
    } ,
    {
        extend: 'csv',
        text:      'Exporter en CSV <i class="fas fa-file-csv"></i>',
        titleAttr: 'CSV',
        className: 'btn btn-secondary',
        exportOptions: {
            columns: ':visible'
        }
    } ,
    {
        extend: 'excelHtml5',
        text:      'Exporter vers Excel <i class="fas fa-file-excel"></i>',
        titleAttr: 'Excel',
        className: 'btn btn-secondary',
        exportOptions: {
            columns: ':visible'
        }
    } ,
    {
        extend: 'pdfHtml5',
        text:      'Exporter en PDF <i class="fas fa-file-pdf"></i>',
        titleAttr: 'PDF',
        className: 'btn btn-secondary',
        exportOptions: {
            columns: ':visible'
        }
    },
    {
        extend: 'colvis',
        text: 'Visibilité des colonnes',
        className: 'btn btn-secondary',

    }
];


var lang = {
    "sProcessing":     "Traitement en cours...",
    "sSearch":         "Rechercher&nbsp;:",
    "slengthMenu":     "Afficher _MENU_ &eacute;l&eacute;ments",
    "sInfo":           "Affichage de l'&eacute;l&eacute;ment _START_ &agrave; _END_ sur _TOTAL_ &eacute;l&eacute;ments",
    "sInfoEmpty":      "Affichage de l'&eacute;l&eacute;ment 0 &agrave; 0 sur 0 &eacute;l&eacute;ment",
    "sInfoFiltered":   "(filtr&eacute; de _MAX_ &eacute;l&eacute;ments au total)",
    "sInfoPostFix":    "",
    "sLoadingRecords": "Chargement en cours...",
    "sZeroRecords":    "Aucun &eacute;l&eacute;ment &agrave; afficher",
    "sEmptyTable":     "Aucune donn&eacute;e disponible dans le tableau",
    "oPaginate": {
        "sFirst":      "Premier",
        "sPrevious":   "Pr&eacute;c&eacute;dent",
        "sNext":       "Suivant",
        "sLast":       "Dernier"
    },
    "oAria": {
        "sSortAscending":  ": activer pour trier la colonne par ordre croissant",
        "sSortDescending": ": activer pour trier la colonne par ordre d&eacute;croissant"
    },
    "select": {
        "rows": {
            _: "%d lignes séléctionnées",
            0: "Aucune ligne séléctionnée",
            1: "1 ligne séléctionnée"
        }
    }
};

$(document).ready(function() {
    $("#resultTable").DataTable({
        dom: 'Bfrtip',
        buttons: buttons,
        language: lang
    });

    /*$("#resultTable3").DataTable({
        dom: 'Bfrtip',
        buttons: buttons,
        language: lang,
        ajax: {
            url: `${apiUrl}/prosopography/`,
            type: 'GET',
            async: false
        },
        columns : [
            {data: 'reference' },
            {data: 'identity.name[0].value' },
            {data: 'identity.status[0].value'},
            {data: 'identity.shortDescription[0].value' },
            {data: 'reference'},
            {data: 'reference'},
            {data: 'reference'},
            {data: 'reference'},
            {data: 'reference'},
            {data: 'reference'},
            {data: 'reference'},
        ]
    })*/
});
