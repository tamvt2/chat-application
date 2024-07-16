const con = require('../../config/db');

class Channel {
	constructor() {
		con.query(`
            CREATE TABLE IF NOT EXISTS channels (
                id BIGINT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
	}

	create(name, callback) {
		con.query('INSERT INTO channels (name) VALUES (?)', name, callback);
	}
}

module.exports = new Channel();
