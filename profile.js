$(document).ready(() => {
    var Firestore = InitFirestore();
    const UserID = parseInt(GetParam("id"));

    Firestore.collection("Profiles").where("id", "==", UserID).get().then(function(Query){
        Query.forEach(function(Doc){
            const Profile = Doc.data();
            $("#FirstName").text(Profile.first);
            $("#LastName").text(Profile.last);
            $("#School").text(Profile.school);
            $("#Country").text(Profile.country);
            $("#Description").text(Profile.bio);
        });
    });

    Firestore.collection("Interests").where("id", "==", UserID).get().then(function(Query){
        Query.forEach(function(Doc){
            const Interest = Doc.data();
            $(".Interests").append("<button type='button' class='btn btn-secondary Interest'>" + Interest.interest + "</button>");
        });
    })

    Firestore.collection("Tips").where("id", "==", UserID).get().then(function(Query){
        Query.forEach(function(Doc){
            const Tip = Doc.data();
            $("#ListOfTips").append("<li>" + Tip.tip + "</li>");
        });
    });

    Firestore.collection("Meetups").where("createdby", "==", UserID).get().then(function(Query){
        Query.forEach(function(Doc){
            const Meetup = Doc.data();
            console.log(Meetup);
            $("#ListOfMeetups").append("<li class='Meetup'><p class='MeetupName'>" + Meetup.name + "</p><p class='MeetupDescription'>" + Meetup.description + "</p><p class='MeetupTime'>Time: " + Meetup.time + "</p><p class='MeetupLocation'>Location: " + Meetup.location + "</p><button type='submit'>Interested</button></li>");
        });
    });

    // @todo If the cookie id == id of the profile, allow editing
});