$(document).ready(() => {
    var Firestore = InitFirestore();

    $(".done").on("click", function(){
        const Email = $("#email").val();
        const Password = $("#password").val();
        const FirstName = $("#firstname").val();
        const LastName = $("#lastname").val();
        const Nationality = $("#nationality").val();
        const UserType = $("#usertype").val();
        const School = $("#school").val();
        const Major = $("#major").val();
        const Bio = $("#bio").val();

        if (!(Email && Password && FirstName && LastName && Nationality && UserType && Major && Bio && School)) {
            $("#EmailError").hide();
            $("#FieldError").show();
            return;
        }
        
        Firestore.collection("Accounts").get().then(function(Query){
            var NewAccountID = -1;
            var EmailIsInUse = false;

            Query.forEach(function(Doc){
                const Account = Doc.data();
                if (Account.email == Email) {
                    EmailIsInUse = true;
                    return;
                } else {
                    NewAccountID = Math.max(NewAccountID, Account.id);
                }
            });

            if (EmailIsInUse) {
                $("#FieldError").hide();
                $("#EmailError").show();
            } else {
                var Step1 = Firestore.collection("Accounts").add({
                    email: Email,
                    password: Password,
                    id: ++NewAccountID
                });

                var Step2 = Firestore.collection("Profiles").add({
                    bio: Bio,
                    country: Nationality,
                    first: FirstName,
                    last: LastName,
                    major: Major,
                    school: School,
                    usertype: UserType,
                    id: NewAccountID
                })

                Promise.all([Step1, Step2]).then(function(Values){
                    SetCookie("auth", NewAccountID, 0.1);
                    window.location.href = "http://localhost:8000/profile.html?id=" + NewAccountID;
                });
            }
        });
    });
});