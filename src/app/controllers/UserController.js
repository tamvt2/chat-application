const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class UserController {
	create(req, res) {
		res.render('register', { showLogin: true, messages: req.flash() });
	}

	show(req, res) {
		res.render('login', { showLogin: true, messages: req.flash() });
	}

	async register(req, res) {
		const { name, email, password, repeatPassword } = req.body;

		if (name === '' || email === '' || password === '') {
			req.flash('error', 'Chưa nhập name, email hoặc mật khẩu!!!');
			return res.redirect('/register');
		}

		if (password.length < 6) {
			req.flash('error', 'Mật khẩu phải có độ dài ít nhất 6 ký tự!!!');
			return res.redirect('/register');
		}

		if (password !== repeatPassword) {
			req.flash('error', 'Nhập lại mật khẩu không khớp!!!');
			return res.redirect('/register');
		}

		try {
			const hashedPassword = await bcrypt.hash(password, 10);

			User.getByEmail(email, (err, results) => {
				if (results.length > 0) {
					req.flash('error', 'Email đã được sử dụng!!!');
					return res.redirect('/register');
				} else {
					const newUser = {
						name,
						email,
						password: hashedPassword,
						status: 'offline',
					};

					User.create(newUser, function (err) {
						res.redirect('login');
					});
				}
			});
		} catch (error) {
			req.flash('error', 'Đăng ký tài khoản thất bại!!!');
			return res.redirect('/register');
		}
	}

	async login(req, res) {
		const { email, password } = req.body;
		User.getByEmail(email, (err, result) => {
			if (result.length === 0) {
				return res.status(400).json({ message: 'Email không tồn tại' });
			}
			const user = result[0];

			bcrypt.compare(password, user.password, (err, isMatch) => {
				if (!isMatch) {
					return res.send('Sai mật khẩu');
				}

				return res.send('Đăng nhập thành công');
			});
		});
	}
}

module.exports = new UserController();
