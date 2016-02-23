var express = require('express');
var expressHandelbars = require('express-handlebars');
var bodyParser = require('body-parser');
var Sequelize = require('sequelize');
var bcrypt = require('bcryptjs');
var app = express();

var PORT = process.env.PORT || 8070;

app.engine('handlebars', expressHandelbars({
	defaultLayout: 'main'
}));

app.set('view engine', 'handlebars');

app.use(bodyParser.urlencoded({
	extended: false
}));





sequelize.sync().then(function() {
	app.listen(PORT, function() {
		console.log("Listening on PORT %s", PORT);
	});
});