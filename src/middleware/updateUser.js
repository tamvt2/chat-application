const schedule = require('node-schedule');
const db = require('../config/db');

function updateUserActivity(req, res, next) {
	const userId = req.session.userId;
	if (userId) {
		const query =
			'UPDATE users SET last_activity = NOW(), status = "online" WHERE id = ?';
		db.query(query, [userId], (err, result) => {
			if (err) {
				console.error(err);
			}
			next(); // Chuyển sang middleware hoặc route handler tiếp theo
		});
	} else {
		next(); // Chuyển sang middleware hoặc route handler tiếp theo
	}
}

// Hàm cập nhật trạng thái người dùng không hoạt động
function updateInactiveUsers() {
	const query = `
        UPDATE users
        SET status = 'offline'
        WHERE status = 'online'
        AND last_activity < NOW() - INTERVAL 10 MINUTE
    `;
	db.query(query, (err, result) => {
		if (err) {
			console.error(err);
		} else {
			console.log(`Updated ${result.affectedRows} users to offline`);
		}
	});
}

// Lên lịch để kiểm tra mỗi phút
schedule.scheduleJob('*/1 * * * *', () => {
	updateInactiveUsers();
});

module.exports = updateUserActivity;
