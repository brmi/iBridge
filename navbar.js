$(document).ready(() => {
    if (!firebase.apps.length) {
        console.log('not initialized navbar');
        var Firestore = InitFirestore();
     } else {
        console.log('already initialized navbar');
         var Firestore = getFirebase();
    }
    const UserID = parseInt(GetCookie("auth"));

    // @todo Ideally the cookie also tracks username
    Firestore.collection("Profiles").where("id", "==", UserID).get().then(function(Query) {
        Query.forEach(function(Doc){
            const Profile = Doc.data();
            const ProfileURL = "https://brmi.github.io/iBridge/profile.html?id=" + UserID;
            const MeetupURL = "https://brmi.github.io/iBridge/meetups.html";
            $(".Navbar").prepend("<a href='" + MeetupURL + "'>Meetups</a>");
            $(".Navbar").prepend("<a class='active' href=" + ProfileURL + ">Welcome, " + Profile.first + "</a>");
        })
    });
});

