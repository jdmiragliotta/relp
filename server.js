var express           = require('express');
var expressHandlebars = require('express-handlebars');
var session           = require('express-session');
var Sequelize         = require('sequelize');
var passport          = require('passport');
var passportLocal     = require('passport-local');
var bcrypt            = require('bcryptjs');
var bodyParser        = require('body-parser');
var app               = express();
var PORT = process.env.PORT || 8070;

//CONNECTS TO HEROKU DATABASE  - research to how to change DB name, username and login
var sequelize = new Sequelize('heroku_56fdd3900ccadbc','b6d11317eba467','d30dac0b')

//SETS UP HANDLEBARs LAYOUTS
app.engine('handlebars', expressHandelbars({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

//ADD BODYPARSER TO READ HTML
app.use(bodyParser.urlencoded({
	extended: false
}));
//ACCESS TO PUBLIC FOLDER
app.use(express.static(__dirname + '/public'));

//CREATE SECRET FOR USER LOGIN
app.use(session({
  secret: 'deardiaryiwishtotellyousomethingsecret',
  cookie:{
    secure: false,
    maxAge: 1000 * 60 * 60 * 24 * 14
  },
  saveUninitialized: true,
  resave: true
}));

/*-------------------------------------------------
PASSPORT
-------------------------------------------------*/
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});
passport.deserializeUser(function(id, done) {
  done(null, { id: id, username: id })
});

passport.use(new passportLocal.Strategy(
  function(username, password, done) {
      //Check passwood in DB
      Student.findOne({
        where:{
          username: username
        }
      }).then(function(user){
        //check password against hash
        if(user){
          bcrypt.compare(password, user.dataValues.password, function(err, user){
            if(user){
              //if password is correcnt authenticate the user with cookie
              done(null, {id: username, username:username});
            }else{
              done(null,false);
            }
          });
        }else {
          done(null, null);
        }
      });
    }));

/*-------------------------------------------------
  MODELS
  -------------------------------------------------*/
var User = sequelize.define('User',{
    firstname: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
      is: ["^[a-z]+$","i"]
      }
    },
    lastname: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
      is: ["^[a-z]+$","i"]
      }
    },
    username: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
      validate:{
        len:[1, 30]
      }
    },
    password:{
      type: Sequelize.STRING,
      allowNull: false,
      validate:{
        len:[8, 25]
      }
    }
  } , {
      hooks: {
        beforeCreate: function(input){
          input.password = bcrypt.hashSync(input.password, 10);
        }
      }
  });

//LOGIN SUCCESSFUL ROUTES
app.post('/user-login', //CAN CHANGE ROUTE NAMES
  passport.authenticate('student', {
    successRedirect: '/student',
    failureRedirect: '/login'}));

app.get('/user', function(req,res){ //CAN CHANGE ROUTE NAMES
  res.render('student',{
    user: req.user,
    isAuthenticated: req.isAuthenticated()
  });
});

sequelize.sync().then(function() {
	app.listen(PORT, function() {
		console.log("Listening on PORT %s", PORT);
	});
});
