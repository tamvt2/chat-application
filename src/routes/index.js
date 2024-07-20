const userRouter = require('./user');
const homeRouter = require('./home');
const { uploadImage, uploadFile } = require('../config/upload');
const UploadController = require('../app/controllers/UploadController');

function route(app) {
	app.use('/', userRouter);

	app.post(
		'/upload-image',
		uploadImage.single('image'),
		UploadController.uploadImage
	);

	app.post(
		'/upload-file',
		uploadFile.array('files', 10),
		UploadController.uploadFile
	);

	app.use('/', homeRouter);
}

module.exports = route;
