$(document).ready(() => {
    var Firestore = InitFirestore();
    const UserID = parseInt(GetCookie("auth"));

    // @todo Ideally the cookie also tracks username
    Firestore.collection("Profiles").where("id", "==", UserID).get().then(function(Query) {
        Query.forEach(function(Doc){
            const Profile = Doc.data();
            const ProfileURL = "http://localhost:8000/profile.html?id=" + UserID;
            const MeetupURL = "http://localhost:8000/meetups.html";
            $(".Navbar").prepend("<a href='" + MeetupURL + "'>Meetups</a>");
            $(".Navbar").prepend("<a class='active' href=" + ProfileURL + ">Welcome, " + Profile.first + "</a>");
        })
    });
});