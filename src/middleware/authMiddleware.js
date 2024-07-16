const checkLoggedIn = (req, res, next) => {
	if (req.session.userId || req.session.token) {
		next();
	} else {
		res.redirect('/login');
	}
};

module.exports = checkLoggedIn;
