const con = require('../../config/db');

class User_channel {
	constructor() {
		con.query(`CREATE TABLE IF NOT EXISTS user_channels (
			id BIGINT AUTO_INCREMENT PRIMARY KEY,
			user_id BIGINT NOT NULL,
			channel_id BIGINT NOT NULL,
			joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE,
			FOREIGN KEY (channel_id) REFERENCES channels (id) ON DELETE CASCADE ON UPDATE CASCADE
		)`);
	}

	create(user_id, channel_id, callback) {
		con.query(
			'INSERT INTO user_channels (user_id, channel_id) VALUES (?, ?)',
			[user_id, channel_id],
			callback
		);
	}

	findCommonChannels(userId1, userId2, callback) {
		con.query(
			'SELECT uc1.channel_id FROM user_channels uc1 JOIN user_channels uc2 ON uc1.channel_id = uc2.channel_id WHERE uc1.user_id = ? AND uc2.user_id = ?',
			[userId1, userId2],
			callback
		);
	}

	findChannels(user_id, channel_id, callback) {
		con.query(
			'SELECT channel_id FROM user_channels WHERE user_id = ? AND channel_id = ?',
			[user_id, channel_id],
			callback
		);
	}

	getById(userId, callback) {
		con.query(
			'SELECT channels.name, channel_id FROM user_channels INNER JOIN channels ON channels.id = user_channels.channel_id WHERE user_channels.user_id = ?',
			[userId],
			callback
		);
	}

	getByChannelId(channelId, userId, callback) {
		con.query(
			'SELECT users.id, users.name, users.status, users.image_url, user_channels.channel_id FROM user_channels INNER JOIN users ON users.id = user_channels.user_id WHERE user_channels.channel_id = ? AND users.id != ?',
			[channelId, userId],
			callback
		);
	}
}

module.exports = new User_channel();
