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
    let last_available_oee = date;
    if (machine.oee[last_available_oee] === undefined)
        location.href = "index_planning.html";
    let oee_obj = machine.oee[last_available_oee];

    $(".link-chart-time").attr("href", "chart_time_production.html?machine=" + machine.name + "&date=" + date);

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
        $("#" + e).html(e + "<br>" + percentage + "%");
        new Chart(context[e].nameContainer, {
            type: 'doughnut',
            data: {
                labels: [e, "no"],
                datasets: [{
                    data: [percentage, (100 - percentage).toFixed(2)],
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
}
