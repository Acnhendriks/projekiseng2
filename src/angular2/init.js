var configChannel = 'web'; //possible values: app, web
var deviceId = '';
var vDbSqlite;

var app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;

if(navigator.userAgent.match(/(iOS|iPhone|iPod|iPad|Android|blackberry|Windows Phone)/) && app) {
    console.log("UA: Running in Cordova/PhoneGap");
    var script = document.createElement('script');
    script.src = 'cordova.js';
    document.head.appendChild(script);
    document.addEventListener("deviceready", bootstrapApp, false);
    console.log("device ready event listener activated");
    configChannel = 'app';
}else{
    configChannel = 'web';
    console.log("UA: Running in browser");
    bootstrapWeb();    
}

function bootstrapWeb() {
    // WL.Client.init(wlInitOptions);
    console.log("Bootstrapping AngularJS web");
}

function bootstrapApp() {
    // set status bar
    if(window.StatusBar) {
    // org.apache.cordova.statusbar required
        StatusBar.overlaysWebView(false);
        StatusBar.backgroundColorByHexString("#40aa1b");
    }
    // StatusBar.overlaysWebView(false);
    console.log("Bootstrapping AngularJS appp");
    // deviceId = device.uuid;
    
    // fullscreen
    // AndroidFullScreen.immersiveMode(successFunction, errorFunction);
}

function successFunction()
{
    console.info("It worked!");
}

function errorFunction(error)
{
    console.error(error);
}

function onBackKeyDown() {
    alert('back key pressed');
    console.log('back key pressed');
    // Handle the back button
}

// This event fires when the keyboard will hide
window.addEventListener('native.keyboardshow', keyboardShowHandler);

function keyboardShowHandler(e){
    $("body").addClass("keyboardOn");
}

// This event fires when the keyboard will show
window.addEventListener('native.keyboardhide', keyboardHideHandler);

function keyboardHideHandler(e){
    $("body").removeClass("keyboardOn");
}

