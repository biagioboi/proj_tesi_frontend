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

    loadMachineFromDatabase(loadMachine);
});

function removeMachine(element) {
    let mainDiv = $(element).parent().parent();
    let machineId = mainDiv.attr("machineid");
    let db = firebase.firestore();
    let collection = db.collection(COLLECTION);
    if (confirm("Do you really want to delete the machine '" + machineId + "'?"))
        collection.doc(machineId).delete().then(() => {
            alert("Machine successfully delete.");
            mainDiv.remove();
        }).catch((err) => {
            alert("Error deleting machine.");
        });
}

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
        callback(listMachines);
    });
}

/**
 * Create the machines on the dashbord
 * @param machines array of machines
 */
function loadMachine(machines) {
    let content = $("#preCharge").html();
    let numItem = machines.length;
    let cont = 0;
    machines.forEach((e) => {
        cont++;
        $("#preCharge .div-resume-status-machine").attr('machineid', e.name);
        $("#preCharge .machine-name").html(e.name);
        $("#preCharge .machine-status").html(e.status);
        $("#preCharge .oee-percentage").html(e.oee.latest.general);
        $("#preCharge .progress-bar-oee").attr("aria-valuenow", e.oee.latest.general);
        $("#preCharge .progress-bar-oee").css("width", e.oee.latest.general + "%");
        $("#preCharge .principal-div-machine").addClass(BACKGROUND_COLOR[e.status.toLowerCase()]);
        $("#preCharge .img-status-machine").attr('src', IMG_STATUS[e.status.toLowerCase()]);
        $("#preCharge .link-machine-details-planning").attr("href", "machine_details.html?machine=" + e.name);
        $("#machineList").append($("#preCharge").html());
        $("#preCharge").html(content);
        if (cont == numItem) {
            $("#loading").css("display", "none");
        }
    });
}

