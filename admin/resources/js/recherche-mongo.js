//{"identity.gender":{"$elemMatch": {"value":"female"}}}

window.app = new Vue({
    el: '#app',
    data: {
        searchRequest: {
            //find: '{"reference":"487"}',
            find: '{"identity.gender":{"$elemMatch": {"value":"female"}}}',
            projection: '{"_id":0,"raw":0}',
        },
        searching: false,
        exporting: false,
        vizualisation : false,
        items: [],
        fields: [
            { key: 'reference', label: 'Référence', sortable: true, sortDirection: 'desc' },
            { key: 'identity.name[0].value', label: 'Nom', sortable: true, sortDirection: 'desc' },
            { key: 'identity.status[0].value', label: 'Statut', sortable: true, sortDirection: 'desc' },
            { key: 'identity.shortDescription[0].value', label: 'Description', sortable: true, sortDirection: 'desc' },
            { key: 'datesOfActivity', label: 'Date d\'activité', sortable: true, sortDirection: 'desc' },
            { key: 'extras.activityMediane', label: 'Mediane', sortable: true, class: 'text-center' },
            { key: 'curriculum.grades[0].value', label: 'Dernier grade', sortable: true, class: 'text-center' },
            { key: 'nbGrades', label: 'Nombre de grades', sortable: true, class: 'text-center' },
            { key: 'originDiocese', label: 'Diocèse d\'origine', sortable: true, class: 'text-center' },
            { key: 'updateDate', label: 'Dernière actualisation', sortable: true, class: 'text-center' },
            { key: 'actions', label: 'Actions' }
        ],
        totalRows: 0,
        currentPage: 1,
        perPage: 10,
        pageOptions: [5, 10, 15, { value: 100, text: "Show a lot" }],
        sortBy: '',
        sortDesc: false,
        sortDirection: 'asc',
        filter: null,
        filterOn: [],
        infoModal: {
            id: 'info-modal',
            title: '',
            content: ''
        },
    },
    methods: {
        onFiltered : function(filteredItems) {
            // Trigger pagination to update the number of buttons/pages due to filtering
            this.totalRows = filteredItems.length
            this.currentPage = 1
        },
        exportJSON : async function(){
            // DL JSON
            try {
                var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.items));
                var dlAnchorElem = document.getElementById('downloadAnchorElem');
                dlAnchorElem.setAttribute("href",     dataStr     );
                dlAnchorElem.setAttribute("download", "results.json");
                dlAnchorElem.click();
            } catch (err) {
                console.error(err);
            }
        },
        exportCSV : async function(){
            console.log("executeQuery and exportCSV");

            this.exporting = true;
            var request = {
                collection: "prosopography",
                skip : 0,
                limit: 0,
                format: "csv"
            };
            request.find = JSON.parse(this.searchRequest.find);
            request.projection = JSON.parse(this.searchRequest.projection);
            var bodyR = JSON.stringify(request);
            console.log(bodyR);
            const result = await fetch(`${apiUrl}/mongo/executeQuery`,{
                'method':'POST',
                'headers':{
                    'Content-Type':'application/json',
                },
                'body': bodyR,
            });
            this.exporting = false;
            var csv = await result.text();

            var dataStr = "data:text/csv;charset=utf-8," + encodeURI(csv);
            var dlAnchorElem = document.getElementById('downloadAnchorElem');
            dlAnchorElem.setAttribute("href",     dataStr     );
            dlAnchorElem.setAttribute("download", "results.csv");
            dlAnchorElem.click();


        },
        executeQuery : async function(){
            console.log("executeQuery");
            // Booléen pour le chargement des données (animation)
            this.searching = true;

            var request = {
                collection: "prosopography",
                skip : 0,
                limit: 0
            };
            request.find = JSON.parse(this.searchRequest.find);
            request.projection = JSON.parse(this.searchRequest.projection);
            var bodyR = JSON.stringify(request);
            console.log(bodyR);
            const result = await fetch(`${apiUrl}/mongo/executeQuery`,{
                'method':'POST',
                'headers':{
                    'Content-Type':'application/json',
                },
                'body': bodyR,
            });
            this.items = await result.json();
            this.totalRows = this.items.length;
            this.searching = false;
        },
    },
    computed: {
        sortOptions() {
            // Create an options list from our fields
            return this.fields
                .filter(f => f.sortable)
                .map(f => {
                    return { text: f.label, value: f.key }
                })
        }
    }
});



