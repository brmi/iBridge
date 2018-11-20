var Firestore = InitFirestore();

$(document).ready(() => {    
    $("#SignIn").on("click", SignIn);
});

function SignIn() {
    const Email = $("#Email").val();
    const Password = $("#Password").val();

    Firestore.collection("Accounts").where("email", "==", Email).where("password", "==", Password).get().then(function(Query){
        var bAuthenticated = false;
        
        Query.forEach(function(Doc){
            const UserID = Doc.data().id;
            SetCookie("auth", UserID, 0.1);
            window.location.href = "http://localhost:8000/profile.html?id=" + UserID;
            bAuthenticated = true;
        });

        if (!bAuthenticated) {
            $("#Email").val("");
            $("#Password").val("");
            $("#Error").remove();
            $("<p id='Error'>Invalid username or password.</p>").insertAfter("#SignIn");
        }
    });
}