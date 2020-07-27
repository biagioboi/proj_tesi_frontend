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
function loadMachineFromDatabase(callback, params) {
    let listMachines = [];
    let db = firebase.firestore();
    let collection = db.collection(COLLECTION);
    collection.get().then((querySnapshot) => {
        querySnapshot.forEach((e) => {
            e = e.data();
            listMachines.push(e);
        });
        callback(listMachines, params);
    });
}

/**
 * Create the machines on the dashbord
 * @param machines array of machines
 */
function loadMachine(machines, date) {
    if (date == null) {
        // it means that it's the init and we need to decide till which hour set the time list,
        // so we assume from midnight of the last day, to the last time received
        var toDate = moment(machines[0].last_available_oee, 'YYYY-MM-DD HH:mm:ss');
        var fromDate = (moment(machines[0].last_available_oee, 'YYYY-MM-DD HH:mm:ss')).minute(0).hour(0).second(0);
        date = [fromDate, toDate];
    }
    setTimeTo(machines, date);
}

function setTimeTo(machines, params) {
    var toDate = moment(params[1], 'YYYY-MM-DD HH:mm:ss');
    var fromDate = moment(params[0], 'YYYY-MM-DD HH:mm:ss');
    if (machines[0].oee[fromDate.format('YYYY-MM-DD HH:mm:ss')] == undefined) {
        $("#loading").css("display", "none");
        alert("Impossibile cambiare giorno.");
        return;
    } else if (toDate.isSameOrBefore(fromDate)) {
        $("#loading").css("display", "none");
        alert("Controllare parametri ricerca.");
        return;
    }

    $("#machineList").html("");
    $(".list-time").html("");

    let dailyDate = moment(params[0], 'YYYY-MM-DD HH:mm:ss').format("ddd, MMM Do YYYY");
    $("#date_from").html(dailyDate);
    $("#date_to").html(dailyDate);

// mi prendo tutti i turni tra i due periodi
    let valueBetweenDate = [];
    let startDate = moment(params[0]).hour(0).minute(0).second(0).millisecond(0);
    let nextDay = moment(startDate).add(1, 'days');
    while (startDate.isSameOrBefore(toDate) && startDate.isBefore(nextDay, 'days')) {
        let e = startDate.format("YYYY-MM-DD HH:mm:ss");
        if (startDate.isSame(fromDate)) {
            $(".list-time-to").append("<option value='" + e + "'>" + e.substr(11, 5) + "</option>");
            $(".list-time-from").append("<option selected value='" + e + "'>" + e.substr(11, 5) + "</option>");
        } else if (startDate.isSame(toDate)) {
            $(".list-time-to").append("<option selected value='" + e + "'>" + e.substr(11, 5) + "</option>");
            $(".list-time-from").append("<option value='" + e + "'>" + e.substr(11, 5) + "</option>");
        } else {
            $(".list-time").append("<option value='" + e + "'>" + e.substr(11, 5) + "</option>");
        }
        valueBetweenDate[valueBetweenDate.length] = startDate.format("YYYY-MM-DD HH:mm:ss")
        startDate.add(1, 'hours');
    }

    let limitDate = moment(machines[0].last_available_oee, "YYYY-MM-DD HH:mm:ss");
    while (startDate.isSameOrBefore(limitDate) && startDate.isBefore(nextDay, 'days')) {

        let e = startDate.format("YYYY-MM-DD HH:mm:ss");
        console.log(e);
        $(".list-time").append("<option value='" + e + "'>" + e.substr(11, 5) + "</option>");
    }

    let numItem = machines.length;
    let cont = 0;
    machines.forEach((machine) => {
        let obj_oee = {
            general: 0,
            availability: 0,
            performance: 0,
            quality: 0
        }
        let totEl = 0;
        valueBetweenDate.forEach((e) => {
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

        if (obj_oee.availability == 0) obj_oee.status = "off"
        else if (obj_oee.availability < 30) obj_oee.status = "error"
        else if (obj_oee.availability < 50) obj_oee.status = "warning";
        else obj_oee.status = "run";


        let content = $("#preCharge").html();
        cont++;
        $("#preCharge .div-resume-status-machine").attr('machineid', machine.name);
        $("#preCharge .machine-name").html(machine.name);
        $("#preCharge .machine-status").html(obj_oee.status);
        $("#preCharge .oee-percentage").html(obj_oee.general);
        $("#preCharge .progress-bar-oee").attr("aria-valuenow", obj_oee.general).css("width", obj_oee.general + "%");
        $("#preCharge .principal-div-machine").addClass(BACKGROUND_COLOR[obj_oee.status.toLowerCase()]);
        $("#preCharge .img-status-machine").attr('src', IMG_STATUS[obj_oee.status.toLowerCase()]);
        $("#machineList").append($("#preCharge").html());
        $("#preCharge").html(content);
        if (cont == numItem) {
            $("#loading").css("display", "none");
        }
    });
}


function goToDate(el) {
    let date;
    if ($(el).attr("new_time") === undefined && $(el).val() == "") {
        return;
    } else if ($(el).attr("new_time") !== undefined) {
        date = $(el).attr("new_time");
        $("#loading").css("display", "block");
        loadMachineFromDatabase(setTimeTo, [date]);
    } else { // it means that it's been changed just the time and not the date
        let dateFrom = $(".list-time-from").val();
        let dateTo = $(".list-time-to").val();
        $("#loading").css("display", "block");
        loadMachineFromDatabase(setTimeTo, [dateFrom, dateTo]);
    }
}

function machineDetails(el) {
    window.open("machine_oee_details.html?machine=" + $(el).attr("machineid") + "&date=" + $(".list-time").val());
}

$(".list-time").change(function () {
    goToDate($(this));
});
