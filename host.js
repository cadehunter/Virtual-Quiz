var mainContainerHeader = document.querySelector(".mainContainerHeader");
var mainContainerSubheader = document.querySelector(".mainContainerSubheader");
var connectionInstructions = document.querySelector(".connectionInstructions");
var copyLinkButton = document.querySelector(".copyLinkButton");
var connectedQuizzersList = document.querySelector(".connectedQuizzersList");

var statusBox = document.querySelector(".statusBoxMainBox");
var statusBoxJumpBox = document.querySelector(".statusBoxJumpBox");
var statusBoxQuizzerName = document.querySelector(".statusBoxQuizzerName");

var armButton = document.querySelector(".armButton");

var overlay = document.querySelector(".overlay");
var aboutScreen = document.querySelector(".aboutScreen");

var listeningForJump = false;

var peer;
var lastPeerId;
var conn = {};
var currentPeerLink;


var questionTimeLimit = 5;
var answerTimeLimit = 35;
var timeoutTimeLimit = 75;

var clockObject = null;
var remainingTimeOnClock = 0;

var clockContent = document.querySelector(".clockContent");


//var jumpSoundAudioElement = new Audio("beepSound.mp4");
//jumpSoundAudioElement.preload = "auto";
//jumpSoundAudioElement.volume = 0.5;

var jumpSoundAudioElement = new Howl({
    src: ['sounds/jump.mp3'],
    volume: 0.5,
    preload: true
});

var timerExpiredSoundAudioElement = new Howl({
    src: ['sounds/timerExpired.mp3'],
    volume: 0.3,
    preload: true
});


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

        console.log("ID: " + peer.id);
        console.log("Awaiting connection.")

        mainContainerHeader.textContent = "Hosting a quiz";
        mainContainerSubheader.textContent = "Ready for connections."
        currentPeerLink = "cadehunter.github.io/Virtual-Quiz/join.html?" + peer.id;
        connectionInstructions.innerHTML = "To join the round, go to " + currentPeerLink;
        copyLinkButton.style.display = "";

    });
    peer.on('connection', function (c) {

        conn[c.peer] = c;
        console.log("Connected to: " + c.peer);
        ready(c.peer);

    });
    peer.on('disconnected', function () {
        console.log('Connection lost. Please reconnect');

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
        mainContainerHeader.textContent = "Something went wrong";
        mainContainerSubheader.textContent = "Try again in a few minutes.";
    });
    
    
};

function ready(peerID) {
    (function () {
        conn[peerID].on('data', function (data) {
            console.log("Received " + data + " from " + peerID);
            receivedData(data, peerID);
        });
        conn[peerID].on('close', function () {
            console.log("Connection to " + peerID + " reset. Awaiting connection...");
            if (conn[peerID].quizzer1.firstName) {
                var elements = document.querySelectorAll(".listItem" + peerID);
                for (var i = 0; i < elements.length; i++) {
                    connectedQuizzersList.removeChild(elements[i]);
                }
            }
            conn[peerID] = null;
            forwardQuizzerList();
        });
    })()
}

function sendMessage(peerID, message) {
    if (conn[peerID] && conn[peerID].open) {
        conn[peerID].send(message);
        console.log("Sent: " + message + " to " + peerID);
    } else {
        console.log('Connection is closed');
    }
}

function receivedData(data, peerID) {

    var splitData = data.split(";");
    var type = splitData[0];

    switch (type) {

        case "jump":

            if (listeningForJump) {

                listeningForJump = false;
                jumpSoundAudioElement.play();

                showJumpBox(conn[peerID][splitData[1]].firstName + " " + conn[peerID][splitData[1]].lastName);
                changeArmButtonMode("startAnswerClock");

                stopClock();
                forwardJumpEvent(conn[peerID][splitData[1]].firstName + ";" + conn[peerID][splitData[1]].lastName);

            }

            break;
        case "setup":

            conn[peerID].quizzer3 = {};
            conn[peerID].quizzer2 = {};
            conn[peerID].quizzer1 = {};

            var numberOfQuizzers = splitData[1];
            switch (numberOfQuizzers) {
                case "3":
                    conn[peerID].quizzer3.firstName = splitData[6];
                    conn[peerID].quizzer3.lastName = splitData[7];
                case "2":
                    conn[peerID].quizzer2.firstName = splitData[4];
                    conn[peerID].quizzer2.lastName = splitData[5];
                case "1":
                    conn[peerID].quizzer1.firstName = splitData[2];
                    conn[peerID].quizzer1.lastName = splitData[3];
                    break;
            }

            for (var i = 0; i < numberOfQuizzers; i++) {

                (function () {
                    var element = document.createElement("li");
                    element.textContent = conn[peerID]["quizzer" + (i + 1)].firstName + " " + conn[peerID]["quizzer" + (i + 1)].lastName;
                    element.classList.add("listItem" + peerID);
                    connectedQuizzersList.appendChild(element);
                })()

            }

            forwardQuizzerList();

            break;

    }

}


function forwardJumpEvent(name) {

    var keys = Object.keys(conn);
    for (var i = 0; i < keys.length; i++) {
        sendMessage(keys[i], "jumped;" + name);
    }

}

function forwardArmEvent() {

    var keys = Object.keys(conn);
    for (var i = 0; i < keys.length; i++) {
        sendMessage(keys[i], "arm;arm");
    }

}

function forwardDisarmEvent() {

    var keys = Object.keys(conn);
    for (var i = 0; i < keys.length; i++) {
        sendMessage(keys[i], "arm;disarm");
    }

}

function forwardQuizzerList() {

    var stringToSend = "";
    for (var i = 0; i < connectedQuizzersList.childElementCount; i++) {
        stringToSend += (";" + connectedQuizzersList.children[i].textContent);
    }

    var keys = Object.keys(conn);
    for (var i = 0; i < keys.length; i++) {
        sendMessage(keys[i], "quizzerList" + stringToSend);
    }

}

function forwardClockEvent(type, lengthInSeconds) {

    var stringToSend = "";
    switch (type) {

        case "start":

            stringToSend += ("start;" + lengthInSeconds);

            break;

        case "stop":

            stringToSend += ("stop");

            break;

    }

    var keys = Object.keys(conn);
    for (var i = 0; i < keys.length; i++) {
        sendMessage(keys[i], "clock;" + stringToSend);
    }

}


function copyLinkToClipboard() {
    var element = document.createElement('textarea');
    element.value = currentPeerLink;
    element.setAttribute('readonly', '');
    element.style.position = 'absolute';
    element.style.left = '-9999px';
    document.body.appendChild(element);
    element.select();
    document.execCommand('copy');
    document.body.removeChild(element);
    copyLinkButton.textContent = "Link Copied";
    setTimeout(function () {
        copyLinkButton.textContent = "Copy Link"
    }, 5000);
}

function arm() {

    stopClock();

    clockContent.textContent = "0";

    listeningForJump = true;
    statusBox.textContent = "Armed";

    changeArmButtonMode("startQuestionClock");

    forwardArmEvent();

}

function disarm() {

    listeningForJump = false;
    statusBox.textContent = "";

    changeArmButtonMode("arm");

    forwardDisarmEvent();

}


function changeArmButtonMode(mode) {

    function changeToStartQuestionClock() {

        armButton.textContent = "Start Clock";
        armButton.onclick = function () {
            startClock(questionTimeLimit);
            changeToStopQuestionClock();
        };

    }

    function changeToStopQuestionClock() {

        armButton.textContent = "Stop Clock";
        armButton.onclick = function () {
            stopClock();
            changeToStartQuestionClock();
        };

    }


    function changeToStartAnswerClock() {

        armButton.textContent = "Start Question Clock";
        armButton.onclick = function () {
            startClock(answerTimeLimit);
            changeToStopAnswerClock();
        };

    }

    function changeToStopAnswerClock() {

        armButton.textContent = "Stop Question Clock";
        armButton.onclick = function () {
            stopClock();
            changeToStartAnswerClock();
        };

    }


    function changeToArm() {

        armButton.innerHTML = "<span style='font-weight: bold;'>Arm</span> (or press the spacebar)";
        armButton.onclick = function () {
            arm();
            changeToStartQuestionClock();
        };

    }

    switch (mode) {

        case "startQuestionClock":
            changeToStartQuestionClock();
            break;
        case "stopQuestionClock":
            changeToStopQuestionClock();
            break;

        case "startAnswerClock":
            changeToStartAnswerClock();
            break;
        case "stopAnswerClock":
            changeToStopAnswerClock();
            break;

        case "arm":
            changeToArm();
            break;

    }

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

function cancelJump() {

    hideJumpBox();
    stopClock();
    changeArmButtonMode("arm");

}


function startClock(lengthInSeconds) {

    if (clockObject) {
        stopClock();
    }

    remainingTimeOnClock = lengthInSeconds;
    clockContent.textContent = remainingTimeOnClock;
    clockObject = window.setInterval(function () {

        clockContent.textContent = --remainingTimeOnClock;
        if (remainingTimeOnClock <= 0) {
            timerExpiredSoundAudioElement.play();
            stopClock(lengthInSeconds);
        }

    }, 1000);

    forwardClockEvent("start", lengthInSeconds);

}

function stopClock(lengthInSeconds) {

    window.clearInterval(clockObject);
    clockObject = null;

    if (lengthInSeconds == questionTimeLimit) {
        disarm();
    }

    forwardClockEvent("stop");

}


document.body.addEventListener("keydown", function (e) {

    if (e.code == "Space") {
        armButton.click();
    }

});

initialize();

console.log("#It'sRegionalsNotFieldFinals");
