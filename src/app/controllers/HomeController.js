const Message = require('../models/Message');
const Channel = require('../models/Channel');
const User_channel = require('../models/User_channel');
const File = require('../models/File');
const Notification = require('../models/Notification');

class HomeControler {
	getChannel(req, res) {
		const user_id = req.session.userId;
		User_channel.getById(user_id, (err, results) => {
			// Tạo các promise để xử lý các yêu cầu bất đồng bộ
			const promises = results.map((element) => {
				const channel_id = element.channel_id;

				// Tạo promise cho việc lấy nội dung tin nhắn
				const messagePromise = new Promise((resolve, reject) => {
					Message.getContentByChannelId(
						channel_id,
						user_id,
						(err, result) => {
							resolve({
								content:
									result.length > 0 ? result[0].content : '',
								is_read:
									result.length > 0 ? result[0].is_read : 0,
								created_at:
									result.length > 0
										? result[0].created_at
										: '',
							});
						}
					);
				});

				// Tạo promise cho việc lấy thông tin người dùng
				const userPromise = new Promise((resolve, reject) => {
					User_channel.getByChannelId(
						channel_id,
						user_id,
						(err, users) => {
							resolve({
								image_url:
									users.length > 0 ? users[0].image_url : '',
							});
						}
					);
				});

				// Sử dụng Promise.all để chờ cả hai promise hoàn tất
				return Promise.all([messagePromise, userPromise]).then(
					([messageData, userData]) => {
						return {
							...element,
							...messageData,
							...userData,
						};
					}
				);
			});

			// Sử dụng Promise.all để chờ tất cả các promise hoàn tất
			Promise.all(promises)
				.then((resultsArray) => {
					resultsArray.sort((a, b) => {
						// Chuyển đổi chuỗi thời gian thành đối tượng Date
						const dateA = a.created_at
							? new Date(a.created_at)
							: new Date(0);
						const dateB = b.created_at
							? new Date(b.created_at)
							: new Date(0);

						// So sánh để sắp xếp
						return dateB - dateA; // Ngược lại để tin nhắn gần nhất lên trên
					});
					return res.json(resultsArray);
				})
				.catch((err) => {});
		});
	}

	index(req, res) {
		res.render('home', { show: true });
	}

	getUser(req, res) {
		const channelId = req.query.channel_id;
		const userId = req.session.userId;
		User_channel.getByChannelId(channelId, userId, (err, result) => {
			return res.json(result);
		});
	}

	addNewUser(req, res) {
		try {
			const user_id = req.body.id;
			const channelName = 'Kênh Chat Mới';
			const currentUser_id = req.session.userId;
			User_channel.findCommonChannels(
				user_id,
				currentUser_id,
				(err, commonChannels) => {
					if (commonChannels.length > 0) {
						const commonChannelId = commonChannels[0].channel_id;
						return res.json({
							success: true,
							message: 'Đã có kênh chung',
							channel_id: commonChannelId,
						});
					} else {
						Channel.create(channelName, (err, result) => {
							const channel_id = result.insertId;
							User_channel.create(
								user_id,
								channel_id,
								(err, result) => {
									if (result.affectedRows === 0) {
										return res.json({
											success: false,
											message: 'Thêm thất bại',
										});
									}

									User_channel.create(
										currentUser_id,
										channel_id,
										(err, result) => {
											User_channel.getByChannelId(
												currentUser_id,
												channel_id,
												(err, result) => {
													return res.json({
														success: true,
														message:
															'Thêm thành công',
														result: result,
													});
												}
											);
										}
									);
								}
							);
						});
					}
				}
			);
		} catch (error) {}
	}

	addUser(req, res) {
		const { id, channel_id } = req.body;
		User_channel.findChannels(id, channel_id, (err, commonChannels) => {
			if (commonChannels.length > 0) {
				const commonChannelId = commonChannels[0].channel_id;
				return res.json({
					success: true,
					message: 'Đã có kênh chung',
					channel_id: commonChannelId,
				});
			} else {
				User_channel.create(id, channel_id, (err, result) => {
					if (result.affectedRows === 0) {
						return res.json({
							success: false,
							message: 'Thêm thất bại',
						});
					}
					return res.json({
						success: true,
						message: 'Thêm thành công',
						channel_id: channel_id,
					});
				});
			}
		});
	}

	sendMessage(req, res) {
		const user_id = req.session.userId;
		const channel_id = req.body.channel_id;
		const userId = req.body.userId;
		const content = req.body.content;
		Message.create({ user_id, channel_id, content }, (err, result) => {
			if (result.length === 0) {
				return res.json({
					success: false,
					message: 'Thêm thất bại',
				});
			}

			const message_id = result.insertId;
			Notification.create(userId, channel_id, message_id, (err) => {
				return res.json({
					success: true,
					message: 'Thêm thành công',
				});
			});
		});
	}

	getMessage(req, res) {
		const channel_id = req.query.channel_id;
		const user_id = req.session.userId;
		Notification.update(user_id, channel_id, (err, results) => {});
		Message.getByChannelId(channel_id, (err, results) => {
			return res.json({ results });
		});
	}

	destroyMessage(req, res) {
		const channel_id = req.params.id;
		Channel.destroy(channel_id, (err, results) => {
			if (results.affectedRows === 0) {
				return res.json({
					success: false,
					message: 'Xóa thất bại',
				});
			}
			return res.json({
				success: true,
				message: 'Xóa thành công',
			});
		});
	}

	getImage(req, res) {
		const channel_id = req.query.channel_id;
		File.getImageByChannelId(channel_id, (err, results) => {
			if (results.length === 0) {
				return res.json({ success: false });
			}
			return res.json({ success: true, results });
		});
	}

	getFile(req, res) {
		const channel_id = req.query.channel_id;
		File.getFileByChannelId(channel_id, (err, results) => {
			if (results.length === 0) {
				return res.json({ success: false });
			}
			return res.json({ success: true, results });
		});
	}
}

module.exports = new HomeControler();
