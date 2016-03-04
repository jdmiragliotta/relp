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
// var sequelize = new Sequelize('test', 'root');
// CONNECTS TO HEROKU DATABASE  - research to how to change DB name, username and login
// var mysql = require('mysql');
// require('dotenv').config();
// var sequelize = new Sequelize(process.env.JAWSDB_URL);

if(process.env.NODE_ENV === 'production') {
  // HEROKU DB
var sequelize = new Sequelize(process.env.JAWSDB_URL);
}
else {
  // LOCAL DB
 var sequelize = new Sequelize('relp', 'root');
}

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

passport.use(new passportLocal.Strategy(
  function(username, password, done) {
      //Check passwood in DB
      User.findOne({
        where:{
          username: username
        }
      }).then(function(user){
        //check password against hash
        if(user){
          bcrypt.compare(password, user.dataValues.password, function(err, bcryptUser){
            if(bcryptUser){
              //if password is correcnt authenticate the user with cookie
              done(null, user);
            }else{
              done(null,null);
            }
          });
        }else {
          done(null, null);
        }
      });
    }));

passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(user, done) {
  done(null, user);
});
/*-------------------------------------------------
  MODELS
-------------------------------------------------*/
// USER INFORMATION MODEL //
var User = sequelize.define('user',{
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
  business_address1: {
    type: Sequelize.STRING,
    allowNull:  false,
  },
  business_address2: {
    type: Sequelize.STRING,
    allowNull:  false,
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
  business_comment : {
    type: Sequelize.STRING,
    allowNull:  false,
    validate: {
      len: {
        args: [3, 500],
        msg: "Your comment must be between 3 and 500 characters."
      }
    }
  },
  business_rating: {
    type: Sequelize.STRING,
    allowNull: false
  }
});


/*-------------------------------------------------
  TABLE ASSOCIATIONS
-------------------------------------------------*/

User.hasMany(Place);


/*-------------------------------------------------
  ROUTES
-------------------------------------------------*/
//GOTO INDEX
app.get('/', function(req, res){
  res.render('index');
});

//GOTO BUSINESS REGISTRATION
app.get('/business_register', function(req, res){
  res.render('business_registration');
});

// //GOTO USER REGISTRATION
// app.get('/user_register', function(req, res){
//   res.render('user_registration');
// });

app.get('/restaurant', function(req, res){
  Place.findAll({
      where:{
        business_category: 'restaurant'
      }
    }).then(function(results) {
        res.render('restaurant', {results});
      });
  });

app.get('/nightlife', function(req, res){
  Place.findAll({
      where:{
        business_category: 'nightlife'
      }
    }).then(function(results) {
        res.render('nightlife', {results});
      });
  });

app.get('/activities', function(req, res){
  Place.findAll({
      where:{
        business_category: 'activities'
      }
    }).then(function(results) {
        res.render('activities', {results});
      });
  });

app.get('/tourism', function(req, res){
  Place.findAll({
      where:{
        business_category: 'tourism'
      }
    }).then(function(results) {
        res.render('tourism', {results});
      });
  });

//GOTO PLACES - showing all places in db
// app.get('/show_all', function(req, res){
//   Place.findAll ({
//   }).then(function(results) {
//     res.render('show_all', {results});
//   });
// });


/*-------------------------------------------------
  C.R.U.D. ROUTES
-------------------------------------------------*/
//GOTO USER DASHBOARD - SHOW ALL USERS REVIEWS
app.get('/user_dashboard', function(req, res){
  var user = {};
  if(req.user) {
    user = {
      user: {
        userId: req.user.id
      }
    }
  }
  Place.findAll(user).then(function(results){
    res.render('user_dashboard', {
      user: req.user,
      isAuthenticated: req.isAuthenticated(),
      results: results
    });
  });
});

// DELETE SPECIFIED PLACE BASED ON USER ID
app.get('/delete:id', function(req, res){
  var user_place = req.user.id;
  console.log(user_place);
  Place.destroy({
    where: {id: user_place}
  }).then(function(results){
    res.redirect('/?msg=Review has been deleted');
  }) .catch(function(err){
    res.redirect('/?msg' + err.message);
  });
});

// EDIT SPECIFIED PLACE BASED ON USER ID
app.get('/edit:id', function(req, res){
  var whatever = req.user.id;
  console.log(whatever);
  Place.findAll({
    where: {
      id: whatever
    }
  });
});


/*-------------------------------------------------
  USER REGISTRATION POST ROUTE
-------------------------------------------------*/
app.post('/save_user', function(req, res) {
  User.create(req.body).then(function(result) {
    res.redirect('/');
  }).catch(function(err) {
    res.redirect('/?msg=' + err.errors[0].message);
  });
});

app.post("/save_business", function(req, res) {
  var saveBusiness = req.body;
  saveBusiness.userId = req.user.id;
  Place.create(saveBusiness).then(function(result) {
    res.redirect('/?msg=Business saved.');
  }).catch(function(err) {
    console.log(err);
    res.redirect('/?msg=' + err.message);
  });
});

/*-------------------------------------------------
  AUTHORIZED LOGIN/LOGOUT ROUTES
-------------------------------------------------*/
app.post('/check', //CAN CHANGE ROUTE NAMES
  passport.authenticate('local', {
    successRedirect: '/user_dashboard',
    failureRedirect: '/'
  }));

app.get('/user_dashboard', function(req,res){
  res.render('user_dashboard',{
    user: req.user,
    isAuthenticated: req.isAuthenticated(),
  });
});

app.get('/logout', function(req,res){
  // req.session.authenticated = false;
  // res.redirect('/?msg=You have successfully logged out');
  req.logout();
  res.redirect('/');
});

/*-------------------------------------------------
  DATABASE CONNECTION VIA SEQUELIZE
-------------------------------------------------*/
sequelize.sync().then(function() {
  app.listen(PORT, function() {
    console.log("Listening on PORT %s", PORT);
  });
});
