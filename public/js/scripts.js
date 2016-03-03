$(document).ready(function(){
  $('select').material_select();

  $("#login-nav").hide();

  $("#nav-login").click(function (e) {
     e.preventDefault();


    if($( "#login-nav").is(":hidden" )) {
      $("#login-nav").slideDown("slow");
    } else {
      $("#login-nav").slideUp("slow");
    }
  });






});

