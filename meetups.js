$(document).ready(function() {
    var Firestore = InitFirestore();
    const MyID = parseInt(GetCookie("auth"));
    var MaxMeetupID = 0;

    Firestore.collection("Meetups").get().then(function(Query){
        Query.forEach(function(Doc) {
            const Meetup = Doc.data();
            const MeetupItem = CreateMeetupItem(Meetup.name, Meetup.description, Meetup.location, Meetup.time, Meetup.meetupid, Meetup.createdby == MyID);
            $(".meetups").prepend(MeetupItem);
            MaxMeetupID = Math.max(MaxMeetupID, Meetup.meetupid);
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
        const MeetupItem = CreateMeetupItem(Title, Description, Location, Time, ++MaxMeetupID, true);

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
                meetupid: MaxMeetupID
            });
            $(".meetups").prepend(MeetupItem);
        }
        
        $('.create-meetup').css({'display': 'none'});
    });

    $(".meetups").on("click", ".CancelMeetup", function(){
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

function CreateMeetupItem(Name, Description, Location, Time, MeetupID, bCreatedByMe) {
    const Button = bCreatedByMe ? `<button class='CancelMeetup' value="` + MeetupID + `">Cancel Meetup</button>` : `<button class='attend' value="` + MeetupID + `">attend</button>`;
    const MeetupItem = `
        <div class='meetup-item'>
            <div class='profile-pic'>
                <img src='./images/kermit.png'/>
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