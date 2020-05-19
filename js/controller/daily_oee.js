const COLLECTION = "macchinario";
// machine status background color
const BACKGROUND_COLOR = {
    run: 'btn-success',
    warning: 'btn-warning',
    error: 'btn-danger',
    off: 'btn-secondary'
};

// img_status not considered: change.png, clock.png
const IMG_STATUS = {
    run: 'img/img-status-machine/productivity.png',
    warning: 'img/img-status-machine/warning.png',
    error: 'img/img-status-machine/brokenblack.png',
    off: 'img/img-status-machine/offwhite.png'
};
// maybe we can change machine image too, depending on which class of machine we're considering

$(document).ready(() => {
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

    loadMachineFromDatabase(loadMachine, null);
});


/**
 * Retrieve machines from database
 */
function loadMachineFromDatabase(callback) {
    let listMachines = [];
    let db = firebase.firestore();
    let collection = db.collection(COLLECTION);
    collection.get().then((querySnapshot) => {
        querySnapshot.forEach((e) => {
            e = e.data();
            listMachines.push(e);
        });
        callback(listMachines, arguments[1]);
    });
}

/**
 * Create the machines on the dashbord
 * @param machines array of machines
 */
function loadMachine(machines) {
    setTimeTo(machines, [machines[0].last_available_oee]);
}

function setTimeTo(machines, params) {

    let date = moment(params[0]).format("YYYY-MM-DD HH:mm:ss");
    let time = moment(params[0]).format("HH:mm");
    let dailyDate = moment(params[0]).format("dddd, MMMM Do YYYY HH:mm");

    $(".list-time").html(time);
    $(".list-time").attr("currentdate", date);
    $("#current_date").html(dailyDate);
    $("#machineList").html("");
    let content = $("#preCharge").html();
    let numItem = machines.length;
    let cont = 0;


    machines.forEach((e) => {
        let allOEE = [];
        for (let key in machines[cont].oee) {
            if (key.startsWith(date.substr(0, 11))) { // it means that the considered date it's the same of the last_available_oee date
                allOEE[allOEE.length] = key;
            }
        }
        let resumeOEE = 0;
        let resumeOEEAvailability = 0;
        let existOEE = 0;
        allOEE.forEach((e) => {
            let current = machines[cont].oee[e];
            if (current.general != 0) {
                existOEE += 1;
                resumeOEE += current.general;
                resumeOEEAvailability += current.availability;
            }
        });
        resumeOEE = (resumeOEE / existOEE).toFixed(2);
        resumeOEEAvailability = (resumeOEEAvailability / existOEE).toFixed(2);
        e.oee[date].general = resumeOEE;
        if (resumeOEEAvailability == 0) e.oee[date].status = "off"
        else if (resumeOEEAvailability < 30) e.oee[date].status = "error"
        else if (resumeOEEAvailability < 50) e.oee[date].status = "warning";
        else e.oee[date].status = "run";

        cont++;
        $("#preCharge .div-resume-status-machine").attr('machineid', e.name);
        $("#preCharge .machine-name").html(e.name);
        $("#preCharge .machine-status").html(e.oee[date].status);
        $("#preCharge .oee-percentage").html(e.oee[date].general);
        $("#preCharge .progress-bar-oee").attr("aria-valuenow", e.oee[date].general).css("width", e.oee[date].general + "%");
        $("#preCharge .principal-div-machine").addClass(BACKGROUND_COLOR[e.oee[date].status.toLowerCase()]);
        $("#preCharge .img-status-machine").attr('src', IMG_STATUS[e.oee[date].status.toLowerCase()]);
        $("#machineList").append($("#preCharge").html());
        $("#preCharge").html(content);
        if (cont == numItem) {
            $("#loading").css("display", "none");
        }
    });
}


function machineDetails(el) {
    window.open("machine_daily_oee_details.html?machine=" + $(el).attr("machineid"));
}
