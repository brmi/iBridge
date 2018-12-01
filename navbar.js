$(document).ready(() => {
    if (!firebase.apps.length) {
        var Firestore = InitFirestore();
     } else {
        var Firestore = getFirebase();
    }
    const UserID = parseInt(GetCookie("auth"));

    // @todo Ideally the cookie also tracks username
    Firestore.collection("Profiles").where("id", "==", UserID).get().then(function(Query) {
        Query.forEach(function(Doc){
            const Profile = Doc.data();
            const ProfileURL = "profile.html?id=" + UserID;
            // const MeetupURL = "meetups.html";
            // const ProfileURL = "https://brmi.github.io/iBridge/profile.html?id=" + UserID;
            // const MeetupURL = "https://brmi.github.io/iBridge/meetups.html";
            // $(".Navbar").prepend("<a href='" + MeetupURL + "'>Meetups</a>");
            $(".Navbar .profile-nav").attr("href", ProfileURL);
            $(".Navbar .profile-nav").text("Welcome, " + Profile.first);
        })
    });
});

