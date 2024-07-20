const con = require('../../config/db');

class File {
	constructor() {
		con.query(`
            CREATE TABLE IF NOT EXISTS files (
                id BIGINT AUTO_INCREMENT PRIMARY KEY,
                message_id BIGINT NOT NULL,
				file_path VARCHAR(255) NULL,
				mimetype VARCHAR(255) NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
				FOREIGN KEY (message_id) REFERENCES messages(id)
				ON DELETE CASCADE
				ON UPDATE CASCADE
            )
        `);
	}

	create(data, callback) {
		con.query('INSERT INTO files SET ?', data, callback);
	}

	getImageByChannelId(channel_id, callback) {
		con.query(
			`SELECT files.* FROM files INNER JOIN messages ON messages.id = files.message_id WHERE (mimetype LIKE 'image/%' OR mimetype LIKE 'video/%') AND messages.channel_id = ? ORDER BY files.created_at DESC`,
			[channel_id],
			callback
		);
	}

	getFileByChannelId(channelId, callback) {
		con.query(
			`SELECT files.* FROM files INNER JOIN messages ON messages.id = files.message_id
			WHERE (mimetype NOT LIKE 'image/%' AND mimetype NOT LIKE 'video/%')
			AND messages.channel_id = ? ORDER BY files.created_at DESC`,
			[channelId],
			callback
		);
	}
}

module.exports = new File();
