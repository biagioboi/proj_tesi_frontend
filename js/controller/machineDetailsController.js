const COLLECTION = "macchinario";

$(document).ready(() => {
    let url = new URL(window.location.href);
    let machineId = url.searchParams.get("machine");
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
    checkIfMachineExist(machineId);

});

function checkIfMachineExist(machineId) {
    let db = firebase.firestore();
    let collection = db.collection(COLLECTION);
    collection.doc(machineId).get().then((doc) => {
        if (!doc.exists) {
            location.href = "index_planning.html";
        } else {
            $(".machine-name").html(doc.data().name);
            $("#intervallo_max_stesso_pezzo").val(doc.data().intervallo_max_stesso_pezzo);
            $("#intervallo_max_pezzi_diversi").val(doc.data().intervallo_max_pezzi_diversi);
            $("#num_pezzi_previsti").val(doc.data().num_pezzi_previsti);
            $("#loading").css("display", "none");
        }
    });
}

function removeMachine() {
    let machineId = $(".machine-name").html();
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

function saveMachine() {
    let machineId = $(".machine-name").html();
    let intervallo_max_stesso_pezzo = $("#intervallo_max_stesso_pezzo").val();
    let intervallo_max_pezzi_diversi = $("#intervallo_max_pezzi_diversi").val();
    let num_pezzi_previsti = $("#num_pezzi_previsti").val();
    let ref_doc = firebase.firestore().collection(COLLECTION).doc(machineId);
    ref_doc.set({
        'intervallo_max_stesso_pezzo': intervallo_max_stesso_pezzo,
        'intervallo_max_pezzi_diversi': intervallo_max_pezzi_diversi,
        'num_pezzi_previsti': num_pezzi_previsti
    }, {merge: true}).then(() => {
        alert("Dati aggiornati con successo.");
    });

}