const User = require('../app/models/User');

module.exports = (req, res, next) => {
	if (req.session && req.session.userId) {
		res.locals.sessionID = req.session.userId;
		res.locals.sessionUser = req.session.username;
		res.locals.sessionPhone = req.session.phone;
		res.locals.sessionEmail = req.session.email;
		res.locals.sessionImage_url = req.session.image_url;
	} else {
		res.locals.sessionUser = null;
		res.locals.sessionPhone = null;
		res.locals.sessionEmail = null;
		res.locals.sessionImage_url = null;
		res.locals.sessionID = null;
	}
	next();
};
