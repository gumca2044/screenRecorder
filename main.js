var mysql = require('mysql');
var express = require('express');
var MD5 = require('crypto-js/md5');
var app = express();
app.use(express.static('.'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'dbAdmin',
	password : '',
	database : 'mdp'
});

app.get('/', function (req, res) {
	// res.send('Hello World');
	res.sendFile(__dirname + "/index.html");
})

app.post('/auth', function(request, response) {
	// Capture the input fields
	let username = request.body.username;
	let password = MD5(request.body.password).toString();
	// Ensure the input fields exists and are not empty
	if (username && password) {
		// Execute SQL query that'll select the account from the database based on the specified username and password
		connection.query('SELECT u.email FROM users u, u_passwords p WHERE u.email = ? AND p.user_id = u.user_id AND p.u_password = ?', [username, password], function(error, results, fields) {
			// If there is an issue with the query, output the error
			if (error) throw error;
			// If the account exists
			if (results.length == 1) {
				// Authenticate the user
				// request.session.loggedin = true;
				// request.session.username = username;
				// Redirect to home page
				response.redirect('/recordScreen.html');
			} else {
				response.send('Incorrect Username and/or Password!');
			}
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
	password = '';
});

// SIGN - UP REGISTER
app.post('/authreg', function(request, response) {
	var fname = request.body.f_name;
   var lname = request.body.l_name;
   var mail = request.body.email;
   var password = MD5(request.body.password).toString();

   //users=user_id	salutation	f_name	l_name	email	user_role

	connection.query('INSERT INTO users (f_name, l_name, email) VALUES (?,?,?)', [fname,lname,mail], function(err, rows){
	   if(err)
		   throw err
	   else {
		   connection.query('INSERT INTO u_passwords(user_id,u_password) VALUES ((SELECT user_id FROM users WHERE email = ?),?)', [mail,password], function(err, rows) {
			   if(err) throw err
		   else
			   response.redirect('/index.html');
		   });
	   }
	});
	password = '';
});

var host = '127.0.0.1';
var port = 8180;

var server = app.listen(port, function () {
	console.log("Example app listening at http://%s:%s/", host, port);
	console.log("Press 'Ctrl' + 'C' to stop server");
})
