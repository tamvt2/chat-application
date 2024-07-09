const express = require('express');
const { engine } = require('express-handlebars');
const morgan = require('morgan');
const path = require('path');
const app = express();
const port = 3000;
const route = require('./routes');
const db = require('./config/db');
const session = require('express-session');
const flash = require('connect-flash');
const MySQLStore = require('express-mysql-session')(session);

// Template engine
app.engine('hbs', engine({ extname: '.hbs' }));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'resources', 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
	express.urlencoded({
		extended: true,
	})
);
app.use(express.json());
app.use(flash());

// Cấu hình express-mysql-session
const sessionStore = new MySQLStore({}, db);

// Cấu hình express-session
app.use(
	session({
		key: 'session_cookie_name',
		secret: 'your_secret_key',
		store: sessionStore,
		resave: false,
		saveUninitialized: false,
	})
);

route(app);

app.listen(port, () =>
	console.log(`App listening at http://localhost:${port}`)
);
