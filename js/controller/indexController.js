const ADDRESS = "localhost/proj_tesi_backend"; // server address
const BACKGROUND_COLOR = {run: 'btn-success', waiting: 'btn-warning', error: 'btn-danger', off: 'btn-secondary'}; // machine status background color

$(document).ready(() => {
    machines = loadMachineFromDatabase();
    sessionStorage.setItem("storedMachines", JSON.stringify(machines));
    loadMachine(machines);
});


/**
 * Retrieve machines from database
 * Path: Output/machines_config.txt
 */
function loadMachineFromDatabase() {
    let listMachines = [];
    $.ajax({
        async: false,
        url: 'http://' + ADDRESS + '/Output/machines_config.txt',
        success: (response) => {
            response = JSON.parse(response);
            response.forEach((e) => {
                let oee = new OEE(e.oee.general, e.oee.availability, e.oee.performance, e.oee.quality);
                let x = new Machine(e.name, e.status, e.powerOn, e.start, e.beatingSpeedPerHours, e.startMouldAssembly, e.endMouldAssembly, e.changeOfWorkingShift, e.secondChangeOfWorkingShift, oee);
                listMachines.push(x);
            });
        },
        error: (response) => {
            alert("We run into an error.")
        }
    });
    return listMachines;
}

/**
 * Create the machines on the dashbord
 * @param machines array of machines
 */
function loadMachine(machines) {
    let content;
    $.ajax({
        async: false,
        url: "content/cardMachine.html",
        success: (response) => {
            content = response;
        }
    });
    machines.forEach((e) => {
        $("#preCharge").html(content);
        $("#preCharge .div-resume-status-machine").attr('machineid', e.name);
        $("#preCharge .machine-name").html(e.name);
        $("#preCharge .machine-status").html(e.status);
        $("#preCharge .oee-percentage").html(e.oee.general);
        $("#preCharge .progress-bar-oee").attr("aria-valuenow", e.oee.general);
        $("#preCharge .progress-bar-oee").css("width", e.oee.general + "%");
        $("#preCharge .principal-div-machine").addClass(BACKGROUND_COLOR[e.status.toLowerCase()]);
        $("#machineList").append($("#preCharge").html());
    });
}

