var express           = require('express');
var expressHandlebars = require('express-handlebars');
var session           = require('express-session');
var Sequelize         = require('sequelize');
var passport          = require('passport');
var passportLocal     = require('passport-local');
var bcrypt            = require('bcryptjs');
var bodyParser        = require('body-parser');
var methodOverride    = require('method-override');
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
app.use(methodOverride('_method'));
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
  res.render('index',{
    msg: req.query.msg,
    user: req.user,
    isAuthenticated: req.isAuthenticated(),

  });
});

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


/*-------------------------------------------------
  C.R.U.D. ROUTES
-------------------------------------------------*/

app.get("/user_dashboard", function(req, res){
  console.log('user is', req.user);
  var where = {};
  if(req.user) {
    where = {
      where: {
        userId: req.user.id
      }
    }
  }
  console.log(where);
  Place.findAll(where).then(function(places) {
    res.render('user_dashboard', {
      msg: req.query.msg,
      user: req.user,
      isAuthenticated: req.isAuthenticated(),
      results: places //left side = handlebars right side = data variable
    });
  });
});


app.get("/delete/:id", function(req, res) {
  var reviewId = req.params.id;
  console.log("#################" +reviewId);
  Place.destroy(
    {
      where: {id: reviewId}
    }).then(function(result) {
    res.redirect('/user_dashboard?msg=Review deleted.');
    }).catch(function(err) {
      console.log(err);
      res.redirect('/yourReviews?msg=' + err.message);
    });
});

// EDIT SPECIFIED PLACE

//As off now the update - added a new row
app.put("/edit/:id/update", function(req, res) {
  var newName = req.body.business_name;
  var newAddress1 = req.body.business_address1;
  var newAddress2 = req.body.business_address2;
  var newPhone = req.body.business_phone;
  var newComment = req.body.business_comment;
  var newRating = req.body.business_rating;
  var reviewId = req.params.id;

  Place.update({
    business_name: newName,
    business_address1: newAddress1,
    business_address2: newAddress2,
    business_phone: newPhone,
    business_comment: newComment,
    business_rating: newRating,
  },
  {
    where: {id: reviewId}
  }).then(function(result) {
  res.redirect('/user_dashboard?msg=Review Updated');
  }).catch(function(err) {
    console.log(err);
    res.redirect('/?msg=' + err.message);
  });
});

/*-------------------------------------------------
  USER REGISTRATION POST ROUTE
-------------------------------------------------*/
app.post('/save_user', function(req, res) {
  User.create(req.body).then(function(result) {
    res.redirect('/?msg=Account Created. Please login');
  }).catch(function(err) {
    res.redirect('/?msg=' + err.errors[0].message);
  });
});

app.post("/save_business", function(req, res) {
  var saveBusiness = req.body;
  saveBusiness.userId = req.user.id;
  Place.create(saveBusiness).then(function(result) {
    res.redirect('/user_dashboard?msg=You Created A New Venue!');
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

// app.get('/user_dashboard', function(req,res){
//   res.render('user_dashboard',{
//     user: req.user,
//     isAuthenticated: req.isAuthenticated(),
//     msg: req.query.msg,
//   });
// });

app.get('/logout', function(req,res){
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
