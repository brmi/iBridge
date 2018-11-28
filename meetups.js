var Firestore = InitFirestore();

$(document).ready(function() {
    
    const MyID = parseInt(GetCookie("auth"));
    var MaxMeetupID = 0;
    let firstname = 'NO FIRSTNAME';
    let lastname = 'NO LASTNAME';

    Firestore.collection("Meetups").get().then(function(Query){
        Query.forEach(function(Doc) {
            const Meetup = Doc.data();
            const MeetupItem = CreateMeetupItem(Meetup.name, Meetup.description, Meetup.location, Meetup.time, 
                                Meetup.meetupid, Meetup.firstname, Meetup.lastname, Meetup.attending, 
                                Meetup.createdby == MyID, Meetup.attending.includes(MyID));
            $(".meetups").prepend(MeetupItem);
            MaxMeetupID = Math.max(MaxMeetupID, Meetup.meetupid);
        });
    });

    // Get Profile First & Last Name
    Firestore.collection("Profiles").where("id", "==", MyID).get().then(function(Query){
        Query.forEach(function(Doc){
            const Profile = Doc.data();
            firstname = Profile.first;
            lastname = Profile.last;
        });
    });

    $( ".create" ).on( "click", function() {
        $('.create-meetup').css({'display': 'flex'});
    });

    $( ".cancel-meetup" ).on( "click", function() {
        $('.create-meetup').css({'display': 'none'});
    });

    $( ".add-meetup" ).on( "click", function() {
        const Title = $("#in-title").val();
        const Description = $("#in-description").val();
        const Location = $("#in-location").val();
        const Time = $("#in-time").val();
        let Attending = [MyID]; //profile ids of people attending
        
        const MeetupItem = CreateMeetupItem(Title, Description, Location, Time, ++MaxMeetupID, firstname, lastname, Attending, true, true);

        if (Title == "" || Description == "" || Location == "" || Time == "") {
            // @todo Error box
            $(".Error").append("<p style='color: red; margin-top:10px;'>Error: Cannot leave a field blank.</p>");
        } else {
            Firestore.collection("Meetups").add({
                name: Title,
                description: Description,
                location: Location,
                time: Time,
                createdby: MyID,
                meetupid: MaxMeetupID,
                firstname: firstname,
                lastname: lastname,
                attending: Attending
            });
            $(".meetups").prepend(MeetupItem);
        }
        
        $('.create-meetup').css({'display': 'none'});
    });

    $(".meetups").on("click", ".cancel-meetup", function(){
        const MeetupID = parseInt($(this).val());
        Firestore.collection("Meetups").where("meetupid", "==", MeetupID).get().then(function(Query){
            Query.forEach(function(Doc){
                Doc.ref.delete();
            });
        });
        $(this).closest(".meetup-item").remove();
        // @todo Also need to delete attending.
    });

    $(".meetups").on("click", ".attend-meetup", function(){
        const MeetupID = parseInt($(this).val());
        UpdateAttending(MeetupID, $(this), 1, MyID);
    });

    $(".meetups").on("click", ".do-not-attend-meetup", function(){
        const MeetupID = parseInt($(this).val());
        UpdateAttending(MeetupID, $(this), -1, MyID);
    });
});

function UpdateAttending(MeetupID, jqueryRef, incremementVal, MyID){
    /* Updates database & HTML for number attending */
    Firestore.collection("Meetups").where("meetupid", "==", MeetupID).get().then(function(Query) {
        Query.forEach(function(Doc){
            let newNumAttending = Doc.data().attending.length + incremementVal;
            let newAttending = Doc.data().attending;
            // Change to Attend button
            if(incremementVal === 1) {
                newAttending.push(MyID);
                jqueryRef.attr('class', 'do-not-attend-meetup');
                jqueryRef.text('Do Not Attend');
            } else {
                let index = newAttending.indexOf(MyID);
                newAttending.splice(index, 1);
                jqueryRef.attr('class', 'attend-meetup');
                jqueryRef.text('Attend');
            }
            

            // Update Number Attending in Database
            Firestore.collection("Meetups").doc(Doc.id).update({attending: newAttending});
            // Update HTML to match Number Attending in Database
            jqueryRef.prev().text(newNumAttending.toString() + ' going'); 
        });
    });
}

function CreateMeetupItem(Name, Description, Location, Time, MeetupID, MeetupFirstname, MeetupLastname, Attending, bCreatedByMe, bAttendingByMe) {
    // If current user is already attending, show 'do not attend' button
    const AttendButton = bAttendingByMe ? `<button class='do-not-attend-meetup' value="` + MeetupID + `">Do Not Attend</button>` : `<button class='attend-meetup' value="` + MeetupID + `">Attend</button>`;
    const Button = bCreatedByMe ? `<button class='cancel-meetup' value="` + MeetupID + `">Cancel</button>` : AttendButton;
    const MeetupItem = `
        <div class='meetup-item'>
            <div class='profile-pic'>
                <img src='./images/kermit.png'/>
                <p class='name'>`+ MeetupFirstname +` ` + MeetupLastname + `</p>
            </div>
            <div class='event'>
                <h2 class='meetup-title'>` + Name + `</h2>
                <p class='description'>` + Description +
                `</p>
                <div class='details'>
                    <p>` + Location + `</p>
                    <p>` + Time + `</p>` + 
                    `<p class='num-attending'> ` + Attending.length + ` going</p>`
                    + Button + 
                `</div>
            </div>
        </div>`;
    return MeetupItem;
}