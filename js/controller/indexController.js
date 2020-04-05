$(document).ready(() => {
    let machines = sessionStorage.getItem("storedMachines");
    if (machines == null) {
        machines = loadMachineFromDatabase();
        sessionStorage.setItem("storedMachines", machines);
    }
    loadMachine(machines);

});

function loadMachineFromDatabase() {
    // call to server and ask for existing machine

}

function loadMachine() {
    return;
}