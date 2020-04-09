const ADDRESS = "localhost/proj_tesi_backend"; // server address
const BACKGROUND_COLOR = {run: 'btn-success', waiting: 'btn-warning', error: 'btn-danger', off: 'btn-secondary'}; // machine status background color
const IMG_STATUS = {
    run: 'img/img-status-machine/productivity.png',
    warning: 'img/img-status-machine/warning.png',
    error: 'img/img-status-machine/brokenblack.png',
    off: 'img/img-status-machine/offwhite.png'
};
// img_status not considered: change.png, clock.png
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

    sessionStorage.setItem("storedMachines", JSON.stringify(loadMachineFromDatabase(loadMachine)));
});


/**
 * Retrieve machines from database
 */
function loadMachineFromDatabase(callback) {
    let listMachines = [];
    let db = firebase.firestore();
    let collection = db.collection("macchinario");
    collection.get().then((querySnapshot) => {
        querySnapshot.forEach((e) => {
            e = e.data();
            let oee = new OEE(e.oee.general, e.oee.availability, e.oee.performance, e.oee.quality);
            let x = new Machine(e.name, e.status, e.powerOn, e.start, e.beatingSpeedPerHours, e.startMouldAssembly, e.endMouldAssembly, e.changeOfWorkingShift, e.secondChangeOfWorkingShift, oee);
            listMachines.push(x);
        });
        callback(listMachines)
    });
    return listMachines;
}

/**
 * Create the machines on the dashbord
 * @param machines array of machines
 */
function loadMachine(machines) {
    let content = $("#preCharge").html();
    machines.forEach((e) => {
        $("#preCharge .div-resume-status-machine").attr('machineid', e.name);
        $("#preCharge .machine-name").html(e.name);
        $("#preCharge .machine-status").html(e.status);
        $("#preCharge .oee-percentage").html(e.oee.general);
        $("#preCharge .progress-bar-oee").attr("aria-valuenow", e.oee.general);
        $("#preCharge .progress-bar-oee").css("width", e.oee.general + "%");
        $("#preCharge .principal-div-machine").addClass(BACKGROUND_COLOR[e.status.toLowerCase()]);
        $("#preCharge .img-status-machine").attr('src', IMG_STATUS[e.status.toLowerCase()]);
        $("#machineList").append($("#preCharge").html());
        $("#preCharge").html(content);
    });
}

