const con = require('../../config/db');

class Channel {
	constructor() {
		con.query(`
            CREATE TABLE IF NOT EXISTS channels (
                id BIGINT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NULL DEFAULT 'Kênh Chat Mới',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
	}

	create(name, callback) {
		con.query('INSERT INTO channels (name) VALUES (?)', [name], callback);
	}

	destroy(id, callback) {
		con.query('DELETE FROM channels WHERE id =?', [id], callback);
	}
}

module.exports = new Channel();
