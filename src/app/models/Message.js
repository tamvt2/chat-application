const con = require('../../config/db');

class Message {
	constructor() {
		con.query(`
            CREATE TABLE IF NOT EXISTS messages (
                id BIGINT AUTO_INCREMENT PRIMARY KEY,
                user_id BIGINT NOT NULL,
                channel_id BIGINT NOT NULL,
				content TEXT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
				FOREIGN KEY (user_id) REFERENCES users(id)
				ON DELETE CASCADE
				ON UPDATE CASCADE,
				FOREIGN KEY (channel_id) REFERENCES channels(id)
				ON DELETE CASCADE
				ON UPDATE CASCADE
            )
        `);
	}

	create(data, callback) {
		con.query('INSERT INTO messages SET ?', data, callback);
	}

	getByChannelId(channel_id, callback) {
		con.query(
			'SELECT messages.user_id, messages.content, messages.created_at, users.image_url, files.file_path, files.mimetype From messages INNER JOIN users ON users.id = messages.user_id LEFT JOIN files ON files.message_id = messages.id WHERE channel_id = ? ORDER BY created_at ASC',
			channel_id,
			callback
		);
	}

	getContentByChannelId(channel_id, user_id, callback) {
		con.query(
			`SELECT messages.content, notifications.is_read, messages.created_at FROM messages INNER JOIN notifications ON notifications.message_id = messages.id WHERE messages.channel_id = ? AND messages.user_id != ? AND (notifications.user_id = ? OR messages.channel_id IN (SELECT channel_id FROM user_channels WHERE user_id = ?)) ORDER BY messages.created_at DESC LIMIT 1`,
			[channel_id, user_id, user_id, user_id],
			callback
		);
	}
}

module.exports = new Message();
