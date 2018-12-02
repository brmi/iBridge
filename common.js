function InitFirestore() {
    const Config = {
        apiKey: "AIzaSyAN8crSUnsqppTAwIQMqOnr6KzVVn8gURo",
        authDomain: "ibridge-61c6a.firebaseapp.com",
        databaseURL: "https://ibridge-61c6a.firebaseio.com",
        projectId: "ibridge-61c6a",
        storageBucket: "ibridge-61c6a.appspot.com",
        messagingSenderId: "596019487968"
    };

    firebase.initializeApp(Config);
    var Firestore = firebase.firestore();
    const Settings = { timestampsInSnapshots: true };
    Firestore.settings(Settings);

    return Firestore;
}

function getFirebase() {
    var Firestore = firebase.firestore();
    const Settings = { timestampsInSnapshots: true };
    Firestore.settings(Settings);

    return Firestore;
}

function GetParam(Name) {
    var Results = new RegExp('[\?&]' + Name + '=([^&#]*)').exec(window.location.href);
    return Results == null ? null : decodeURI(Results[1]) || 0;
}

function SetAutocomplete(HtmlElement, Entries, SelectCallback) {
    $(HtmlElement).autocomplete({
        source: function(Request, Response) {
          var Matcher = new RegExp($.ui.autocomplete.escapeRegex(Request.term ), "i");
          Response($.grep(Entries, function(Value) {
            Value = Value.label || Value.value || Value;
            return Matcher.test(Value) || Matcher.test(Value.normalize());
          }));
        },
        select: function(Event, UI) {
            const Val = UI.item.value;
            $(HtmlElement).val(Val);
            SelectCallback();
        }
    });
}

// Credit: https://www.w3schools.com/js/js_cookies.asp 
function SetCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
function GetCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

// @todo Find a database that can better populate these arrays...

const Universities = [
    "University of California, Berkeley",
    "University of California, Davis",
    "University of California, Irvine",
    "University of California, Los Angeles",
    "University of California, Merced",
    "University of California, Riverside",
    "University of California, San Diego",
    "University of California, Santa Barbara",
    "University of California, Santa Cruz"
];

const Majors = [
    'Accounting',
    'Actuarial Science',
    'Advertising',
    'Agriculture',
    'Agricultural and Biological Engineering',
    'Agricultural Business Management',
    'Agriculture Economics',
    'Animal Bioscience',
    'Animal Sciences',
    'Anthropology',
    'Applied Mathematics',
    'Archaeology',
    'Architectural Engineering',
    'Architecture',
    'Art History',
    'Studio Art',
    'Art Education',
    'Biobehavioral Health',
    'Biochemistry',
    'Bioengineering',
    'Biology',
    'Biophysics',
    'Biotechnology',
    'Business Administration and Management',
    'Business Logistics',
    'Chemical Engineering',
    'Chemistry',
    'Children',
    'Civil Engineering',
    'Computer Engineering',
    'Computer Science',
    'Crime, Law, and Justice',
    'Dance',
    'Earth Sciences',
    'Economics',
    'Electrical Engineering',
    'Elementary and Kindergarten Education',
    'Engineering Science',
    'English',
    'Environmental Systems Engineering',
    'Environmental Sciences',
    'Environmental Resource Management',
    'Film and Video',
    'Finance',
    'Food Science',
    'Forest Science',
    'Forest Technology',
    'General Science',
    'Geography',
    'Geosciences',
    'Graphic Design and Photography',
    'Health and Physical Education',
    'Health Policy and Administration',
    'History',
    'Horticulture',
    'Hotel, Restaurant, and Institutional Management',
    'Human Development and Family Studies',
    'Individual and Family Studies',
    'Industrial Engineering',
    'Information Sciences and Technology',
    'Journalism',
    'Kinesiology',
    'Landscape Architecture',
    'Law Enforcement and Correction',
    'Marine Biology',
    'Marketing',
    'Mathematics',
    'Mechanical Engineering',
    'Media Studies',
    'Meteorology',
    'Microbiology',
    'Mineral Economics',
    'Modern Languages',
    'Music Education',
    'Nuclear Engineering',
    'Nursing',
    'Nutrition',
    'Philosophy',
    'Physics',
    'Physiology',
    'Political Science',
    'Pre-medicine',
    'Psychology',
    'Public Relations',
    'Real Estate',
    'Recreation and Parks',
    'Rehabilitation Services',
    'Religious Studies',
    'Secondary Education',
    'Sociology',
    'Social Work',
    'Special Education',
    'Speech Communication',
    'Speech Pathology and Audiology/Communication Disorder',
    'Statistics',
    'Telecommunications',
    'Theater',
    'Wildlife and Fishery Science',
    'Wildlife Technology',
    "Women's Studies"
];

// Credit: My PR2+3 assignment :P 
function GetCountries() {  
    var Countries = [];
  
    $.ajax({
      url: "https://s3.ap-northeast-2.amazonaws.com/cs374-csv/country_capital_pairs.csv",
      type: "GET",
      async: false,
      success: function(Data) {
        var Lines = Data.split("\n");
        var Fields = Lines[0].split(",");
        var CountryIndex = 0;
  
        for (var i = 1; i < Lines.length; i++) {
          var CurrentLine = Lines[i].split(",");
          var Country = CurrentLine[CountryIndex].trim();
          Countries.push(Country);
        }
      }});
  
    return Countries;
}