$(document).ready(() => {
    var Firestore = InitFirestore();
    const ProfileID = parseInt(GetParam("id"));
    const MyID = parseInt(GetCookie("auth"));
    var bAllowEditing = false;

    if (ProfileID == MyID) {
        bAllowEditing = true;
    }

    Firestore.collection("Profiles").where("id", "==", ProfileID).get().then(function(Query){
        Query.forEach(function(Doc){
            const Profile = Doc.data();
            $("#FirstName").text(Profile.first);
            $("#LastName").text(Profile.last);
            $("#School").text(Profile.school);
            $("#Country").text(Profile.country);
            $("#Description").text(Profile.bio);
        });
    });

    Firestore.collection("Interests").where("id", "==", ProfileID).get().then(function(Query){
        Query.forEach(function(Doc){
            const Interest = Doc.data();
            if (bAllowEditing) {
                $(".Interests").append(CreateEditableInterest(Interest.interest));
            } else {
                $(".Interests").append("<button type='button' class='btn btn-secondary Interest'>" + Interest.interest + "</button>");
            }
        });

        if (bAllowEditing) {
            $(document).on("click", ".RemoveInterest", function(){
                const Parent = $(this).closest(".Interest");
                const Interest = $(Parent).find(".InterestText").text();
                Firestore.collection("Interests").where("id", "==", MyID).where("interest", "==", Interest).get().then(function(Query){
                    Query.forEach(function(Doc){
                        Doc.ref.delete();
                    });
                });
                Parent.remove();
            });

            $(".Interests").append("<button type='button' class='fas fa-plus btn btn-secondary AddInterest'></button>");

            var Toggle = true;

            $(".AddInterest").on("click", function(){
                if (Toggle) {
                    $("<input type='text' class='InterestInput'>").insertBefore(this);
                    $(".InterestInput").focus();
                } else {
                    const NewInterest = $(".InterestInput").val();
                    $(".InterestInput").remove();
                    if (NewInterest != "" && !HasInterest(NewInterest)) {
                        $(CreateEditableInterest(NewInterest)).insertBefore(this);
                        Firestore.collection("Interests").add({
                            id: MyID,
                            interest: NewInterest
                        });
                    }
                }
                Toggle = !Toggle;
            });
        }
    });

    Firestore.collection("Tips").where("id", "==", ProfileID).get().then(function(Query){
        Query.forEach(function(Doc){
            const Tip = Doc.data();
            if (bAllowEditing) {
                AddEditableTip(Firestore, MyID, Tip.tip);
            } else {
                $(".ListOfTips").append("<li>" + Tip.tip + "</li>");
            }
        });
    });

    Firestore.collection("Meetups").where("createdby", "==", ProfileID).get().then(function(Query){
        Query.forEach(function(Doc){
            const Meetup = Doc.data();
            $("#ListOfMeetups").append("<li class='Meetup'><p class='MeetupName'>" + Meetup.name + "</p><p class='MeetupDescription'>" + Meetup.description + "</p><p class='MeetupTime'>Time: " + Meetup.time + "</p><p class='MeetupLocation'>Location: " + Meetup.location + "</p><button type='submit'>Interested</button></li>");
        });
    });

    if (bAllowEditing) {
        AllowEditing(Firestore, MyID);
    }
});

function AllowEditing(Firestore, MyID) {
    /* Edit tips */
    var IsEditingTip = false;

    $(".AddTipPlaceholder").append('<i class="fas fa-plus" id="AddTip" style="cursor:pointer;"></i>');

    $("#AddTip").on("click", function(){
        if (!IsEditingTip) {
            IsEditingTip = true;
            const CreateTipField = '<li id="TipInput"><input type="text" name="AddTipText"><button id="CreateTip">Add Tip</button></li>';

            $(".ListOfTips").append(CreateTipField);

            $("input").focus();

            $(document).off().on("click", "#CreateTip", function(){
                IsEditingTip = false;
                const Tip = $("input").val();

                if (Tip != null && Tip != ""&& !TipAlreadyExists(Tip)) {
                    Firestore.collection("Tips").add({
                        id: MyID,
                        tip: Tip
                    });
                    AddEditableTip(Firestore, MyID, Tip);
                    $("#TipInput").remove();
                }
            });
        }
    });

    /* Edit bio */
    var IsEditingBio = false;

    $(".Bio").prepend('<i class="far fa-edit EditBio" style="cursor:pointer"></i>');

    $(".EditBio").on("click", function(){
        if (IsEditingBio) {
            const EditBioBox = $("#EditBioBox");
            const NewBio = EditBioBox.val();

            $("#Description").text(NewBio);

            Firestore.collection("Profiles").where("id", "==", MyID).get().then(function(Query){
                Query.forEach(function(Doc){
                    Doc.ref.update({bio: NewBio});
                });
            });

            EditBioBox.remove();

            IsEditingBio = false;
        } else {
            const Description = $("#Description").text();
            const EditBioBox = "<textarea rows='4' cols='50' id='EditBioBox'>" + Description + "</textarea>";

            $(".EditBioBox").append(EditBioBox);

            $("#Description").text("");

            IsEditingBio = true;
        }
    });

    /* Edit profile info */
    var IsEditingSchool = false;

    $("#School").css("cursor", "pointer");
    $("#Country").css("cursor", "pointer");

    $("#School").on("click", function(){
        if (!IsEditingSchool) {
            const School = $(this).text();
            $(this).text("");
            $("<button id='SaveSchool'>Save</button>").insertAfter(this);
            $("<input type='text' id='EditSchool' value='" + School + "'>").insertAfter(this);
            $("#SaveSchool").on("click", function(){
                const NewSchool = $("#EditSchool").val();
                $("#EditSchool").remove();
                $("#SaveSchool").remove();
                if (NewSchool == "" || NewSchool == School) {
                    $("#School").text(School);
                } else {
                    $("#School").text(NewSchool);
                    Firestore.collection("Profiles").where("id", "==", MyID).get().then(function(Query){
                        Query.forEach(function(Doc){
                            Doc.ref.update({school: NewSchool});
                        });
                    });
                }
                
                IsEditingSchool = false;
            });
            IsEditingSchool = true;
        }
    });

    var IsEditingCountry = false;

    $("#Country").on("click", function(){
        if (!IsEditingCountry) {
            const Country = $(this).text();
            $(this).text("");
            $("<button id='SaveCountry'>Save</button>").insertAfter(this);
            $("<input type='text' id='EditCountry' value='" + Country + "'>").insertAfter(this);
            $("#SaveCountry").on("click", function(){
                const NewCountry = $("#EditCountry").val();
                $("#EditCountry").remove();
                $("#SaveCountry").remove();
                if (NewCountry == "" || NewCountry == Country) {
                    $("#Country").text(Country);
                } else {
                    $("#Country").text(NewCountry);
                    Firestore.collection("Profiles").where("id", "==", MyID).get().then(function(Query){
                        Query.forEach(function(Doc){
                            Doc.ref.update({country: NewCountry});
                        });
                    });
                }
                IsEditingCountry = false;
            });
            IsEditingCountry = true;
        }
    });
}

function TipAlreadyExists(Tip) {
    var ListItems = $(".ListOfTips li");
    for (var Item of ListItems) {
        if ($(Item).text() == Tip) {
            return true;
        }
    }
    return false;
}

function AddEditableTip(Firestore, MyID, Tip) {
    const HTML = "<li><span class='Tip'>" + Tip + "</span></li>";
    $(".ListOfTips").append(HTML);
    $(".Tip").hover(function(Event){
        $(".RemoveTip").remove();
        if (Event.type == "mouseenter") {
            $(this).append("<i class='fas fa-trash RemoveTip' aria-hidden='true' style='cursor:pointer;'></i>");
            $(".RemoveTip").on("click", function(){
                const Text = $(this).closest("span").text();
                Firestore.collection("Tips").where("id", "==", MyID).where("tip","==",Text).get().then(function(Query){
                    Query.forEach(function(Doc){
                        Doc.ref.delete();
                    });
                });
                $(this).closest("li").remove();
            });
        }
    });
}

function CreateEditableInterest(Interest) {
    return "<span class='Interest'><button type='button' class='btn btn-secondary'><span class='InterestText'>" + Interest + "</span>    <i class='fas fa-minus RemoveInterest'></i></button></span>";
}

function HasInterest(Interest) {
    var HasInterest = false;
    $(".InterestText").each(function(i, Obj){
        const Span = $(Obj).text();
        if (Span == Interest) {
            HasInterest = true;
        }
    });
    return HasInterest;
}