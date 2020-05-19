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

    $(".list-time").html("");

    let date = moment(params[0]).format("YYYY-MM-DD HH:mm:ss");
    let time = moment(params[0]).format("HH:mm");
    let dailyDate = moment(params[0]).format("dddd, MMMM Do YYYY");

    let prev_day = moment(date).subtract(1, 'day').format("YYYY-MM-DD") + " 00:00:00";
    let next_day = moment(date).add(1, 'day').format("YYYY-MM-DD") + " 00:00:00";

    // check if exist next and prev day
    if (machines[0].oee[prev_day] !== undefined) $("#prev_day").attr("new_time", prev_day)
    else $("#prev_day").removeAttr("new_time")
    if (machines[0].oee[next_day] !== undefined) $("#next_day").attr("new_time", next_day)
    else $("#next_day").removeAttr("new_time")

    let toSort = [];
    for (let key in machines[0].oee) {
        if (key.startsWith(date.substr(0, 11))) { // it means that the considered date it's the same of the last_available_oee date
            toSort[toSort.length] = key;
        }
    }
    toSort.sort((a, b) => {
        let k = moment(a);
        let j = moment(b);
        if (k.isAfter(j)) return 1; else return -1;
    });


    toSort.forEach((e) => {
        let selected="";
        if (e.localeCompare(date) == 0) {
            selected = "selected"
        }
        $(".list-time").append("<option " + selected + " value='" + e + "'>" + e.substr(11, 5) + "</option>");

    })

    $(".last-production-time").html(time).attr("time_value", date);
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

function goToDate(el) {
    let date;
    if ($(el).attr("new_time") === undefined && $(el).val() == "") {
        return;
    } else if ($(el).attr("new_time") !== undefined) {
        date = $(el).attr("new_time");
    } else {
        date = $(el).val();
    }
    $("#loading").css("display", "block");
    loadMachineFromDatabase(setTimeTo, [date]);
}

function machineDetails(el) {
    window.open("machine_oee_details.html?machine=" + $(el).attr("machineid") + "&date=" + $(".list-time").val());
}

$(".list-time").change(function() {
    goToDate($(this));
});
