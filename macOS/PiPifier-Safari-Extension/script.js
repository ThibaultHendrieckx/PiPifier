//image URLs
var whiteSVG_Icon = safari.extension.baseURI + 'PiP_Toolbar_Icon_white.svg';
var blackSVG_Icon = safari.extension.baseURI + 'PiP_Toolbar_Icon.svg';

safari.self.addEventListener("message", messageHandler); // Message recieved from Swift code
window.onfocus = function() {
    previousResult = false;
    checkForVideo();
}; // Tab selected
new MutationObserver(checkForVideo).observe(document, {subtree: true, childList: true}); // DOM changed

function dispatchMessage(messageName, parameters) {
    safari.extension.dispatchMessage(messageName, parameters);
}

function messageHandler(event) {
    if (event.name === "enablePiP" && getVideo() != null) {
        enablePiP();
    } else if (event.name === "addCustomPiPButtonToPlayer") {
        window[event.message.callback]() //Calls the function specified as callback
    }
}

var previousResult = false;

function checkForVideo() {
    if (getVideo() != null /* && getVideo().videoTracks.length > 0 */) {
        addCustomPiPButtons();
        if (!previousResult) {
            dispatchMessage("videoCheck", {found: true});
        }
        previousResult = true;
    } else if (window == window.top) {
        if (previousResult) {
            dispatchMessage("videoCheck", {found: false});
        }
        previousResult = false;
    }
}

function getVideo() {
    // return document.getElementsByTagName('video')[0];
    var videos = document.getElementsByTagName('video');
    // if (videos.length < 2) return videos[0];
    for (i = 0; i < videos.length; ++i) {
        if (!videos[i].paused) return videos[i];
    }
    return null;
}

function enablePiP() {
    getVideo().webkitSetPresentationMode('picture-in-picture');
}

//----------------- Custom Button Methods -----------------

var players = [
               {name: "YouTube", shouldAddButton: shouldAddYouTubeButton, addButton: addYouTubeButton},
               {name: "VideoJS", shouldAddButton: shouldAddVideoJSButton, addButton: addVideoJSButton},
               {name: "Netflix", shouldAddButton: shouldAddNetflixButton, addButton: addNetflixButton},
               {name: "Wistia", shouldAddButton: shouldAddWistiaButton, addButton: addWistiaButton},
               {name: "VUPlay", shouldAddButton: shouldAddVUPlayButton, addButton: addVUPlayButton},
               {name: "YeloPlay", shouldAddButton: shouldAddYeloPlayButton, addButton: addYeloPlayButton},
               //TODO: add other players here
               ];

function addCustomPiPButtons() {
    for (const player of players) {
        if (player.shouldAddButton()) {
            dispatchMessage("pipCheck", {callback: player.addButton.name}) //Sets the callback to the player's addButton
        }
    }
}

//----------------- Player Implementations -------------------------

function shouldAddYouTubeButton() {
    //check if on youtube or player is embedded
    return (location.hostname.match(/^(www\.)?youtube\.com$/)
            || document.getElementsByClassName("ytp-right-controls").length > 0)
    && document.getElementsByClassName('PiPifierButton').length == 0;
}

function addYouTubeButton() {
    if (!shouldAddYouTubeButton()) return;
    var button = document.createElement("button");
    button.className = "ytp-button PiPifierButton";
    button.title = "PiP (by PiPifier)";
    button.onclick = enablePiP;
    //TODO add style
    //button.style.backgroundImage = 'url('+ whiteSVG_Icon + ')';
    var buttonImage = document.createElement("img");
    buttonImage.src = whiteSVG_Icon;
    buttonImage.width = 22;
    buttonImage.height = 36;
    button.appendChild(buttonImage);

    document.getElementsByClassName("ytp-right-controls")[0].appendChild(button);
}


function shouldAddVideoJSButton() {
    return document.getElementsByClassName('vjs-control-bar').length > 0
    && document.getElementsByClassName('PiPifierButton').length == 0;
}


function addVideoJSButton() {
    if (!shouldAddVideoJSButton()) return;
    var button = document.createElement("button");
    button.className = "PiPifierButton vjs-control vjs-button";
    button.title = "PiP (by PiPifier)";
    button.onclick = enablePiP;
    var buttonImage = document.createElement("img");
    buttonImage.src = whiteSVG_Icon;
    buttonImage.width = 16;
    buttonImage.height = 30;
    button.appendChild(buttonImage);
    var fullscreenButton = document.getElementsByClassName("vjs-fullscreen-control")[0];
    fullscreenButton.parentNode.insertBefore(button, fullscreenButton);
}

function shouldAddWistiaButton() {
    return document.getElementsByClassName('wistia_playbar').length > 0
    && document.getElementsByClassName('PiPifierButton').length == 0;
}

function addWistiaButton() {
    if (!shouldAddWistiaButton()) return;
    var button = document.createElement("button");
    button.className = "PiPifierButton w-control w-control--fullscreen w-is-visible";
    button.alt = "Picture in Picture";
    button.title = "PiP (by PiPifier)";
    button.onclick = enablePiP;
    var buttonImage = document.createElement("img");
    buttonImage.src = whiteSVG_Icon;
    buttonImage.width = 28;
    buttonImage.height = 18;
    buttonImage.style.verticalAlign = "middle";
    button.appendChild(buttonImage);
    document.getElementsByClassName("w-control-bar__region--airplay")[0].appendChild(button);
}


function shouldAddNetflixButton() {
    return (location.hostname.match(/^(www\.)?netflix\.com$/)
            && location.pathname.match("watch"))
    && document.getElementsByClassName('PiPifierButton').length == 0;
}

function addNetflixButton(timeOutCounter) {
    if (!shouldAddNetflixButton()) return;
    if (timeOutCounter == null) timeOutCounter = 0;
    var button = document.createElement("button");
    button.className = "PiPifierButton touchable PlayerControls--control-element";
    button.title = "PiP (by PiPifier)";
    button.onclick = enablePiP;
    button.style.backgroundColor = "transparent";
    button.style.border = "none";
    var buttonImage = document.createElement("img");
    buttonImage.src = whiteSVG_Icon;
    buttonImage.className = "touchable PlayerControls--control-element";
    buttonImage.style.maxHeight = "40%";
    button.appendChild(buttonImage);
    var fullscreenButton = document.getElementsByClassName("button-bvuiFullScreenOn")[0];
    if (fullscreenButton == null && timeOutCounter < 3) {
        //this is needed because the div is sometimes not reachable on the first load
        //also necessary to count up and stop at some time to avoid endless loop on main netflix page
        setTimeout(function() {addNetflixButton(timeOutCounter+1);}, 3000);
        // some weird bugfix where you need to pause the video before safari/netflix allows pip
        getVideo().pause()
        getVideo().play()
        return;
    }
    fullscreenButton.parentNode.insertBefore(button, fullscreenButton);
}

function shouldAddVUPlayButton() {
    return document.getElementsByClassName('vuplay-video-control-container').length > 0
    && document.getElementsByClassName('PiPifierButton').length == 0;
}

function addVUPlayButton() {
    if (!shouldAddVUPlayButton()) return;
    var button = document.createElement("button");
    button.className = "PiPifierButton vuplay-control vjs-button";
    button.title = "PiP (by PiPifier)";
    button.onclick = enablePiP;
    var buttonImage = document.createElement("img");
    buttonImage.src = whiteSVG_Icon;
    buttonImage.width = 29;
    buttonImage.height = 54;
    button.appendChild(buttonImage);
    var fullscreenButton = document.getElementsByClassName("vuplay-control-fullscreen")[0];
    fullscreenButton.parentNode.insertBefore(button, fullscreenButton);
}

function shouldAddYeloPlayButton() {
    return (location.hostname.match(/^(www\.)?yeloplay\.be$/)
            && (location.pathname.match(/^\/watch-tv$/)))
    && document.getElementsByClassName('PiPifierButton').length == 0;
}

function addYeloPlayButton() {
    if (!shouldAddYeloPlayButton()) return;
    var button = document.createElement("button");
    button.className = "PiPifierButton";
    button.title = "PiP (by PiPifier)";
    button.onclick = enablePiP;
    var buttonImage = document.createElement("img");
    buttonImage.src = whiteSVG_Icon;
    buttonImage.width = 40;
    buttonImage.height = 25;
    buttonImage.className = "button";
    button.appendChild(buttonImage);
    document.getElementsByClassName("buttons has-swipe-button")[0].style.width = "200px";
    var fullscreenButton = document.getElementsByTagName("player-fullscreen-button")[0];
    fullscreenButton.parentNode.insertBefore(button, fullscreenButton);
}
