$(document).ready(() => {
    if (!firebase.apps.length) {
        var Firestore = InitFirestore();
    } else {
        var Firestore = getFirebase();
    }
    const ProfileID = parseInt(GetParam("id"));
    const MyID = parseInt(GetCookie("auth"));
    var bAllowEditing = false;

    if (ProfileID == MyID) {
        bAllowEditing = true;
    }

    Firestore.collection("Profiles").where("id", "==", ProfileID).get().then(function(Query) {
        Query.forEach(function(Doc) {
            const Profile = Doc.data();
            let name = Profile.first + ' ' + Profile.last;
            $("#Name").text(name.toString());
            $("#Major").html(`<i class="fas fa-book"></i>` + Profile.major);
            $("#UserType").html(`<i class="fas fa-smile"></i>` + Profile.usertype);
            $("#School").html(`<i class="fas fa-university"></i>` + Profile.school);
            $("#Country").html(`<i class="fas fa-flag"></i>` + Profile.country);
            $("#Description").text(Profile.bio);

            //retrieve profile photo
            var refPath = "\'" + Profile.photoPath + "\'";
            console.log(refPath);
            var storage = firebase.storage().ref();
            var fileRef = storage.child(Profile.photoPath);
            fileRef.getDownloadURL().then(function(url) {
                var img = document.getElementById('profilePhoto');
                img.src = url;
            }).catch(function(error) {
            });
            
        });
    });

    Firestore.collection("Interests").where("id", "==", ProfileID).get().then(function(Query) {
        Query.forEach(function(Doc) {
            const Interest = Doc.data();
            if (bAllowEditing) {
                $(".Interests").append(CreateEditableInterest(Interest.interest));
            } else {
                $(".Interests").append("<button type='button' class='btn btn-secondary Interest'>" + Interest.interest + "</button>");
            }
        });

        if (bAllowEditing) {
            $(document).on("click", ".RemoveInterest", function() {
                const Parent = $(this).closest(".Interest");
                const Interest = $(Parent).find(".InterestText").text();
                Firestore.collection("Interests").where("id", "==", MyID).where("interest", "==", Interest).get().then(function(Query) {
                    Query.forEach(function(Doc) {
                        Doc.ref.delete();
                    });
                });
                Parent.remove();
            });

            $(".Interests").append("<button type='button' class='fas fa-plus btn btn-secondary AddInterest'></button>");

            var Toggle = true;

            $(".AddInterest").on("click", function() {
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

    Firestore.collection("Tips").where("id", "==", ProfileID).get().then(function(Query) {
        if (Query.empty) {
            $(".top-tips").append("<p class='no-tips'>You haven't created any tips yet.</p>");
        } else {
            Query.forEach(function(Doc) {
                const Tip = Doc.data();
                if (bAllowEditing) {
                    AddEditableTip(Firestore, MyID, Tip.tip);
                } else {
                    $(".ListOfTips").append("<li>" + Tip.tip + "</li>");
                }
            });
        }
    });

    Firestore.collection("Meetups").where("createdby", "==", ProfileID).get().then(function(Query) {
        if (Query.empty) {
            $("#ListOfMeetups").append("<li class='Meetup'><p class='MeetupName'>You haven't created any meetups.</p><p class='MeetupDescription'>Visit the Meetups tab to create one!</p></li>");
        } else {
            Query.forEach(function(Doc) {
                const Meetup = Doc.data();
                let MeetupHTML = `<div class='meetup-item'>
                <div class='event'>
                    <h2 class='meetup-title'>` + Meetup.name + `</h2>
                    <p class='description'>` + Meetup.description + `</p>
                    <div class='details'>
                        <p>` + Meetup.location + `</p>
                        <p>` + Meetup.time + `</p>
                    </div>
                </div>
            </div>`;
                $("#ListOfMeetups").append(MeetupHTML);
                // $("#ListOfMeetups").append("<li class='Meetup'><p class='MeetupName'>" + Meetup.name + "</p><p class='MeetupDescription'>" + Meetup.description + "</p><p class='MeetupTime'>Time: " + Meetup.time + "</p><p class='MeetupLocation'>Location: " + Meetup.location + "</p><button type='submit'>Interested</button></li>");
            });
        }
    });

    if (bAllowEditing) {
        AllowEditing(Firestore, MyID);
    }
});

function AllowEditing(Firestore, MyID) {
    /* Edit tips */
    var IsEditingTip = false;

    $(".AddTipPlaceholder").append('<button class="fas fa-plus" id="AddTip" style="cursor:pointer;"></button>');

    $("#AddTip").on("click", function() {
        if (!IsEditingTip) {
            IsEditingTip = true;
            const CreateTipField = '<li id="TipInput"><input type="text" name="AddTipText"><button id="CreateTip">Add Tip</button></li>';

            $(".ListOfTips").append(CreateTipField);

            $("input").focus();

            $(document).off().on("click", "#CreateTip", function() {
                IsEditingTip = false;
                const Tip = $("input").val();

                if (Tip != null && Tip != "" && !TipAlreadyExists(Tip)) {
                    Firestore.collection("Tips").add({
                        id: MyID,
                        tip: Tip
                    });
                    AddEditableTip(Firestore, MyID, Tip);
                    $("#TipInput").remove();
                }
                $('.no-tips').remove();
            });
        }
    });

    /* Edit bio */
    var IsEditingBio = false;

    $(document).on("click", ".EditBio", function() {
        if (IsEditingBio) {
            const EditBioBox = $("#EditBioBox");
            const NewBio = EditBioBox.val();

            $("#Description").text(NewBio);

            Firestore.collection("Profiles").where("id", "==", MyID).get().then(function(Query) {
                Query.forEach(function(Doc) {
                    Doc.ref.update({
                        bio: NewBio
                    });
                });
            });

            EditBioBox.remove();
            $(".fa-times-circle").replaceWith('<i class="far fa-edit EditBio" style="cursor:pointer"></i>');

            IsEditingBio = false;
        } else {
            const Description = $("#Description").text();
            const EditBioBox = "<textarea class='description' rows='4' cols='50' id='EditBioBox'>" + Description + "</textarea>";
            $(".fa-edit").replaceWith('<i class="far fa-times-circle EditBio" style="cursor:pointer"></i>');
            $(".EditBioBox").append(EditBioBox);

            $("#Description").text("");

            IsEditingBio = true;
        }
    });

    /* Edit profile info */
    var IsEditingSchool = false;

    $("#School").css("cursor", "pointer");
    $("#Country").css("cursor", "pointer");

    $("#School").on("click", function() {
        if (!IsEditingSchool) {
            const School = $(this).text();
            $(this).text("");
            $("<button id='SaveSchool'>Save</button>").insertAfter(this);
            $("<input class='editing' type='text' id='EditSchool' value='" + School + "'>").insertAfter(this);
            SetAutocomplete("#EditSchool", Universities, function() {});

            $("#SaveSchool").on("click", function() {
                const NewSchool = $("#EditSchool").val();
                $("#EditSchool").remove();
                $("#SaveSchool").remove();
                if (NewSchool == "" || NewSchool == School) {
                    $("#School").html(`<i class="fas fa-university"></i>` + School);
                } else {
                    $("#School").text(NewSchool);
                    Firestore.collection("Profiles").where("id", "==", MyID).get().then(function(Query) {
                        Query.forEach(function(Doc) {
                            Doc.ref.update({
                                school: NewSchool
                            });
                        });
                    });
                }

                IsEditingSchool = false;
            });
            IsEditingSchool = true;
        }
    });

    var IsEditingCountry = false;
    var Countries = null;

    $("#Country").on("click", function() {
        if (!IsEditingCountry) {
            const Country = $(this).text();
            $(this).text("");
            $("<button id='SaveCountry'>Save</button>").insertAfter(this);
            $("<input class='editing' type='text' id='EditCountry' value='" + Country + "'>").insertAfter(this);
            if (!Countries) {
                Countries = GetCountries();
            } else {
                SetAutocomplete("#EditCountry", Countries, function() {});
            }

            $("#SaveCountry").on("click", function() {
                const NewCountry = $("#EditCountry").val();
                $("#EditCountry").remove();
                $("#SaveCountry").remove();
                if (NewCountry == "" || NewCountry == Country) {
                    $("#Country").html(`<i class="fas fa-flag"></i>` + Country);
                } else {
                    $("#Country").html(`<i class="fas fa-flag"></i>` + NewCountry);
                    Firestore.collection("Profiles").where("id", "==", MyID).get().then(function(Query) {
                        Query.forEach(function(Doc) {
                            Doc.ref.update({
                                country: NewCountry
                            });
                        });
                    });
                }
                IsEditingCountry = false;
            });
            IsEditingCountry = true;
        }
    });

    var IsEditingMajor = false;

    $("#Major").on("click", function() {
        if (!IsEditingMajor) {
            const Major = $(this).text();
            $(this).text("");
            $("<button id='SaveMajor'>Save</button>").insertAfter(this);
            $("<input class='editing' type='text' id='EditMajor' value='" + Major + "'>").insertAfter(this);
            SetAutocomplete("#EditMajor", Majors, function() {});

            $("#SaveMajor").on("click", function() {
                const NewMajor = $("#EditMajor").val();
                $("#EditMajor").remove();
                $("#SaveMajor").remove();
                if (NewMajor == "" || NewMajor == Major) {
                    $("#Major").html(`<i class="fas fa-book"></i>` + Major);
                } else {
                    $("#Major").html(`<i class="fas fa-book"></i>` + NewMajor);
                    Firestore.collection("Profiles").where("id", "==", MyID).get().then(function(Query) {
                        Query.forEach(function(Doc) {
                            Doc.ref.update({
                                major: NewMajor
                            });
                        });
                    });
                }
                IsEditingMajor = false;
            });
            IsEditingMajor = true;
        }
    });

    var IsEditingUserType = false;

    $("#UserType").on("click", function() {
        if (!IsEditingUserType) {
            const UserType = $(this).text();
            $(this).text("");
            $("<button id='SaveUserType'>Save</button>").insertAfter(this);
            $("<input class='editing' type='text' id='EditUserType' value='" + UserType + "'>").insertAfter(this);
            $("#SaveUserType").on("click", function() {
                const NewUserType = $("#EditUserType").val();
                $("#EditUserType").remove();
                $("#SaveUserType").remove();
                if (NewUserType == "" || NewUserType == UserType) {
                    $("#UserType").html(`<i class="fas fa-book"></i>` + UserType);
                } else {
                    $("#UserType").html(`<i class="fas fa-book"></i>` + NewUserType);
                    Firestore.collection("Profiles").where("id", "==", MyID).get().then(function(Query) {
                        Query.forEach(function(Doc) {
                            Doc.ref.update({
                                usertype: NewUserType
                            });
                        });
                    });
                }
                IsEditingUserType = false;
            });
            IsEditingUserType = true;
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
    const HTML = "<li><span class='Tip'>" + Tip + "<i class='fas fa-trash RemoveTip' aria-hidden='true' style='cursor:pointer;'></i></span></li>";
    $(".ListOfTips").append(HTML);
    $(".Tip").hover(function(Event) {
        if (Event.type == "mouseenter") {
            $(".RemoveTip").on("click", function() {
                const Text = $(this).closest("span").text();
                Firestore.collection("Tips").where("id", "==", MyID).where("tip", "==", Text).get().then(function(Query) {
                    Query.forEach(function(Doc) {
                        Doc.ref.delete();
                    });
                });
                $(this).closest("li").remove();
                // Check to see if tips are empty
                if ($('.ListOfTips li').length == 0 && $('.top-tips p').length == 0) {
                    $(".top-tips").append("<p class='no-tips'>You haven't created any tips yet.</p>");
                }
            });
        }
    });
}

function CreateEditableInterest(Interest) {
    return "<span class='Interest'><button type='button' class='btn btn-secondary Interest'><span class='InterestText'>" + Interest + "</span>    <i class='fas fa-minus RemoveInterest'></i></button></span>";
}

function HasInterest(Interest) {
    var HasInterest = false;
    $(".InterestText").each(function(i, Obj) {
        const Span = $(Obj).text();
        if (Span == Interest) {
            HasInterest = true;
        }
    });
    return HasInterest;
}
