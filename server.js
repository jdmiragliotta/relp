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
var mysql = require('mysql');
require('dotenv').config();
var sequelize = new Sequelize(process.env.JAWSDB_URL);

//SETS UP HANDLEBARs LAYOUTS
app.engine('handlebars', expressHandlebars({defaultLayout: 'main'}));
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
// USER INFORMATION MODEL //
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
      validate: {
        len: {
        	args: [1, 30],
        	msg: "Your username must be between 1 and 30 characters."
        	}
        }
    },
    password:{
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        len: {
        	args: [8, 25],
        	msg: "Your password must be between 8 and 25 characters."
        }
      }
    }
  } , {
      hooks: {
        beforeCreate: function(input){
          input.password = bcrypt.hashSync(input.password, 10);
        }
      }
  });

// PLACES INFORMATION MODEL //
var Place = sequelize.define('place', {
	business_name: {
		type: Sequelize.STRING,
		allowNull:  false,
		unique: true
	},
	business_address: {
		type: Sequelize.STRING,
		allowNull:  false,
		unique: true
	},
	business_phone: {
		type: Sequelize.STRING, //set to string to allow special characters.
		allowNull:  false,
		unique: true
	},
	business_category: {
		type: Sequelize.STRING,
		allowNull:  false
	},
	user_comment : {
		type: Sequelize.STRING,
		allowNull:  false,
		validate: {
			len: {
				args: [3, 500],
				msg: "Your comment must be between 3 and 500 characters."
			}
		}
	}
});

/*-------------------------------------------------
  ROUTES
-------------------------------------------------*/
//GOTO INDEX
app.get('/', function(req, res){
  res.render('index');
});
//GOTO REGISTER
app.get('/register', function(req, res){
  res.render('register');
});
//GOTO PLACES
app.get('/place_list',function(req,res){
  res.render('place_list');
});
//GOTO USER DASHBOARD
app.get('/user_dashboard',function(req,res){
  res.render('user_dashboard');
});
//GOTO CATEGORIES
app.get('/categories',function(req,res){
  res.render('categories');
});
//RESTAURANTS
app.get('/categories/:restaurant',function(req,res){
  res.render('categories'); // LOOK INTO THIS
});
//ACTIVITIES
app.get('/categories/:activities',function(req,res){
  res.render('categories'); // LOOK INTO THIS
});
//TOURISM
app.get('/categories/:tourism',function(req,res){
  res.render('categories'); // LOOK INTO THIS
});
//NIGHTLIFE
app.get('/categories/:nightlife',function(req,res){
  res.render('categories'); // LOOK INTO THIS
});

/*-------------------------------------------------
  USER REGISTRATION POST ROUTE
-------------------------------------------------*/
app.post('/user_registration', function(req, res) {
	User.create(req.body).then(function(result) {
		res.redirect('/?msg=Account created');
	}).catch(function(err) {
		res.redirect('/?msg=' + err.errors[0].message);
	});
});

/*-------------------------------------------------
  AUTHORIZED LOGIN/LOGOUT ROUTES
-------------------------------------------------*/
app.post('/user-dashboard', //CAN CHANGE ROUTE NAMES
  passport.authenticate('user', {
    successRedirect: '/user',
    failureRedirect: '/login'}));

app.get('/add-location', function(req,res){ //CAN CHANGE ROUTE NAMES
  res.render('add-location',{
    user: req.user,
    isAuthenticated: req.isAuthenticated()
  });
});

app.get('/logout', function(req,res){
  req.session.authenticated = false;
  res.redirect('/?msg=You have successfully logged out');
});

/*-------------------------------------------------
  DATABASE CONNECTION VIA SEQUELIZE
-------------------------------------------------*/
sequelize.sync().then(function() {
	app.listen(PORT, function() {
		console.log("Listening on PORT %s", PORT);
	});
});
