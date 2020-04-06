const ADDRESS = "localhost/proj_tesi_backend"; // server address
const BACKGROUND_COLOR = {ok: 'btn-success', waiting: 'btn-warning', error: 'btn-danger', off: 'btn-secondary'}; // machine status background color

$(document).ready(() => {
    let machines = JSON.parse(sessionStorage.getItem("storedMachines"));
    if (machines == null) {
        machines = loadMachineFromDatabase();
        sessionStorage.setItem("storedMachines", JSON.stringify(machines));
    }
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
                let x = new Machine(e.name, e.status, e.powerOn, e.start, e.beatingSpeedPerHours, e.startMouldAssembly, e.endMouldAssembly, e.changeOfWorkingShift, e.secondChangeOfWorkingShift, e.numExpectedProduct, e.numProduct, e.numGoodProduct, e.numBadProduct);
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
        $("#preCharge .machine-name").html(e.name).attr('machineid', e.name);

        //here we should do a control on machine status
        $("#preCharge .principal-div-machine").addClass(BACKGROUND_COLOR.ok);
        $("#machineList").append($("#preCharge").html());
    });
}

