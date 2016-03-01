$(document).ready(function(){
  $('select').material_select();

  $("#login-form").hide();

  $("#nav-login").click(function (e) {
     e.preventDefault();


    if($( "#login-form").is(":hidden" )) {
      $("#login-form").fadeIn("slow");
    } else {
      $("#login-form").fadeOut("slow");
    }
  });






});

