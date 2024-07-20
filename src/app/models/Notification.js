const con = require('../../config/db');

class Notification {
	constructor() {
		con.query(`
            CREATE TABLE IF NOT EXISTS notifications (
                id BIGINT AUTO_INCREMENT PRIMARY KEY,
                user_id BIGINT NOT NULL,
                channel_id BIGINT NOT NULL,
                message_id BIGINT NOT NULL,
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

	create(userId, channel_id, message_id, callback) {
		con.query(
			'INSERT INTO notifications (user_id, channel_id, message_id) VALUES (?, ?, ?)',
			[userId, channel_id, message_id],
			callback
		);
	}

	update(user_id, channel_id, callback) {
		con.query(
			'UPDATE notifications SET is_read = true WHERE user_id = ? AND channel_id = ? AND is_read = false',
			[user_id, channel_id],
			callback
		);
	}
}

module.exports = new Notification();
