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
				req.flash('error', 'Email không tồn tại');
				return res.redirect('/login');
			}
			const user = result[0];

			bcrypt.compare(password, user.password, (err, isMatch) => {
				if (!isMatch) {
					req.flash('error', 'Sai mật khẩu');
					return res.redirect('/login');
				}
				const token = jwt.sign({ id: user.id }, 'your_secret_key', {
					expiresIn: '1h',
				});
				req.session.token = token;
				req.session.userId = user.id;
				req.session.username = user.name;
				req.session.email = user.email;
				req.session.phone = user.phone;
				req.session.image_url = user.image_url;
				User.update({ status: 'online' }, user.id, err);
				res.redirect('/');
			});
		});
	}

	logout(req, res) {
		const userId = req.session.userId;
		req.session.destroy((err) => {
			if (err) {
				return res.redirect('/');
			}

			res.clearCookie('connect.sid');
			User.update({ status: 'offline' }, userId, err);
			res.redirect('/login');
		});
	}

	isPhoneNumber(phone) {
		const phoneRegex = /^0[0-9]{9,10}$/;
		return phoneRegex.test(phone);
	}

	update = async (req, res) => {
		const userId = req.session.userId;
		const { phone, name, image_url } = req.body;

		try {
			if (phone && !this.isPhoneNumber(phone)) {
				return res.json({
					success: false,
					message: 'Số điện thoại không hợp lệ.',
				});
			}

			User.update({ phone, name, image_url }, userId, (err, result) => {
				if (result.length === 0) {
					return res.json({
						success: false,
						message: 'Cập nhật thất bại',
					});
				}
				User.getById(userId, (err, result) => {
					req.session.username = result[0].name;
					req.session.phone = result[0].phone;
					req.session.image_url = result[0].image_url;

					return res.json({
						success: true,
						message: 'Cập nhật thành công.',
					});
				});
			});
		} catch (error) {
			return res.json({
				success: false,
				message: 'Có lỗi xảy ra khi cập nhật.',
			});
		}
	};

	searchUserByPhone = (req, res) => {
		const phone = req.body;

		User.getByPhone(phone, (err, user) => {
			if (user.length === 0) {
				return res.json({
					success: false,
					message: 'Không tìm thấy user với số điện thoại này.',
				});
			}
			return res.json({
				success: true,
				user,
			});
		});
	};
}

module.exports = new UserController();
