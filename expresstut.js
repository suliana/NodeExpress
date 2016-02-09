var express = require('express');

var app = express();

app.disable('x-powered-by');

var handlebars = require('express-handlebars').create({defaultLayout:'main'});

app.engine('handlebars', handlebars.engine);

app.set('view engine', 'handlebars');

//////MORE IMPORTS HERE

app.use(require('body-parser').urlencoded({
	extended: true }));

var formidable = require('formidable');

var credentials = require('./credientials.js');
app.use(require('cookie-parser')(credentials.cookieSecret));

app.set('port', process.env.PORT || 3000);

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res){
	res.render('home');
});

app.use(function (req, res, next) {
	console.log('Looking for the URL' + req.url);
	next();
})

app.get('/junk', function (req, res, next){
	console.log('Tried to access /junk');
	throw new Error(' /junk doesn\'t exist')

});

app.use(function (err, req, res, next){
	console.log('Error : ' + err.message);
	next();
})
app.get('/about', function (req, res){
	res.render('about');
});

app.get('/contact', function (req, res){
	res.render('contact', {csrf: 'CSRF token here'});
});

app.get('/thankyou', function (req, res){
	res.render('thankyou');
});

app.post('/process', function (req, res){
  console.log('Form : ' + req.query.form);
  console.log('CSRF token : ' + req.body._csrf);
  console.log('Email : ' + req.body.email);
  console.log('Question : ' + req.body.ques);
  res.redirect(303, '/thankyou');
});

/*app.get('/file-upload', function (req, res) {
	var now = new Date();
	res.render('file-upload', {
		year: now.getFullYear(),
		month: now.getMonth()
	});
});*/

app.get('/file-upload', function (req, res){
  var now = new Date();
  res.render('file-upload',{
    year: now.getFullYear(),
    month: now.getMonth()
	});
});


/*app.post('/file-upload/:year/:month',
	function (req, res) {
		var form = new formidable.IncomingForm();
		form.parser (req, function (err, fields, file){
			if (err)
				return res.redirect(303,'/error');
			console.log('Received File');

			console.log(file);
			res.redirect(303,'/thankyou');
		});
});*/

app.post('/file-upload/:year/:month',
  function (req, res){
	var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, file){
      if(err)
        return res.redirect(303, '/error');
      console.log('Received File');

      console.log(file);
      res.redirect( 303, '/thankyou');
  });
});

app.get('/cookie', function(req, res){

  res.cookie('username', 'Suliana Abbay', {expire : new Date() + 9999}).send('username has the value of : Suliana Abbay');
});

app.get('/listcookies', function(req, res){
  console.log("Cookies : ", req.cookies);
  res.send('Look in console for cookies');
});

app.get('/deletecookie', function(req, res){
  res.clearCookie('username');
  res.send('username Cookie Deleted');
});


var session = require('express-session');

var parseurl = require('parseurl');

app.use(session({

  resave: false,

  saveUninitialized: true,

  secret: credentials.cookieSecret,
}));


// This is another example of middleware.
app.use(function(req, res, next){
  var views = req.session.views;

  // If no views initialize an empty array
  if(!views){
    views = req.session.views = {};
  }

  // Get the current path
  var pathname = parseurl(req).pathname;

  // Increment the value ißn the array using the path as the key
  views[pathname] = (views[pathname] || 0) + 1;

  next();

});

// When this page is accessed get the correct value from
// the views array
app.get('/viewcount', function(req, res, next){
  res.send('You viewed this page ' + req.session.views['/viewcount'] + ' times ');
});

// When this page is accessed get the correct value from
// the views array
app.get('/viewcount', function(req, res, next){
  res.send('You viewed this page ' + req.session.views['/viewcount'] + ' times ');
});

// Reading and writing to the file system
// Import the File System module : npm install --save fs
var fs = require("fs");

app.get('/readfile', function(req, res, next){

  // Read the file provided and either return the contents
  // in data or an err
  fs.readFile('./public/randomfile.txt', function (err, data) {
   if (err) {
       return console.error(err);
   }
   res.send("The File : " + data.toString());
  });

});

// This writes and then reads from a file
app.get('/writefile', function(req, res, next){

  // If the file doesn't exist it is created and then you add
  // the text provided in the 2nd parameter
  fs.writeFile('./public/randomfile2.txt',
    'More random text', function (err) {
   if (err) {
       return console.error(err);
    }
  });

    // Read the file like before
   fs.readFile('./public/randomfile2.txt', function (err, data) {
   if (err) {
       return console.error(err);
   }

   res.send("The File : " + data.toString());
  });

});




/////////////////////////////////

app.use(function (req, res){
	res.type('text/html');
	res.status(404);
	res .render('404');
});

app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500);
  res.render('500');
});




app.listen(app.get('port'), function(){
	console.log('Express started @ http://localhost:' + app.get('port') + ' press Ctrl-C to terminate');
});