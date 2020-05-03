var mainScreen = document.querySelector(".mainScreen");
var mainContainer = document.querySelector(".mainContainer");
var mainContainerHeader = document.querySelector(".mainContainerHeader");
var mainContainerSubheader = document.querySelector(".mainContainerSubheader");
var connectedQuizzersList = document.querySelector(".connectedQuizzersList");
var connectedQuizzersTitle = document.querySelector(".connectedQuizzersTitle");

var statusBox = document.querySelector(".statusBoxMainBox");
var statusBoxJumpBox = document.querySelector(".statusBoxJumpBox");
var statusBoxQuizzerName = document.querySelector(".statusBoxQuizzerName");

var controlBox = document.querySelector(".controlBox");
var jumpButton = document.querySelector(".jumpButton");
var jumpInstructionsLeftShiftContainer = document.querySelector(".jumpInstructionsLeftShiftContainer");
var jumpInstructionsSpacebarContainer = document.querySelector(".jumpInstructionsSpacebarContainer");
var jumpInstructionsRightShiftContainer = document.querySelector(".jumpInstructionsRightShiftContainer");
var jumpInstructionsLeftShift = document.querySelector(".jumpInstructionsLeftShift");
var jumpInstructionsSpacebar = document.querySelector(".jumpInstructionsSpacebar");
var jumpInstructionsRightShift = document.querySelector(".jumpInstructionsRightShift");

var connectScreen = document.querySelector(".connectScreen");
var connectScreenHeader = document.querySelector(".connectScreenHeader");
var connectScreenSubheader = document.querySelector(".connectScreenSubheader");
var connectScreenText = document.querySelector(".connectScreenText");
var connectScreenJoinButton = document.querySelector(".connectScreenJoinButton");

var quizzer1FirstNameInput = document.querySelector(".quizzer1FirstNameInput");
var quizzer1LastNameInput = document.querySelector(".quizzer1LastNameInput");
var quizzer2FirstNameInput = document.querySelector(".quizzer2FirstNameInput");
var quizzer2LastNameInput = document.querySelector(".quizzer2LastNameInput");
var quizzer3FirstNameInput = document.querySelector(".quizzer3FirstNameInput");
var quizzer3LastNameInput = document.querySelector(".quizzer3LastNameInput");

var quizzer1FirstName;
var quizzer1LastName;
var quizzer2FirstName;
var quizzer2LastName;
var quizzer3FirstName;
var quizzer3LastName;

var inputAreaNumberOfQuizzers = document.querySelector(".inputAreaNumberOfQuizzers")
var quizzer2InputArea = document.querySelector(".quizzer2InputArea");
var quizzer3InputArea = document.querySelector(".quizzer3InputArea");

var overlay = document.querySelector(".overlay");
var aboutScreen = document.querySelector(".aboutScreen");


var clockObject = null;
var remainingTimeOnClock = 0;

var controlBoxDivider = document.querySelector(".controlBoxDivider");
var clockContent = document.querySelector(".clockContent");


var peer;
var lastPeerId;
var conn;
var isReconnecting = false;
var setupMessage;

//Get the ID specified in the address after the "?" sign
var idToConnectTo = window.location.href.split("?")[1];


var quizzerNamesInLocalStorage = localStorage.getItem("quizzerNames");

if (quizzerNamesInLocalStorage) {

    var splitData = quizzerNamesInLocalStorage.split(";");

    switch (splitData[0]) {

        case "1":

            quizzer1FirstNameInput.value = splitData[1];
            quizzer1LastNameInput.value = splitData[2];

            break;

        case "2":

            quizzer1FirstNameInput.value = splitData[1];
            quizzer1LastNameInput.value = splitData[2];
            quizzer2FirstNameInput.value = splitData[3];
            quizzer2LastNameInput.value = splitData[4];

            addQuizzerInputArea();

            break;

        case "3":

            quizzer1FirstNameInput.value = splitData[1];
            quizzer1LastNameInput.value = splitData[2];
            quizzer2FirstNameInput.value = splitData[3];
            quizzer2LastNameInput.value = splitData[4];
            quizzer3FirstNameInput.value = splitData[5];
            quizzer3LastNameInput.value = splitData[6];

            addQuizzerInputArea();
            addQuizzerInputArea();

            break;

    }

}

function storeQuizzerNames(numberOfQuizzers) {

    var stringToStore;
    switch (numberOfQuizzers) {

        case 1:
            stringToStore = "1;" + quizzer1FirstName + ";" + quizzer1LastName;
            break;

        case 2:
            stringToStore = "2;" + quizzer1FirstName + ";" + quizzer1LastName + ";" + quizzer2FirstName + ";" + quizzer2LastName;
            break;

        case 3:
            stringToStore = "3;" + quizzer1FirstName + ";" + quizzer1LastName + ";" + quizzer2FirstName + ";" + quizzer2LastName + ";" + quizzer3FirstName + ";" + quizzer3LastName;
            break;

    }
    localStorage.setItem("quizzerNames", stringToStore);

}


function showAboutScreen() {

    overlay.style.zIndex = "99";
    overlay.style.opacity = 0.2;

    aboutScreen.style.transform = "translate(-50%, -100%)";

}

function hideAboutScreen() {

    overlay.style.opacity = 0;
    setTimeout(function () {
        overlay.style.zIndex = "-100"
    }, 400);

    aboutScreen.style.transform = "translate(-50%, 0)";

}

function alertBox(title, message) {

    var alertBoxElement = document.createElement("div");
    alertBoxElement.classList.add("alertBox");

    var titleElement = document.createElement("h1");
    titleElement.classList.add("alertBoxTitle");
    titleElement.textContent = title;

    var messageElement = document.createElement("p");
    messageElement.classList.add("alertBoxMessage");
    messageElement.textContent = message;

    var closeButton = document.createElement("div");
    closeButton.classList.add("closeButton");
    closeButton.onclick = function () {
        hideAlertBox(alertBoxElement)
    };
    closeButton.innerHTML = "<img class='closeButtonImageDark' src='images/close-dark.png'><img class='closeButtonImage' src='images/close.png'>";

    alertBoxElement.appendChild(closeButton);
    alertBoxElement.appendChild(titleElement);
    alertBoxElement.appendChild(messageElement);
    document.body.appendChild(alertBoxElement);

    overlay.onclick = function () {
        hideAlertBox(alertBoxElement)
    };

    overlay.style.zIndex = "99";
    overlay.style.opacity = 0.2;

    alertBoxElement.style.zIndex = "100";
    alertBoxElement.style.opacity = 1;

}

function hideAlertBox(element) {

    overlay.style.opacity = 0;
    setTimeout(function () {
        overlay.style.zIndex = "-100"
    }, 400);

    element.style.opacity = 0;
    setTimeout(function () {
        element.style.zIndex = "-100";
    }, 400);

    overlay.onclick = function () {
        hideAboutScreen()
    };

}


function addQuizzerInputArea() {

    if (quizzer2InputArea.style.display == "none") {

        quizzer2InputArea.style.display = '';
        inputAreaNumberOfQuizzers.textContent = "2 Quizzers";

    } else if (quizzer3InputArea.style.display == "none") {

        quizzer3InputArea.style.display = '';
        inputAreaNumberOfQuizzers.textContent = "3 Quizzers";

    } else {

        alertBox("Too many quizzers", "Virtual Quiz supports a maximum of three quizzers on the same device.");

    }

}

function removeQuizzerInputArea() {

    if (quizzer3InputArea.style.display == "") {

        quizzer3InputArea.style.display = 'none';
        inputAreaNumberOfQuizzers.textContent = "2 Quizzers";

        quizzer3FirstNameInput.value = "";
        quizzer3LastNameInput.value = "";

    } else if (quizzer2InputArea.style.display == "") {

        quizzer2InputArea.style.display = 'none';
        inputAreaNumberOfQuizzers.textContent = "1 Quizzer";

        quizzer2FirstNameInput.value = "";
        quizzer2LastNameInput.value = "";

    }

}

function clearQuizzerInputAreaFields() {

    quizzer1FirstNameInput.value = "";
    quizzer1LastNameInput.value = "";
    quizzer2FirstNameInput.value = "";
    quizzer2LastNameInput.value = "";
    quizzer3FirstNameInput.value = "";
    quizzer3LastNameInput.value = "";

    removeQuizzerInputArea();
    removeQuizzerInputArea();

}


function initialize() {
    // Create own peer object with connection to shared PeerJS server
    peer = new Peer(null, {
        debug: 0
    });

    peer.on('open', function (id) {
        // Workaround for peer.reconnect deleting previous id
        if (peer.id === null) {
            console.log('Received null id from peer open');
            peer.id = lastPeerId;
        } else {
            lastPeerId = peer.id;
        }

        console.log('ID: ' + peer.id);
        connectScreenSubheader.textContent = "We're connecting you to your quiz round...";
        join();
    });
    peer.on('disconnected', function () {
        console.log('Connection lost. Please reconnect');

        connectScreenSubheader.textContent = "Disconnected from quiz. Reconnecting...";
        mainContainerHeader.textContent = "Disconnected from quiz";
        mainContainerSubheader.textContent = "Reconnecting...";

        isReconnecting = true;
        // Workaround for peer.reconnect deleting previous id
        peer.id = lastPeerId;
        peer._lastServerId = lastPeerId;
        peer.reconnect();
    });
    peer.on('close', function () {
        conn = null;
        console.log('Connection destroyed');
    });
    peer.on('error', function (err) {
        console.log(err);
        connectScreenHeader.textContent = "Something went wrong";
        connectScreenSubheader.textContent = "We couldn't connect you to your quiz round.";
        connectScreenText.textContent = "Make sure you have the right link, or try again in a few minutes."

        mainContainerHeader.textContent = "Something went wrong";
        mainContainerSubheader.textContent = "Try again in a few minutes.";

        connectScreenJoinButton.textContent = "Something Went Wrong"
    });
};

function join() {
    // Close old connection
    if (conn) {
        conn.close();
    }

    // Create connection to destination peer specified in the input field
    conn = peer.connect(idToConnectTo, {
        reliable: true
    });

    conn.on('open', function () {
        connectScreenSubheader.textContent = "Connected to quiz.";
        connectScreenJoinButton.disabled = false;
        connectScreenJoinButton.textContent = "Join Round";

        mainContainerHeader.textContent = "Connected to quiz";
        mainContainerSubheader.textContent = "You are now an active quizzer in this round";

        if (isReconnecting) {
            sendMessage(setupMessage);
            isReconnecting = false;
        }

        console.log("Connected to: " + conn.peer);
    });

    // Handle incoming data
    conn.on('data', function (data) {
        console.log("Received: " + data);
        receivedData(data);
    });
    conn.on('close', function () {
        console.log("Connection closed");

        if (!isReconnecting) {

            mainContainerHeader.textContent = "Connection closed";
            mainContainerSubheader.textContent = "The connection was closed by the quizmaster.";

            connectScreenHeader.textContent = "Connection closed";
            connectScreenSubheader.textContent = "The connection was closed by the quizmaster.";
            connectScreenJoinButton.textContent = "Connection closed.";
            connectScreenJoinButton.disabled = true;

            connectedQuizzersTitle.style.display = "none";
            while (connectedQuizzersList.firstChild) {
                connectedQuizzersList.removeChild(connectedQuizzersList.lastChild);
            }

        }
    });
};

function sendMessage(message) {
    if (conn && conn.open) {
        conn.send(message);
        console.log("Sent: " + message);
    } else {
        console.log('Connection is closed');
    }
}

function receivedData(data) {

    var splitData = data.split(";");
    var type = splitData[0];

    switch (type) {

        case "jumped":

            showJumpBox(splitData[1] + " " + splitData[2]);

            break;

        case "arm":

            if (splitData[1] == "arm") {
                hideJumpBox();
                statusBox.textContent = "Ready to jump.";
                clockContent.textContent = "0";
            } else {
                statusBox.textContent = "";
            }

            break;

        case "quizzerList":

            while (connectedQuizzersList.firstChild) {
                connectedQuizzersList.removeChild(connectedQuizzersList.lastChild);
            }
            for (var i = 0; i < (splitData.length - 1); i++) {

                var listItemElement = document.createElement("li");
                listItemElement.textContent = splitData[i + 1];
                connectedQuizzersList.appendChild(listItemElement);

            }

            break;

        case "clock":

            if (splitData[1] == "start") {

                startClock(new Number(splitData[2]));

            } else {

                stopClock();

            }

            break;

        case "heartbeat":

            if (isReconnecting) {

                connectScreenSubheader.textContent = "Connected to quiz.";
                connectScreenJoinButton.disabled = false;
                connectScreenJoinButton.textContent = "Join Round";

                mainContainerHeader.textContent = "Connected to quiz";
                mainContainerSubheader.textContent = "You are now an active quizzer in this round";

                sendMessage(setupMessage);
                isReconnecting = false;

            }

            break;

    }

}


function joinButtonClicked() {

    var numberOfQuizzers;
    if (quizzer3FirstNameInput.value || quizzer3LastNameInput.value) {

        if (!quizzer3FirstNameInput.value || !quizzer3LastNameInput.value || !quizzer2FirstNameInput.value || !quizzer2LastNameInput.value || !quizzer1FirstNameInput.value || !quizzer1LastNameInput.value) {
            alertBox("Please enter quizzer names", "Please enter each quizzer's first and last name.");
            return;
        }

        numberOfQuizzers = 3;

        mainContainer.style.height = "calc(75% - 150px)";
        controlBox.style.height = "100px";
        controlBoxDivider.style.display = "block";

        quizzer3FirstName = quizzer3FirstNameInput.value;
        quizzer3LastName = quizzer3LastNameInput.value;

        quizzer2FirstName = quizzer2FirstNameInput.value;
        quizzer2LastName = quizzer2LastNameInput.value;

    } else if (quizzer2FirstNameInput.value || quizzer2LastNameInput.value) {

        if (!quizzer2FirstNameInput.value || !quizzer2LastNameInput.value || !quizzer1FirstNameInput.value || !quizzer1LastNameInput.value) {
            alertBox("Please enter quizzer names", "Please enter each quizzer's first and last name.");
            return;
        }

        numberOfQuizzers = 2;

        mainContainer.style.height = "calc(75% - 150px)";
        controlBox.style.height = "100px";
        controlBoxDivider.style.display = "block";

        quizzer2FirstName = quizzer2FirstNameInput.value;
        quizzer2LastName = quizzer2LastNameInput.value;

    } else {

        if (!quizzer1FirstNameInput.value || !quizzer1LastNameInput.value) {
            alertBox("Please enter your name", "Please enter your first and last name.");
            return;
        }

        numberOfQuizzers = 1;
    }

    quizzer1FirstName = quizzer1FirstNameInput.value;
    quizzer1LastName = quizzer1LastNameInput.value;

    switch (numberOfQuizzers) {

        case 3:

            setupMessage = "setup;3;" + quizzer1FirstName + ";" + quizzer1LastName + ";" + quizzer2FirstName + ";" + quizzer2LastName + ";" + quizzer3FirstName + ";" + quizzer3LastName;

            jumpInstructionsLeftShift.textContent = quizzer1FirstName;
            jumpInstructionsSpacebar.textContent = quizzer2FirstName;
            jumpInstructionsRightShift.textContent = quizzer3FirstName;

            jumpInstructionsLeftShiftContainer.style.display = "block";
            jumpInstructionsSpacebarContainer.style.display = "block";
            jumpInstructionsRightShiftContainer.style.display = "block";

            jumpButton.style.display = "none";

            storeQuizzerNames(3);

            break;
        case 2:

            setupMessage = "setup;2;" + quizzer1FirstName + ";" + quizzer1LastName + ";" + quizzer2FirstName + ";" + quizzer2LastName;

            jumpInstructionsLeftShift.textContent = quizzer1FirstName;
            jumpInstructionsRightShift.textContent = quizzer2FirstName;

            jumpInstructionsLeftShiftContainer.style.display = "block";
            jumpInstructionsRightShiftContainer.style.display = "block";

            jumpButton.style.display = "none";

            storeQuizzerNames(2);

            break;
        case 1:

            setupMessage = "setup;1;" + quizzer1FirstName + ";" + quizzer1LastName;

            storeQuizzerNames(1);

            break;
    }

    sendMessage(setupMessage);
    connectScreen.style.display = "none";
    mainScreen.style.display = "";

}

function jump(quizzerNumber) {

    sendMessage("jump;quizzer" + quizzerNumber);

}

function showJumpBox(name) {

    statusBoxQuizzerName.textContent = name;
    statusBox.style.display = "none";
    statusBoxJumpBox.style.display = "";

}

function hideJumpBox() {

    statusBox.textContent = "";
    statusBox.style.display = "";
    statusBoxJumpBox.style.display = "none";

}

function startClock(lengthInSeconds) {

    if (clockObject) {
        stopClock();
    }

    remainingTimeOnClock = lengthInSeconds;
    clockContent.textContent = remainingTimeOnClock;
    clockObject = window.setInterval(function () {

        clockContent.textContent = --remainingTimeOnClock;
        if (remainingTimeOnClock == 0) {
            stopClock(lengthInSeconds);
        }

    }, 1000);

}

function stopClock(lengthInSeconds) {

    window.clearInterval(clockObject);
    clockObject = null;

}


document.body.addEventListener("keydown", function (e) {

    if (!connectScreen.style.display == "none") {
        return;
    }

    switch (e.code) {

        case "ShiftLeft":

            if (quizzer3FirstName || quizzer2FirstName) {

                jump(1);

            }

            break;
        case "Space":

            if (quizzer3FirstName) {

                jump(2);

            } else if (quizzer2FirstName) {

                return;

            } else {

                jump(1);

            }

            break;
        case "ShiftRight":

            if (quizzer3FirstName) {

                jump(3);

            } else if (quizzer2FirstName) {

                jump(2);

            }

            break;

    }

});

initialize();

console.log("#It'sRegionalsNotFieldFinals");
