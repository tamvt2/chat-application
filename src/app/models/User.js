const con = require('../../config/db');
const bcrypt = require('bcryptjs');

class User {
	constructor() {
		con.query(`
            CREATE TABLE IF NOT EXISTS users (
                id BIGINT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
				phone VARCHAR(255) NULL,
                password VARCHAR(255) NOT NULL,
				image_url VARCHAR(255) DEFAULT '/img/undraw_profile.svg',
                status VARCHAR(50) DEFAULT 'offline',
				last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
	}

	get(callback) {
		con.query('SELECT * FROM users', callback);
	}

	getByEmail(email, callback) {
		con.query('SELECT * FROM users WHERE email = ?', email, callback);
	}

	getById(id, callback) {
		con.query(
			'SELECT name, email, phone, image_url FROM users WHERE id = ?',
			id,
			callback
		);
	}

	getByPhone(phone, callback) {
		con.query(
			'SELECT name, phone, image_url, id FROM users WHERE ?',
			phone,
			callback
		);
	}

	create(data, callback) {
		con.query('INSERT INTO users SET ?', data, callback);
	}

	update(data, id, callback) {
		con.query('UPDATE users SET ? WHERE id = ?', [data, id], callback);
	}

	validatePassword(inputPassword, storedPassword, callback) {
		bcrypt.compare(inputPassword, storedPassword, callback);
	}
}

module.exports = new User();
