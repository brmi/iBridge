$(document).ready(() => {
    var Firestore = InitFirestore();
    const MyID = parseInt(GetCookie("auth"));

    var Toggle = true;

    $(".AddInterest").on("click", function(){
        if (Toggle) {
            $("<input type='text' class='InterestInput'>").insertBefore(this);
            $(".InterestInput").focus();
        } else {
            const NewInterest = $(".InterestInput").val();
            $(".InterestInput").remove();
            if (NewInterest != "") {
                $(CreateEditableInterest(NewInterest)).insertBefore(this);
            }
        }
        Toggle = !Toggle;
    });
    
    $(".Advanced").on("click", function(){
        $(".AdvancedSearch").show();

        $(document).on("click", ".RemoveInterest", function(){
            const Parent = $(this).closest(".Interest");
            Parent.remove();
        });

        $(".Advanced").hide();
        $(".HideAdvanced").show();
    });

    $(".HideAdvanced").on("click", function(){
        $(".AdvancedSearch").hide();
        $(".Advanced").show();
        $(this).hide();
    });

    $(".Search").on("click", function(){
        $(".ListOfResults").empty();

        const School = $(".School").val();
        if (!School) {
            $(".SchoolIsEmpty").show();
            setTimeout(function(){
                $(".SchoolIsEmpty").fadeOut("slow", function(){});
            }, 10000);
        }

        var Query = Firestore.collection("Profiles").where("school", "==", School);

        var Profiles;

        const IsAdvanced = $(".AdvancedSearch").is(":visible");

        var bShowedProfiles = false;

        if (IsAdvanced) {
            const Nationality = $(".Nationality").val();
            const Major = $(".Major").val();

            if (Nationality) {
                Query = Query.where("country", "==", Nationality);
            }

            if (Major) {
                Query = Query.where("major", "==", Major);
            }

            const InterestsToSearch = $(".InterestText");
            if (InterestsToSearch.length > 0) {
                /* 
                 * Only need to have one interest in common to show up in the search result, but still filter based on 
                 * major and country.
                */

                var InterestQuery = Firestore.collection("Interests");
                
                for (var Search of InterestsToSearch) {
                    const InterestSearch = $(Search).text();
                    var SharedInterests = new Array();
                    InterestQuery.where("interest", "==", InterestSearch).get().then(function(Result){
                        Result.forEach(function(Doc){
                            const Interest = Doc.data();
                            if (Interest.id != MyID) {
                                SharedInterests.push(Interest);
                            }
                        })
                    });                
                }

                Query.get().then(function(Result){
                    Result.forEach(function(Doc){
                        const Profile = Doc.data();
                        if (Profile.id != MyID) {
                            var InterestsWithUser = new Array();
                            SharedInterests.forEach(function(Interest){
                                if (Interest.id == Profile.id) {
                                    InterestsWithUser.push(Interest.interest);
                                }
                            });
                            if (InterestsWithUser.length > 0) {
                                ShowProfile(Profile, InterestsWithUser);
                            }        
                        }
                    });
                });

                bShowedProfiles = true;
            } 
        }
        
        if (!bShowedProfiles) {
            Query.get().then(function(Result){
                Result.forEach(function(Doc){
                    const Profile = Doc.data();
                    if (Profile.id != MyID) {
                        ShowProfile(Profile, null);
                    }
                });
            });
        }
    });
});

function ShowProfile(Profile, CommonInterests) {
    // @todo-anav

    var ProfileHtml = `<li class='Interests'><a class='name' href='./profile.html?id=` + Profile.id + `'>` + Profile.first + ` ` + Profile.last + ` </a><br>
    <span class='Major'> Major: ` + Profile.major + `</span>`;

    if (CommonInterests) {
        CommonInterests.forEach(function(Interest){
            ProfileHtml += `<button type='button' class='btn btn-secondary Interest'>` + Interest + `</button>`;
        });
    }

    ProfileHtml += `</li>`;
    
    $(".ListOfResults").append(ProfileHtml);
}

function CreateEditableInterest(Interest) {
    return "<span class='Interest'><button type='button' class='btn btn-secondary Interest'><span class='InterestText'>" + Interest + "</span>    <i class='fas fa-minus RemoveInterest'></i></button></span>";
}