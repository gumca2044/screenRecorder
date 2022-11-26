var express = require('express');
var app = express();
app.use(express.static('.'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', function (req, res) {
	// res.send('Hello World');
	res.sendFile(__dirname + "/recordScreen.html");
})

var host = '127.0.0.1';
var port = 8180;

var server = app.listen(port, function () {
	console.log("Example app listening at http://%s:%s/", host, port);
	console.log("Press 'Ctrl' + 'C' to stop server");
})
