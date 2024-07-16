const con = require('../../config/db');

class File {
	constructor() {
		con.query(`
            CREATE TABLE IF NOT EXISTS files (
                id BIGINT AUTO_INCREMENT PRIMARY KEY,
                message_id BIGINT NOT NULL,
				file_path VARCHAR(255) NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
				FOREIGN KEY (message_id) REFERENCES messages(id)
				ON DELETE CASCADE
				ON UPDATE CASCADE
            )
        `);
	}
}

module.exports = new File();
