$(document).ready(function(){
  $('select').material_select();

  $("#login-nav").hide();
  $("#registration-nav").hide();

  $("#nav-login").click(function (e) {
    e.preventDefault();

    if($( "#login-nav").is(":hidden")) {
      if($("#registration-nav").is(":hidden")){
        $("#login-nav").slideDown("slow");
      }else{
        $("#registration-nav").slideUp("slow", function(){
           $("#login-nav").slideDown("slow");
        });
      }
    } else {
      $("#login-nav").slideUp("slow");
    }
  });

  $("#nav-registration").click(function (e) {
    e.preventDefault();

    if($("#registration-nav").is(":hidden")) {
     if($("#login-nav").is(":hidden")){
        $("#registration-nav").slideDown("slow");
      }else{
       $("#login-nav").slideUp("slow", function(){
           $("#registration-nav").slideDown("slow");
        });
      }
    } else {
      $("#registration-nav").slideUp("slow");
    }
  });






});

