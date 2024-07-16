const con = require('../../config/db');

class Notification {
	constructor() {
		con.query(`
            CREATE TABLE IF NOT EXISTS notifications (
                id BIGINT AUTO_INCREMENT PRIMARY KEY,
                user_id BIGINT NOT NULL,
                channel_id BIGINT NOT NULL,
                message_id BIGINT NOT NULL,
				file_path VARCHAR(255) NULL,
				is_read BOOLEAN DEFAULT false,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
				FOREIGN KEY (user_id) REFERENCES users(id)
				ON DELETE CASCADE
				ON UPDATE CASCADE,
				FOREIGN KEY (channel_id) REFERENCES channels(id)
				ON DELETE CASCADE
				ON UPDATE CASCADE,
				FOREIGN KEY (message_id) REFERENCES messages(id)
				ON DELETE CASCADE
				ON UPDATE CASCADE
            )
        `);
	}
}

module.exports = new Notification();
