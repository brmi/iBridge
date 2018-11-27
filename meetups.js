var Firestore = InitFirestore();

$(document).ready(function() {
    
    const MyID = parseInt(GetCookie("auth"));
    var MaxMeetupID = 0;
    let firstname = 'NO FIRSTNAME';
    let lastname = 'NO LASTNAME';

    Firestore.collection("Meetups").get().then(function(Query){
        Query.forEach(function(Doc) {
            const Meetup = Doc.data();
            const MeetupItem = CreateMeetupItem(Meetup.name, Meetup.description, Meetup.location, Meetup.time, Meetup.meetupid, Meetup.firstname, Meetup.lastname, Meetup.createdby == MyID);
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

        
        // const MeetupUsername = GetUsername();
        const MeetupItem = CreateMeetupItem(Title, Description, Location, Time, ++MaxMeetupID, firstname, lastname, true);

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
                lastname: lastname
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
});

function CreateMeetupItem(Name, Description, Location, Time, MeetupID, MeetupFirstname, MeetupLastname, bCreatedByMe) {
    console.log(MeetupFirstname, MeetupLastname);
    const Button = bCreatedByMe ? `<button class='cancel-meetup' value="` + MeetupID + `">Cancel</button>` : `<button class='attend' value="` + MeetupID + `">attend</button>`;
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
                    <p>` + Time + `</p>`
                    + Button + 
                `</div>
            </div>
        </div>`;
    return MeetupItem;
}