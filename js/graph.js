const chart = require("chart.js");
const months = [
"januari", "februari",
"maart", "april",
"mei", "juni",
"juli", "augustus",
"september", "oktober",
"november", "december"
];

function refreshGraph(grades) {
    var chartData = {
        labels: [],
        datasets: [{
            label: "Gemiddeld behaald cijfer",
            data: [],
            backgroundColor: "rgba(255, 99, 132, 0.2)",
            borderColor: "rgba(255, 99, 132, 1)",
            borderWidth: 1.5
        }]
    };

    grades.reverse();
    grades.forEach(i => {
        var date = new Date(i.dateFilledIn).getMonth();
        var monthName = months[date];

        if (!chartData.labels.includes(monthName)) {
            var totalThisMonth = 0.0;
            var weightThisMonth = 0.0;
            var averageThisMonth = 0.0;

            grades.forEach(i => {
                if (new Date(i.dateFilledIn).getMonth() == date) {
                    totalThisMonth += i.weight * parseFloat(i.grade.replace(",", "."));
                    weightThisMonth += i.weight;
                }
            });

            averageThisMonth = totalThisMonth / weightThisMonth;

            chartData.labels.push(monthName);
            chartData.datasets[0].data.push(Math.round(averageThisMonth * 100) / 100);
        }
    });

    var context = document.getElementById("perfChart").getContext("2d");
    new Chart(context, {
        type: "line",
        data: chartData,
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });
}
