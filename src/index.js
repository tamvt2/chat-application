const express = require('express');
const { engine } = require('express-handlebars');
const morgan = require('morgan');
const path = require('path');
const app = express();
const http = require('http').createServer(app);
const port = 3000;
const route = require('./routes');
const db = require('./config/db');
const session = require('express-session');
const flash = require('connect-flash');
const MySQLStore = require('express-mysql-session')(session);
const sessionUserMiddleware = require('./middleware/sessionUser');
const updateUserActivity = require('./middleware/updateUser');
const socketIo = require('socket.io');
const io = socketIo(http);

// Template engine
app.engine('hbs', engine({ extname: '.hbs' }));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'resources', 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

app.use(
	express.urlencoded({
		extended: true,
	})
);

io.on('connection', (socket) => {
	socket.on('message', (message) => {
		socket.broadcast.emit('message', message);
		io.emit('new-message', message);
	});
});

app.use(express.json());
app.use(flash());

// Cấu hình express-mysql-session
const sessionStore = new MySQLStore({}, db);

// Cấu hình express-session
app.use(
	session({
		secret: 'your-secret-key',
		store: sessionStore,
		resave: false,
		saveUninitialized: true,
		cookie: { secure: false },
	})
);

app.use(sessionUserMiddleware);
app.use(updateUserActivity);
route(app);

http.listen(port, () =>
	console.log(`App listening at http://localhost:${port}`)
);
