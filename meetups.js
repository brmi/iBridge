$( document ).ready(function() {
    $( ".create" ).on( "click", function() {
        $('.create-meetup').css({'display': 'flex'});
      });

    $( ".cancel-meetup" ).on( "click", function() {
        $('.create-meetup').css({'display': 'none'});
    });

    $( ".add-meetup" ).on( "click", function() {
        $('.create-meetup').css({'display': 'none'});
    });
});