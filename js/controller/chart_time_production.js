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

    let hour_expected_pieces = Math.round(machine.expected_pieces / 24);
    let prod_pieces = machine.oee[date].good_pieces;


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
    $("#loading").css("display", "none");

}
