$(document).ready(() => {
    var Firestore = InitFirestore();

    var pic;
    //Profile photo upload
    var fileButton = document.getElementById('photoUpload');
    //Listen for file selection
    fileButton.addEventListener('change', function(e) {
        //Get file
        pic = e.target.files[0];
        //Update profile pic on the page
        $(".avatar").attr('src', window.URL.createObjectURL(pic));
    });

    SetAutocomplete("#nationality", GetCountries(), function(){});
    SetAutocomplete("#school", Universities, function(){});
    SetAutocomplete("#major", Majors, function(){});

    $(".done").on("click", function(){
        const Email = $("#email").val();
        const Password = $("#password").val();
        const FirstName = $("#firstname").val();
        const LastName = $("#lastname").val();
        const Nationality = $("#nationality").val();
        const UserType = $("input[name=role]:checked").val();
        const School = $("#school").val();
        const Major = $("#major").val();
        const Bio = $("#textarea").val();

        if (!(Email && Password && FirstName && LastName && Nationality && UserType && Major && Bio && School)) {
            $(".EmailError").hide();
            $(".FieldError").show();
            return;
        }

        Firestore.collection("Accounts").get().then(function(Query) {
            var NewAccountID = -1;
            var EmailIsInUse = false;

            Query.forEach(function(Doc) {
                const Account = Doc.data();
                if (Account.email == Email) {
                    EmailIsInUse = true;
                    return;
                } else {
                    NewAccountID = Math.max(NewAccountID, Account.id);
                }
            });

            if (EmailIsInUse) {
                $(".FieldError").hide();
                $(".EmailError").show();
            } else {
                var Step1 = Firestore.collection("Accounts").add({
                    email: Email,
                    password: Password,
                    id: ++NewAccountID
                });

                var refPath = NewAccountID + "/" + pic.name;

                var Step2 = Firestore.collection("Profiles").add({
                    bio: Bio,
                    country: Nationality,
                    first: FirstName,
                    last: LastName,
                    major: Major,
                    school: School,
                    usertype: UserType,
                    id: NewAccountID,
                    photoPath: refPath
                })

                Promise.all([Step1, Step2]).then(function(Values) {
                    SetCookie("auth", NewAccountID, 0.1);
                    window.location.href = "profile.html?id=" + NewAccountID;
                    // window.location.href = "https://brmi.github.io/iBridge/profile.html?id=" + NewAccountID;
                });

                // Create a storage ref
                var storageRef = firebase.storage().ref(refPath);
                // Upload File
                var task = storageRef.put(pic);
                task.on('state_changed', function error(err) {});
            }
        });
    });
});
