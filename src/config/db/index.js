const mysql = require('mysql2');

// Create a MySQL connection
const pool = mysql.createPool({
	// host: 'localhost',
	// user: 'root',
	// password: '',
	// database: 'chat-application',
	host: 'us-cluster-east-01.k8s.cleardb.net',
	user: 'b47739f0537f27',
	password: '7c6a3d46',
	database: 'heroku_ee7b7cf0b5e8ef6',
	connectionLimit: 20,
	queueLimit: 0,
});

// Connect to the MySQL server
pool.getConnection((error, connection) => {
	if (error) {
		console.error('Error connecting to MySQL:', error);
		return;
	}

	console.log('Connected to MySQL server.');
	connection.release();
});

module.exports = pool;
//b47739f0537f27:7c6a3d46@us-cluster-east-01.k8s.cleardb.net/heroku_ee7b7cf0b5e8ef6?reconnect=true
