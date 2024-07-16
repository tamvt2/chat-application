const mysql = require('mysql2');

const connection = mysql.createConnection({
	host: 'us-cluster-east-01.k8s.cleardb.net',
	user: 'b47739f0537f27',
	password: '7c6a3d46',
	database: 'heroku_ee7b7cf0b5e8ef6',
});

connection.connect((err) => {
	if (err) {
		console.error('Error connecting to MySQL: ' + err.stack);
		return;
	}
	console.log('Connect successfully!!!');
});

module.exports = connection;
//b47739f0537f27:7c6a3d46@us-cluster-east-01.k8s.cleardb.net/heroku_ee7b7cf0b5e8ef6?reconnect=true
