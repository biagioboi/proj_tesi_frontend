$(document).ready(() => {
    let machines = sessionStorage.getItem("storedMachines");
    machines = loadMachineFromDatabase();
    if (machines == "undefined") {
        machines = loadMachineFromDatabase();
        sessionStorage.setItem("storedMachines", machines);
    }
    loadMachine(machines);

});


// Retrieve machines from database
// path: Output/machines_config.txt
function loadMachineFromDatabase() {
    let listMachines = [];
    $.ajax({
        url: 'http://localhost:8080/Output/machines_config.txt',
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

function loadMachine() {
    return;
}