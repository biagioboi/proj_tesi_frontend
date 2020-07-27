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
        var toDate = moment(machines[0].last_available_oee, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
        var fromDate = (moment(machines[0].last_available_oee, 'YYYY-MM-DD HH:mm:ss')).minute(0).hour(0).second(0).format('YYYY-MM-DD HH:mm:ss');
        date = [fromDate, toDate];
    }
    setTimeTo(machines, date);
}

function setTimeTo(machines, params) {
    var toDate = moment(params[1], 'YYYY-MM-DD HH:mm:ss');
    var fromDate = moment(params[0], 'YYYY-MM-DD HH:mm:ss');

    console.log(fromDate);
    console.log(toDate);

    let lastDate = moment(machines[0].last_available_oee, 'YYYY-MM-DD HH:mm:ss');

    if (machines[0].oee[fromDate.format('YYYY-MM-DD HH:mm:ss')] == undefined) {
        $("#loading").css("display", "none");
        alert("Impossibile cambiare giorno.");
        return;
    } else if (toDate.isSameOrBefore(fromDate)) { // because starting date is before or same of to date
        $("#loading").css("display", "none");
        alert("Controllare parametri della ricerca.");
        return;
    } else if (toDate.isAfter(lastDate)) { // because is impossible to search after the last available oee
        $("#loading").css("display", "none");
        alert("Controllare parametri ricerca.");
        return;
    }

    $("#machineList").html("");
    $(".list-time").html("");

    let dailyDateFrom = fromDate.format("ddd, MMM Do YYYY");
    let dailyDateTo = toDate.format("ddd, MMM Do YYYY");
    $("#date_from").html(dailyDateFrom);
    $("#date_to").html(dailyDateTo);


    // used to create the entire list of shifts
    let midnightFrom = moment(fromDate).minute(0).hour(0).second(0);
    let midnightTo = moment(toDate).minute(0).hour(0).second(0);

    // going to catch all the shifts between two periods
    let startDate = moment(fromDate);
    let valueBetweenDate = [];
    while (startDate.isSameOrBefore(toDate)) {
        valueBetweenDate[valueBetweenDate.length] = startDate.format("YYYY-MM-DD HH:mm:ss")
        startDate.add(1, 'hours');
    }



    let limitDate = moment(machines[0].last_available_oee, "YYYY-MM-DD HH:mm:ss");
    let nextDayFrom = moment(fromDate).add(1, 'days');
    let nextDayTo = moment(toDate).add(1, 'days');
    while (midnightFrom.isSameOrBefore(limitDate) && midnightFrom.isBefore(nextDayFrom, 'days')) {
        let e = midnightFrom.format("YYYY-MM-DD HH:mm:ss");
        if (midnightFrom.isSame(fromDate)) $(".list-time-from").append("<option value='" + e + "' selected>" + e.substr(11, 5) + "</option>");
        else $(".list-time-from").append("<option value='" + e + "'>" + e.substr(11, 5) + "</option>");
        midnightFrom.add(1, 'hours');
    }

    while (midnightTo.isSameOrBefore(limitDate) && midnightTo.isBefore(nextDayTo, 'days')) {
        let e = midnightTo.format("YYYY-MM-DD HH:mm:ss");
        if (midnightTo.isSame(toDate)) $(".list-time-to").append("<option value='" + e + "' selected>" + e.substr(11, 5) + "</option>");
        else $(".list-time-to").append("<option value='" + e + "'>" + e.substr(11, 5) + "</option>");
        midnightTo.add(1, 'hours');
    }

    $("#prev_day_from").attr("new_time", fromDate.subtract(1, 'days').format("YYYY-MM-DD HH:mm:ss"));
    $("#prev_day_to").attr("new_time", toDate.subtract(1, 'days').format("YYYY-MM-DD HH:mm:ss"));
    $("#next_day_from").attr("new_time", fromDate.add(1, 'days').format("YYYY-MM-DD HH:mm:ss"));
    $("#next_day_to").attr("new_time", toDate.add(1, 'days').format("YYYY-MM-DD HH:mm:ss"));

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
        if (obj_oee.general == 0) {
            obj_oee.status = "off";
            obj_oee.general = 0
            obj_oee.availability = 0;
            obj_oee.performance = 0;
            obj_oee.quality = 0;
        } else {
            obj_oee.general = (obj_oee.general / totEl).toFixed(2);
            obj_oee.availability = (obj_oee.availability / totEl).toFixed(2);
            obj_oee.performance = (obj_oee.performance / totEl).toFixed(2);
            obj_oee.quality = (obj_oee.quality / totEl).toFixed(2);
        }

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
    var mode = $(el).attr('id');
    let dateFrom = $(".list-time-from").val();
    let dateTo = $(".list-time-to").val();
    if ($(el).attr("new_time") !== undefined) {
        switch (mode) {
            case "prev_day_from":
                dateFrom = moment(dateFrom).subtract(1, 'day');
                break;
            case "next_day_from":
                dateFrom = moment(dateFrom).add(1, 'day');
                break;
            case "prev_day_to":
                dateTo = moment(dateTo).subtract(1, 'day');
                break;
            case "next_day_to":
                dateTo = moment(dateTo).add(1, 'day');
                break;
            default:
                break;

        }
        console.log(dateFrom);
        console.log(dateTo);
        $("#loading").css("display", "block");
        loadMachineFromDatabase(setTimeTo, [dateFrom, dateTo]);
    } else { // it means that it's been changed just the time and not the date
        $("#loading").css("display", "block");
        loadMachineFromDatabase(setTimeTo, [dateFrom, dateTo]);
    }
}

function machineDetails(el) {
    window.open("machine_by_period_oee_details.html?machine=" + $(el).attr("machineid") + "&fromDate=" + $(".list-time-from").val() + "&toDate=" + $(".list-time-to").val());
}

$(".list-time").change(function () {
    goToDate($(this));
});
