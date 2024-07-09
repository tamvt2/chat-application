const con = require('../../config/db');
const bcrypt = require('bcryptjs');

class User {
	constructor() {
		con.query(`
            CREATE TABLE IF NOT EXISTS users (
                id BIGINT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                status VARCHAR(50) DEFAULT 'offline'
            )
        `);
	}

	get(callback) {
		con.query('SELECT * FROM users', callback);
	}

	getByEmail(email, callback) {
		con.query('SELECT * FROM users WHERE email = ?', email, callback);
	}

	create(data, callback) {
		con.query('INSERT INTO users SET ?', data, callback);
	}

	validatePassword(inputPassword, storedPassword, callback) {
		bcrypt.compare(inputPassword, storedPassword, callback);
	}
}

module.exports = new User();
