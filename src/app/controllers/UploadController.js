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
}

module.exports = new UploadController();
