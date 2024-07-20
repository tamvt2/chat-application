const Message = require('../models/Message');
const File = require('../models/File');

class UploadController {
	uploadImage(req, res) {
		if (req.file) {
			res.json({
				success: true,
				message: 'Upload thành công',
				imageUrl: req.file.path,
			});
		} else {
			res.json({
				success: false,
				message: 'Upload thất bại',
			});
		}
	}

	async uploadFile(req, res) {
		const user_id = req.session.userId;
		const content = req.body.content;
		const channel_id = req.body.channel_id;

		for (let file of req.files) {
			if (file.size > 100 * 1024 * 1024) {
				return res.json({
					message: 'Tệp quá lớn. Vui lòng chọn tệp nhỏ hơn 100MB.',
				});
			}
			console.log(file);

			const file_path = file.path;
			const mimetype = file.mimetype;

			Message.create({ user_id, channel_id, content }, (err, result) => {
				if (result.affectedRows === 0) {
					return res.json({ success: false });
				}
				const message_id = result.insertId;
				File.create(
					{ message_id, file_path, mimetype },
					(err, result) => {
						if (result.affectedRows === 0) {
							return res.json({ success: false });
						}
						return res.json({
							success: true,
							message: 'Tải tệp lên thất bại',
						});
					}
				);
			});
		}
	}
}

module.exports = new UploadController();
