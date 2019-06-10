const UPDATE_NONE = 0;
const UPDATE_NAME = 1;
const UPDATE_DESTINATION = 2;

var updateKey;
var updateType=UPDATE_NONE;

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

function showErrorMessage(title, detail) {
    $("#text-error").text(detail);
    $("#text-error-title").text(title);
    $("#invalidModal").modal({backdrop: "static", keyboard: false});
}

$("#add-train-btn").on("click", function (event) {
    event.preventDefault();

    // Grabs user input
    var trainName = $("#name-input").val().trim();
    if (trainName.length<=0) {
        showErrorMessage("Missing information input!", "Please enter train name.");
        return;
    }
    var trainDestination = $("#destination-input").val().trim();
    if (trainDestination.length<=0) {
        showErrorMessage("Missing information input!", "Please enter destination.");
        return;
    }
    var firstStr = $("#first-input").val().trim();
    if (firstStr.length<=0) {
        showErrorMessage("Missing information input!", "Please enter first train time.");
        return;
    }
    var trainFirst = moment($("#first-input").val().trim(), "HH:mm").format("X");

    var tranFreq = $("#frequency-input").val();
    console.log("freq : " + tranFreq + " len: " + tranFreq.length);
    if (tranFreq.length<=0) {
        showErrorMessage("Missing information input!", "Please enter frequency.");
        return;
    }

    var newTrain = {
        name: trainName,
        destination: trainDestination,
        first: trainFirst,
        freq: tranFreq
    };
    console.log(newTrain);
    var ikey = database.ref().push(newTrain).key;
    console.log(ikey);

    // Clears all of the text-boxes
    $("#name-input").val("");
    $("#destination-input").val("");
    $("#first-input").val("");
    $("#frequency-input").val("");
});

function removeRecord() {
    var trElem = $(this).parent().parent();
    var keyid = trElem.attr("id");
    console.log(keyid);
    database.ref(keyid).remove();
    trElem.remove();
}

database.ref().on("child_added", function (childSnapshot) {
    console.log(childSnapshot.key);
 
    // Store everything into a variable.
    var trainName = childSnapshot.val().name;
    var trainDestination = childSnapshot.val().destination;
    var trainFirst = childSnapshot.val().first;
    var trainFreq = childSnapshot.val().freq;
    var minDiff = moment().diff(moment(trainFirst, "X"), "minutes");
    var minToArr = trainFreq - (minDiff % trainFreq);

    var nextArrTime = moment().add( minToArr, "minutes").format("HH:mm");
    var btnElem = $("<button>");
    btnElem.attr("type", "button");
    btnElem.addClass("btn btn-secondary");
    btnElem.text("remove");

    
    // Create the new row
    var newRow = $("<tr>").append(
        $("<td>").addClass("train-name").text(trainName),
        $("<td>").addClass("train-dest").text(trainDestination),
        $("<td>").text(trainFreq),
        $("<td>").text(nextArrTime),
        $("<td>").text(minToArr),
        $("<td>").append(btnElem)
    );

    newRow.attr("id", childSnapshot.key);

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

$("#first-input").blur(function() {

    var timeStr = $("#first-input").val().trim();
    if (timeStr.length<=0) {
        return;
    }

    var timeValid=false;

    var colonPos = timeStr.indexOf(":");
    if (colonPos>0) {
        var hrStr = timeStr.slice(0, colonPos);
        var minStr = timeStr.slice(colonPos+1, timeStr.length);
        
        if (isNaN(hrStr) || isNaN(minStr) || (hrStr.length===0)  || (minStr.length===0)) {

        } else {
            var iHr = parseInt(hrStr);
            var iMin = parseInt(minStr);

            if ( (iHr>=0) && (iHr<24) && (iMin>=0) && (iMin <60)) {
                timeValid = true;
                timeStr = moment(timeStr, "HH:mm").format("HH:mm");
                $("#first-input").val(timeStr);
            }
        }
    }

    if (!timeValid) {
        showErrorMessage("Wrong time format!", "Please re-enter in military time format (HH:mm).");
        $("#first-input").val("");
    }
});

$("#btn-yes").on("click", function() {
    var newVal = $("#text-new").val();
    if (newVal.length<=0) {
        var itemStr = "";
        if (updateType==UPDATE_NAME) {
            itemStr = "train name.";
        } else {
            itemStr = "destination.";
        }
        showErrorMessage("Blank input!", "Please re-enter " + itemStr);
        return;
    }

    var rowData = $("tbody").children();
    var rowSelected=-1;

    for(var i=0; i<rowData.length; i++) {
        if ($(rowData[i]).attr("id")===updateKey) {
            rowSelected = i;
            break;
        }
    }

    if (rowSelected>=0) {
        if (updateType==UPDATE_NAME) {
            var updateElem = $($(rowData[rowSelected]).children()[0]);
            updateElem.text(newVal);
            database.ref(updateKey).update({ name: newVal });

        } else if (updateType==UPDATE_DESTINATION) {
            var updateElem = $($(rowData[rowSelected]).children()[1]);
            updateElem.text(newVal);
            database.ref(updateKey).update({ destination: newVal });
        }
    }

    updateType = UPDATE_NONE;
    $("#myModal").modal("hide");
    $("#text-new").val("");
});

$("#btn-no").on("click", function() {
    $("#myModal").modal("hide");
    $("#text-new").val("");
})

$("#btn-ok").on("click", function() {
    $("#invalidModal").modal("hide");
})

$("#myModal").on('shown.bs.modal', function () {
    $("#text-new").focus();
});

function updateName() {
    var name = $(this).text();
    updateKey = $(this).parent().attr("id");
    updateType = UPDATE_NAME;
    
    $("#text-update").text("Update train name?");
    $("#text-current").text(name);
    $('#myModal').modal({backdrop: "static", keyboard: false});
}

function updateDestination() {
    var name = $(this).text();
    updateKey = $(this).parent().attr("id");
    updateType = UPDATE_DESTINATION;

    $("#text-update").text("Update destination?");
    $("#text-current").text(name);
    $('#myModal').modal({backdrop: "static", keyboard: false});
}


timeHandle = setInterval(minuteUpdate, 60000);

$(document).on("click", ".btn-secondary", removeRecord);
$(document).on("click", ".train-name", updateName);
$(document).on("click", ".train-dest", updateDestination);