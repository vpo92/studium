var ctx = document.getElementById('myChart');

var myChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
        datasets: [{
            label: 'Nombre de fiches',
            data: [12, 19, 3, 5, 2, 3],
            backgroundColor: "rgba(50,200,100,1)",
            borderColor : "rgba(14,72,100,1)",
            borderWidth: 3
        }]
    },
    options: {
        onClick : function () {
            console.log("Affiche le tableau");
        },
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true
                }
            }]
        }
    }
});