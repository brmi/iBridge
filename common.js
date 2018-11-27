function InitFirestore() {
    const Config = {
        apiKey: "AIzaSyAN8crSUnsqppTAwIQMqOnr6KzVVn8gURo",
        authDomain: "ibridge-61c6a.firebaseapp.com",
        databaseURL: "https://ibridge-61c6a.firebaseio.com",
        projectId: "ibridge-61c6a",
        storageBucket: "ibridge-61c6a.appspot.com",
        messagingSenderId: "596019487968"
    };

    firebase.initializeApp(Config);
    var Firestore = firebase.firestore();
    const Settings = { timestampsInSnapshots: true };
    Firestore.settings(Settings);

    return Firestore;
}

function GetParam(Name) {
    var Results = new RegExp('[\?&]' + Name + '=([^&#]*)').exec(window.location.href);
    return Results == null ? null : decodeURI(Results[1]) || 0;
}

// Credit: https://www.w3schools.com/js/js_cookies.asp 
function SetCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
function GetCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

