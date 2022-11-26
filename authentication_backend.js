var mysql = require('mysql');
var nStatic = require('node-static');
var fileServer = new nStatic.Server('.');
const http = require('http');
var url = require('url');

var poolConnection = mysql.createPool({
	connectionLimit: 5,
	host: "localhost",
	user: "dbAdmin",
	password: "",
	database: "docsmeet"
});

const hostname = '127.0.0.1';
const port = 8180;

// certain things like flash and all youll have to import and use otherwise remove if not rewuired check and see

// SIGNIN - LOGIN
function signin(req, res, next) {

    var email = req.body.email;
    var password = req.body.password;

    connection.query('SELECT user_id FROM users WHERE email = ?', [email], function(err, rows) {

        if(err)
			throw err
        // if user not found

        if (rows.length <= 0) {
            req.flash('error', 'Please enter correct email and password!')
            res.redirect('/login')
        }

        else { // if user found
            // render to views/user/edit.ejs template file
            var crypt_password = MD5(password).toString();
            var id=rows[0].user_id;
            //console.log("idf",id)
        	// JSON.stringify(rows,function(key,value){if(key == 'id') {id=value;}});
            connection.query('SELECT u_password FROM u_passwords WHERE user_id = ?', [id], function(err, rows) {
            	//  console.log(" rows",rows[0]);
                //console.log("crypt",crypt_password);
                if(err)
					throw err
                if (rows.length <= 0) {
                    req.flash('error', 'Please enter correct password!');
                    res.redirect('/login');
                }
                else {
                    if(rows[0].u_password.toString() === crypt_password){
                    req.session.loggedin = true;
                    connection.query('SELECT f_name,l_name FROM users WHERE email = ?', [email], function(err, rows) {

                        if(err) throw err
                        else{
                            var f_name = rows[0].f_name.toString();
                            var l_name = rows[0].l_name.toString();
                            var uname = f_name+" "+l_name;
                            //req.session.userName = uname;
                            res.cookie("userName",uname);
                            res.cookie("userEmail",email);
                            //console.log(req.session.userName);
                            req.session.userEmail= email;
							res.redirect('/auth/home');
                        }
                    })

                    }
                    else{
                        req.flash('error', 'Please enter correct password!')
                        res.redirect('/login')
                    }
                }
            });
        }
    })
}

// SIGN - UP REGISTER
function register(req, res, next) {
    var sal = req.body.salutation;
    var fname = req.body.fname;
    var lname = req.body.lname;
    var mail = req.body.mail;
    var password = req.body.password;
    var crypt_password = MD5(password).toString();

    //users=user_id	salutation	f_name	l_name	email	user_role

    connection.query('INSERT INTO users (salutation, f_name, l_name, email, user_role) VALUES (?,?,?,?,"user")', [sal,fname,lname,mail], function(err, rows){
        if(err)
			throw err
        else {
            connection.query('INSERT INTO u_passwords(user_id,u_password) VALUES ((SELECT user_id FROM users WHERE email = ?),?)', [mail,crypt_password], function(err, rows) {
                if(err) throw err
            else
                res.redirect('/login');
            });
        }
    })
}

const server = http.createServer((request, response) => {
	var href = url.parse(request.url);
	fileServer.serve(request, response);
});

server.listen(port, hostname, () => {
	console.log(`Server running at http://${hostname}:${port}/`);
	console.log(`Press 'Ctrl' + 'C' to stop server`);
	// console.log();
});
