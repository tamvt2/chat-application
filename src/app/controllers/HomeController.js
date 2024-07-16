const Message = require('../models/Message');
const Channel = require('../models/Channel');
const User_channel = require('../models/User_channel');

class HomeControler {
	index(req, res) {
		const user_id = req.session.userId;
		const resultsArray = [];
		User_channel.getById(user_id, (err, results) => {
			results.forEach((element) => {
				const channel_id = element.channel_id;
				User_channel.getByChannelId(
					channel_id,
					user_id,
					(err, users) => {
						resultsArray.push({
							...element,
							image_url: users[0].image_url,
						});
						if (resultsArray.length === results.length) {
							res.render('home', { results: resultsArray });
							// res.json({ results: resultsArray });
						}
					}
				);
			});
		});
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
											return res.json({
												success: true,
												message: 'Thêm thành công',
												channel_id: channel_id,
											});
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
		const content = req.body.content;
		Message.create({ user_id, channel_id, content }, (err, result) => {
			if (result.length === 0) {
				return res.json({
					success: false,
					message: 'Thêm thất bại',
				});
			}
			return res.json({
				success: true,
				message: 'Thêm thành công',
			});
		});
	}

	getMessage(req, res) {
		const channel_id = req.query.channel_id;
		Message.getByChannelId(channel_id, (err, results) => {
			return res.json({ results });
		});
	}
}

module.exports = new HomeControler();
