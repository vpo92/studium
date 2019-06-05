
var buttons =      [
                {
                    extend: 'copyHtml5',
                    text:      'Copier <i class="fas fa-copy"></i>',
                    titleAttr: 'Copier',
                    className: 'btn btn-secondary'
                } ,
                {
                    extend: 'csv',
                    text:      'Exporter en CSV <i class="fas fa-file-csv"></i>',
                    titleAttr: 'CSV',
                    className: 'btn btn-secondary'
                } ,
                {
                    extend: 'excelHtml5',
                    text:      'Exporter vers Excel <i class="fas fa-file-excel"></i>',
                    titleAttr: 'Excel',
                    className: 'btn btn-secondary'
                } ,
                {
                    extend: 'pdfHtml5',
                    text:      'Exporter en PDF <i class="fas fa-file-pdf"></i>',
                    titleAttr: 'PDF',
                    className: 'btn btn-secondary'
                }
            ]

$(document).ready(function() {
  $("#resultTable").DataTable({
    dom: 'Bfrtip',
    buttons: buttons
  });
} );
