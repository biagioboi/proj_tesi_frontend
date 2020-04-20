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
    let dailyDate = moment(params[0]).format("dddd, MMMM Do YYYY");
    let prev = moment(params[0]).subtract(1, 'hours').format("YYYY-MM-DD HH:mm:ss");
    let next = moment(params[0]).add(1, 'hours').format("YYYY-MM-DD HH:mm:ss");

    // check if exist next and prev hour
    if (machines[0].oee[prev] !== undefined) $("#prev_hour").attr("new_time", prev)
    else $("#prev_hour").removeAttr("new_time")
    if (machines[0].oee[next] !== undefined) $("#next_hour").attr("new_time", next)
    else $("#next_hour").removeAttr("new_time")

    $(".last-production-time").html(time);
    $("#current_date").html(dailyDate);
    $("#machineList").html("");
    let content = $("#preCharge").html();
    let numItem = machines.length;
    let cont = 0;
    machines.forEach((e) => {
        cont++;
        $("#preCharge .div-resume-status-machine").attr('machineid', e.name);
        $("#preCharge .machine-name").html(e.name);
        $("#preCharge .machine-status").html(e.oee[date].status);
        $("#preCharge .oee-percentage").html(e.oee[date].general);
        $("#preCharge .progress-bar-oee").attr("aria-valuenow", e.oee[date].general);
        $("#preCharge .progress-bar-oee").css("width", e.oee[date].general + "%");
        $("#preCharge .principal-div-machine").addClass(BACKGROUND_COLOR[e.oee[date].status.toLowerCase()]);
        $("#preCharge .img-status-machine").attr('src', IMG_STATUS[e.oee[date].status.toLowerCase()]);
        $("#machineList").append($("#preCharge").html());
        $("#preCharge").html(content);
        if (cont == numItem) {
            $("#loading").css("display", "none");
        }
    });
}

function goToDate(el) {
    if ($(el).attr("new_time") === undefined) {
        return;
    }
    $("#loading").css("display", "block");
    let date = $(el).attr("new_time");
    console.log(date);
    loadMachineFromDatabase(setTimeTo, [date]);
}