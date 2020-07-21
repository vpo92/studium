new Vue ({
    el : '#graphe',
    data : {
        chartLabels : null,
        chartCounts : null,
        resultsGraph: null,
        dataTable : null,
        searching : false,
    },
    methods : {
        //permet de créer le graphique et défini ses options
        createChart() {
            const ctx = document.getElementById('myChart');
            const myChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: this.chartLabels,
                    datasets: [{
                        label: 'Nombre de fiches',
                        data: this.chartCounts,
                        backgroundColor: "rgba(50,200,100,1)",
                        borderColor : "rgba(14,72,100,1)",
                        borderWidth: 3
                    }]
                },
                options: {
                    onClick : async (evt) => {

                        this.searching = true;
                        const activePoints = myChart.getElementsAtEventForMode(evt, 'point', myChart.options);
                        const firstPoint = activePoints[0];
                        if (firstPoint !== undefined){

                            this.dataTable = $('#resultTable3').DataTable();
                            this.dataTable.destroy();

                            const label = myChart.data.labels[firstPoint._index];
                            const value = myChart.data.datasets[firstPoint._datasetIndex].data[firstPoint._index];

                            // on recréer l'objet searchRequest pour appeler l'api via advanced searched
                            // seule la médiane est définie



                            let searchRequest = {
                                activityMediane: {
                                    from: label,
                                    to: label,
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
                            this.searching = false;
                            this.redraw();
                        }
                    },
                    responsive : true,
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true
                            }
                        }]
                    }
                }
            });
        },

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
            this.chartLabels = await resultLabel.json();

            this.chartLabels.forEach(element => {
                mediane.push(element._id);
                counts.push(element.count);
            })
            this.chartLabels = mediane;
            this.chartCounts = counts;
        },
        redraw : function () {
            this.$nextTick(function () {
                this.dataTable = $("#resultTable3").DataTable({
                    dom: 'Bfrtip',
                    buttons: buttons,
                    language: lang,
                });
            })
        }

    },
    mounted : function(){
        // on initialise le graphe puis on l'affiche
        this.initData().then( data => {
            this.createChart();
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

