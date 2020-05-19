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
    toSort.push(last_available_oee);

    let obj_oee = {
        general: 0,
        availability: 0,
        performance: 0,
        quality: 0
    }
    let totEl = 0;
    toSort.forEach((e) => {
        let current_oee = machine.oee[e];
        if (current_oee.general != 0) {
            totEl += 1;
            obj_oee.general += current_oee.general;
            obj_oee.availability += current_oee.availability;
            obj_oee.performance += current_oee.performance;
            obj_oee.quality += current_oee.quality;
        }
    });
    obj_oee.general = (obj_oee.general / totEl).toFixed(2);
    obj_oee.availability = (obj_oee.availability / totEl).toFixed(2);
    obj_oee.performance = (obj_oee.performance / totEl).toFixed(2);
    obj_oee.quality = (obj_oee.quality / totEl).toFixed(2);

    $(".link-chart-time").attr("href", "daily_chart_time_production.html?machine=" + machine.name + "&date=" + last_available_oee);

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
        let percentage = obj_oee[e];
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

    let datas = {good_pieces: [], bad_pieces: []};
    let datasAndamentoOEE = {quality: [], availability: [], performance: []};
    let dataForLineChart = {labels: [], datasets: []};
    let dataForLineChartAndamentoOEE = {labels: [], datasets: []};


    toSort.forEach((e) => {
        dataForLineChart.labels.push(e.substr(11, 5));
        datas.good_pieces.push(machine.oee[e].good_pieces);
        datas.bad_pieces.push(machine.oee[e].bad_pieces);

        dataForLineChartAndamentoOEE.labels.push(e.substr(11, 5));
        datasAndamentoOEE.quality.push(machine.oee[e].quality);
        datasAndamentoOEE.availability.push(machine.oee[e].availability);
        datasAndamentoOEE.performance.push(machine.oee[e].performance);

    });


    let label = [{
        index: "good_pieces",
        name: "Good Pieces",
        color: "#F45655"
    }, {
        index: "bad_pieces",
        name: "Bad Pieces",
        color: "#459cfa"
    }];

    label.forEach(((e) => {
        let obj_to_add = {
            data: datas[e.index],
            label: e.name,
            borderColor: e.color,
            fill: false
        };
        dataForLineChart.datasets.push(obj_to_add);
    }));

    let labelAndamentoOEE = [{
        index: "quality",
        name: "Quality",
        color: "#cdac34"
    }, {
        index: "availability",
        name: "Availability",
        color: "#34cd37"
    }, {
        index: "performance",
        name: "Performance",
        color: "#34cdcd"
    }];

    labelAndamentoOEE.forEach(((e) => {
        let obj_to_add = {
            data: datasAndamentoOEE[e.index],
            label: e.name,
            borderColor: e.color,
            fill: false
        };
        dataForLineChartAndamentoOEE.datasets.push(obj_to_add);
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

    new Chart(document.getElementById("lineChartAndamentoOEE"), {
        type: 'line',
        data: dataForLineChartAndamentoOEE,
        options: {
            title: {
                display: true,
                text: 'PRODUCTION PERFORMANCE',
                fontFamily: " arial black",
            }
        }
    });

    $("#loading").css("display", "none");
}
