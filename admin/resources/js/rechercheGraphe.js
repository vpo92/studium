




new Vue ({
    el : '#graphe',
    data : {
        chartLabels : null,
        chartCounts : null,
        resultsGraph: null,
        dataTable : null,
        searching : false,
        arrayMediane : [],
    },
    methods : {
        //permet de créer le graphique et défini ses options
        //initialise le graphique avec les données de médiane de chaques fiches
        async initData(){

            const resultLabel = await fetch(`${apiUrl}/prosopography/initGraph`,{
                'method':'POST',
                'headers':{
                    'Content-Type':'application/json',
                },
                'body': JSON.stringify(this.searchRequest),
            });

            let mediane = [];
            let counts = [];
            let scatter = [];
            let aux = [];

            this.chartLabels = await resultLabel.json();

            this.chartLabels.forEach(element => {
                scatter.push({x:element._id, y:element.count});
                aux.push({y: element.count, label: element._id});
                mediane.push(element._id);
                counts.push(element.count);
            })

            this.chartLabels = mediane;
            this.chartCounts = counts;
            //this.chartCounts = scatter;
            //this.chartLabels = aux;
        },
        redraw : function () {
            this.$nextTick(function () {
                this.dataTable = $("#resultTable3").DataTable({
                    dom: 'Bfrtip',
                    buttons: buttons,
                    language: lang,
                });
            })
        },
        createGraph : function () {

            var myPlot = document.getElementById('chartContainer');

            colors = [];
            this.chartLabels.forEach(function () {
                colors.push('#00000');
            });

            var data = [
                {
                    x: this.chartLabels,
                    y: this.chartCounts,
                    type: 'bar',
                    mode:'markers',
                    marker:{color:colors}
                }
            ];


            var layout = {
                title: 'Nombre de fiche par médiane d\'activité',
                showlegend: false,
                xaxis: {
                    title: {
                        text: 'Médiane',
                        font: {
                            family: 'Courier New, monospace',
                            size: 18,
                            color: '#7f7f7f'
                        }
                    },
                },
                yaxis: {
                    title: {
                        text: 'Nombre de personne',
                        font: {
                            family: 'Courier New, monospace',
                            size: 18,
                            color: '#7f7f7f'
                        }
                    }
                }
            };

            Plotly.newPlot('chartContainer', data, layout, {modeBarButtonsToRemove: ['lasso2d'], scrollZoom: true, displaylogo : false,doubleClick: false});

            myPlot.on('plotly_click', (data) => {
                var pn='',
                    tn='',
                    colors=[];
                for(var i=0; i < data.points.length; i++){
                    pn = data.points[i].pointNumber;
                    tn = data.points[i].curveNumber;
                    colors = data.points[i].data.marker.color;
                };

                if (colors[pn]==='red'){
                    colors[pn] = '#00000';
                    this.removeMediane(data.points[0].x);
                }else {
                    colors[pn] = 'red';
                    this.addMediane(data.points[0].x);
                }


                var update = {'marker':{color: colors}};
                Plotly.restyle('chartContainer', update, [tn]);

            });



            myPlot.on('plotly_selected', (eventData) => {



                if (eventData!==undefined){

                    this.arrayMediane = [];
                    var colors = [];
                    for(var i = 0; i < this.chartLabels.length; i++) colors.push("orange");

                    eventData.points.forEach((pt) => {
                        colors[pt.pointNumber] = "red";
                        this.arrayMediane.push(pt.x);
                    });
                    this.arrayMediane.shift();
                    Plotly.restyle('chartContainer', 'marker.color', [colors], [0]);
                    this.search();
                } else {
                    this.arrayMediane = [];
                    this.createGraph();
                }

            });

        }
        ,
        addMediane : function(mediane){
            this.arrayMediane.push(mediane);
            this.search();
        },
        removeMediane : function (mediane) {
            let aux = [];
            this.arrayMediane.forEach(function (e) {
                if (e!==mediane){
                    aux.push(e);
                }
            })
            this.arrayMediane = aux;
            this.search();
        },
        search : async function (){
            this.searching = true;
            if (this.arrayMediane.length === 1){
                this.searchOne(this.arrayMediane[0]);
            } else if (this.arrayMediane.length > 1){
                this.searchMany();
            }
            this.searching = false;
        },
        searchMany : async function () {

            this.dataTable = $('#resultTable3').DataTable();
            this.dataTable.destroy();

            let searchRequest = {
                activityMediane: {
                    from: this.arrayMediane[0],
                    to: this.arrayMediane[0],
                },
                activity: {
                    start: {
                        from: null,
                        to: null,
                    },
                    end: {
                        from: null,
                        to: null,
                    }
                },
                status: [],
                sexe: [],
                graph: true,
                grade: null,
                discipline: null,
                name: null,
                prosopography: []
            };

            for (i = 1; i<this.arrayMediane.length;i++){
                searchRequest.prosopography.push({
                    section: 'extras',
                    subSection: 'activityMediane',
                    operator: 'OR',
                    matchType: 'CONTAINS',
                    value: this.arrayMediane[i]
                })
            };


            const result = await fetch(`${apiUrl}/prosopography/search/advanced`, {
                'method': 'POST',
                'headers': {
                    'Content-Type': 'application/json',
                },
                'body': JSON.stringify(searchRequest)
            });

            this.resultsGraph = await result.json();

            this.redraw();


        },
        searchOne : async function(mediane) {


            this.dataTable = $('#resultTable3').DataTable();
            this.dataTable.destroy();

            let searchRequest = {
                activityMediane: {
                    from: mediane,
                    to: mediane,
                },
                activity: {
                    start: {
                        from: null,
                        to: null,
                    },
                    end: {
                        from: null,
                        to: null,
                    }
                },
                status: [],
                sexe: [],
                graph: true,
                grade: null,
                discipline: null,
                name: null,
                prosopography: [{
                    section: null,
                    subSection: null,
                    operator: "AND",
                    matchType: null,
                    value: null,
                }]
            };

            const result = await fetch(`${apiUrl}/prosopography/search/advanced`, {
                'method': 'POST',
                'headers': {
                    'Content-Type': 'application/json',
                },
                'body': JSON.stringify(searchRequest)
            });

            this.resultsGraph = await result.json();

            this.redraw();
        }

    },
    mounted : function(){
        // on initialise le graphe puis on l'affiche
        this.initData().then( data => {
            this.createGraph();
        });



        // créer la datatable pour le graphe
        this.$nextTick(function () {
            this.dataTable = $("#resultTable3").DataTable({
                dom: 'Bfrtip',
                buttons: buttons,
                language: lang,
            });
        });
    }

})

