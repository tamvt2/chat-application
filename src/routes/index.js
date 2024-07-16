const userRouter = require('./user');
const homeRouter = require('./home');
const { upload } = require('../config/upload');
const UploadController = require('../app/controllers/UploadController');

function route(app) {
	app.use('/', userRouter);

	app.post(
		'/upload-image',
		upload.single('image'),
		UploadController.uploadImage
	);

	app.use('/', homeRouter);
}

module.exports = route;
