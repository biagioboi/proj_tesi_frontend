const COLLECTION = "macchinario";

$(document).ready(() => {

    let url = new URL(window.location.href);
    let machineId = url.searchParams.get("machine");
    let date = url.searchParams.get("date");

    // firebase configuration
    var firebaseConfig = {
        apiKey: "AIzaSyCTMjXyQXquU_OL7-nrJxptjEoem3A-Vgk",
        authDomain: "tesi-75dcc.firebaseapp.com",
        databaseURL: "https://tesi-75dcc.firebaseio.com",
        projectId: "tesi-75dcc",
        storageBucket: "tesi-75dcc.appspot.com",
        messagingSenderId: "927587508970",
        appId: "1:927587508970:web:79bd42f77acab26927ad93"
    };

    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);

    checkIfMachineExist(machineId, loadData, date);

});

function checkIfMachineExist(machineId, callback, param) {
    let db = firebase.firestore();
    let collection = db.collection(COLLECTION);
    collection.doc(machineId).get().then((doc) => {
        if (!doc.exists) {
            location.href = "index_planning.html";
        } else {
            callback(doc.data(), param);
        }
    });
}

function loadData(machine, date) {
    if (machine.oee[date] === undefined)
        location.href = "index_planning.html";

    $("#machine-id").html(machine.name);

    let hour_expected_pieces = Math.round(machine.expected_pieces / 24) * parseInt(date.substr(11, 2));
    let last_date = moment(date);
    let prod_pieces = 0;

    let toSort = []
    for (let key in machine.oee) {
        if (key.startsWith(date.substr(0, 11))) { // it means that the considered date it's the same of the last_available_oee date
            if (moment(key).isBefore(last_date)) {
                toSort[toSort.length] = key;
                prod_pieces += machine.oee[key].good_pieces;
            }
        }
    }
    toSort.sort((a, b) => {
        let k = moment(a);
        let j = moment(b);
        if (k.isAfter(j)) return 1; else return -1;
    });
    toSort.push(date);

    new Chart(document.getElementById("barChartProduction"), {
        type: 'bar',
        data: {
            labels: ['Pieces produced'],
            datasets: [
                {
                    label: 'Expected',
                    data: [hour_expected_pieces],
                    backgroundColor: '#858796'
                },
                {
                    label: 'Good Pieces Produced',
                    data: [prod_pieces],
                    backgroundColor: '#1CC88A'
                }
            ]
        },

        options: {
            title: {
                display: true,
                text: 'TIME / PRODUCTION CHART'
            },
            responsive: true,
            legend: {
                position: 'right' // place legend on the right side of chart
            },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    },
                    stacked: false
                }],
                xAxes: [{
                    stacked: false,
                }]
            }
        }
    });

    let color = {run: "#1CC88A", warning: "#F6C23E", error: "#aa4545", off: "#858796"};

    let dataSource = [];
    toSort.forEach((e) => {
        let obj = {
            label: machine.oee[e].status,
            data: [1],
            backgroundColor: color[machine.oee[e].status]
        }
        dataSource.push(obj);
    });


    new Chart(document.getElementById("machinestate"), {
        type: 'bar',
        data: {

            labels: ['MACHINE STATE'],
            datasets: dataSource
        },

        options: {
            title: {
                display: true,
                text: 'MACHINE STATE CHART'
            },

            responsive: true,
            legend: {
                position: 'right', // place legend on the right side of chart
                labels: {
                    filter: function (legendItem, data) {
                        let found = false;
                        for (let i = 0; i < legendItem.datasetIndex; i++) {
                            if (data.datasets[i].label.localeCompare(data.datasets[legendItem.datasetIndex].label) === 0)
                                found = true; // to prevent double item in legend
                        }
                        return !found;
                    }
                }
            },

            scales: {
                xAxes: [{
                    stacked: true
                }],
                yAxes: [{
                    stacked: true
                }]
            }
        }
    });


    $("#loading").css("display", "none");

}
