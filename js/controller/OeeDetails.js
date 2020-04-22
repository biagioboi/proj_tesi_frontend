const COLLECTION = "macchinario";

$(document).ready(() => {

    let url = new URL(window.location.href);
    let machineId = url.searchParams.get("machine");

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

    checkIfMachineExist(machineId, loadData);

});


function checkIfMachineExist(machineId, callback) {
    let db = firebase.firestore();
    let collection = db.collection(COLLECTION);
    collection.doc(machineId).get().then((doc) => {
        if (!doc.exists) {
            location.href = "index_planning.html";
        } else {
            callback(doc.data());
        }
    });
}

function loadData(machine) {
    let last_available_oee = machine.last_available_oee;
    if (machine.oee[last_available_oee] === undefined)
        location.href = "index_planning.html";
    let oee_obj = machine.oee[last_available_oee];

    $(".machine_name").html(machine.name);
    $("#current_date").html(moment(last_available_oee).format("dddd, MMMM Do YYYY HH:mm"));

    let context = {
        general: {
            nameContainer: $("#pieChartGeneral"),
            background: "#cd3434"
        },
        availability: {
            nameContainer: $("#pieChartAvailability"),
            background: "#34cd37"
        },
        performance: {
            nameContainer: $("#pieChartPerformance"),
            background: "#34cdcd"
        },
        quality: {
            nameContainer: $("#pieChartQuality"),
            background: "#cdac34"
        }
    };

    let oee_details = ["general", "availability", "performance", "quality"];

    oee_details.forEach((e) => {
        let percentage = oee_obj[e];
        $("#" + e).html(e + " " + percentage + "%");
        new Chart(context[e].nameContainer, {
            type: 'doughnut',
            data: {
                labels: [e, "Percentual Remaining " + e],
                datasets: [{
                    data: [percentage, 100 - percentage],
                    backgroundColor: [context[e].background, '#cccccc'],
                    hoverBorderColor: "rgba(234, 236, 244, 1)",
                }],
            },
            options: {
                maintainAspectRatio: false,
                tooltips: {
                    backgroundColor: "rgb(255,255,255)",
                    bodyFontColor: "#858796",
                    borderColor: '#dddfeb',
                    borderWidth: 1,
                    xPadding: 15,
                    yPadding: 15,
                    displayColors: false,
                    caretPadding: 10,
                },
                legend: {
                    display: false
                },
                cutoutPercentage: 80,
            },
        });
    });
    $("#loading").css("display", "none");

    let datas = {good_pieces: [], bad_pieces: []}
    let dataForLineChart = {labels: [], datasets: []}
    let last_date = moment(last_available_oee);

    let toSort = []
    for (let key in machine.oee) {
        if (key.startsWith(last_available_oee.substr(0, 11))) { // it means that the considered date it's the same of the last_available_oee date
            if (moment(key).isBefore(last_date)) {
                toSort[toSort.length] = key
            }
        }
    }
    toSort.sort((a, b) => {
        let k = moment(a);
        let j = moment(b);
        if (k.isAfter(j)) return 1; else return -1;
    });

   toSort.forEach((e) => {
       dataForLineChart.labels.push(e.substr(11, 5));
       datas.good_pieces.push(machine.oee[e].good_pieces);
       datas.bad_pieces.push(machine.oee[e].bad_pieces);
   });


    let label = ["good_pieces", "bad_pieces"];
    label.forEach(((e) => {
       let obj_to_add = {
           data: datas[e],
           label: e,
           borderColor: "#3D251A",
           fill:false
       };
       dataForLineChart.datasets.push(obj_to_add);
    }));

    new Chart(document.getElementById("lineChart"), {
        type: 'line',
        data: dataForLineChart,
        options: {
            title: {
                display: true,
                text: 'PRODUCTION PERFORMANCE',
                fontFamily: " arial black",
            }
        }
    });

}

/*

/*
});
*/
