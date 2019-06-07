// Initialize firebase
var firebaseConfig = {
    apiKey: "AIzaSyDTFAcOCVCedrAgQLSkmKJy9_WDKoFX0Fg",
    authDomain: "myfirstdemo-7e275.firebaseapp.com",
    databaseURL: "https://myfirstdemo-7e275.firebaseio.com",
    projectId: "myfirstdemo-7e275",
    storageBucket: "myfirstdemo-7e275.appspot.com",
    messagingSenderId: "994905791842",
    appId: "1:994905791842:web:60b87dffb4febfb7"
};

firebase.initializeApp(firebaseConfig);
var database = firebase.database();

var timeHandle;

$("#add-train-btn").on("click", function (event) {
    event.preventDefault();

    // Grabs user input
    var trainName = $("#name-input").val().trim();
    var trainDestination = $("#destination-input").val().trim();
    var trainFirst = moment($("#first-input").val().trim(), "HH:mm").format("X");
    var tranFreq = $("#frequency-input").val();

    var newTrain = {
        name: trainName,
        destination: trainDestination,
        first: trainFirst,
        freq: tranFreq
    };
    console.log(newTrain);
    database.ref().push(newTrain);

    // Clears all of the text-boxes
    $("#name-input").val("");
    $("#destination-input").val("");
    $("#first-input").val("");
    $("#frequency-input").val("");
});

database.ref().on("child_added", function (childSnapshot) {
    console.log(childSnapshot.val());

    // Store everything into a variable.
    var trainName = childSnapshot.val().name;
    var trainDestination = childSnapshot.val().destination;
    var trainFirst = childSnapshot.val().first;
    var trainFreq = childSnapshot.val().freq;
    console.log(moment.unix(trainFirst).format("HH:mm"));
    var minDiff = moment().diff(moment(trainFirst, "X"), "minutes");
    var minToArr = trainFreq - (minDiff % trainFreq);

    var nextArrTime = moment().add( minToArr, "minutes").format("HH:mm");

    console.log("min : " + minDiff);
    // Create the new row
    var newRow = $("<tr>").append(
        $("<td>").text(trainName),
        $("<td>").text(trainDestination),
        $("<td>").text(trainFreq),
        $("<td>").text(nextArrTime),
        $("<td>").text(minToArr)
    );

    // Append the new row to the table
    $("tbody").append(newRow);
});

function minuteUpdate() {
    var rowData = $("tbody").children();
    var colData;
    for(var i=0; i<rowData.length; i++) {
        // console.log( i + " " + rowData[i]);
        colData = $(rowData[i]).children();
        // console.log("col : " + colData.length);
        var freq =    parseInt($(colData[2]).text());
        var timeStr = $(colData[3]).text();
        var minToArr = parseInt($(colData[4]).text()) - 1;

        if (minToArr>0) {
            $(colData[4]).text(minToArr);
        } else {
            $(colData[4]).text(freq);
            $(colData[3]).text(moment(timeStr,"HH:mm").add( freq, "minutes").format("HH:mm"));
        }

    }
    return;
}

timeHandle = setInterval(minuteUpdate, 60000);