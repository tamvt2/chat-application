const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
	cloud_name: 'dbs2lqchy',
	api_key: '645256847652639',
	api_secret: 'LKOwlz8ZO-xbKmevk73UIw7ohHY',
});

const imageStorage = new CloudinaryStorage({
	cloudinary,
	params: {
		folder: 'images',
		allowed_formats: ['jpg', 'png'],
		public_id: (req, file) =>
			file.fieldname + '-' + Date.now() + '-' + file.originalname,
	},
});

const fileStorage = new CloudinaryStorage({
	cloudinary,
	params: {
		folder: 'files',
		resource_type: 'auto',
		public_id: (req, file) =>
			file.fieldname + '-' + Date.now() + '-' + file.originalname,
	},
});

const uploadImage = multer({ storage: imageStorage });
const uploadFile = multer({
	storage: fileStorage,
	limits: {
		fileSize: 100 * 1024 * 1024, // 50MB
	},
});

module.exports = { uploadImage, uploadFile, cloudinary };
//CLOUDINARY_URL=cloudinary://<645256847652639>:<LKOwlz8ZO-xbKmevk73UIw7ohHY>@dbs2lqchy
