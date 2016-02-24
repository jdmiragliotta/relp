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





sequelize.sync().then(function() {
	app.listen(PORT, function() {
		console.log("Listening on PORT %s", PORT);
	});
});
