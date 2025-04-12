require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const flash = require('connect-flash');
const path = require('path');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
const { accessLogger, taskLogger } = require('./config/logger');
const http = require('http');
const io = require('socket.io');
const geolocationService = require('./services/geolocationService');

const app = express();

// Database setup
require('./config/db');

// Load models
const User = require('./models/User');

// Passport config
require('./config/auth')(passport);

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware setup
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Logger middleware
app.use((req, res, next) => {
    accessLogger.info(`${req.method} ${req.url} - ${req.ip}`);
    next();
});

// Express session middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Flash messages middleware
app.use(flash());

// Global variables middleware
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    res.locals.title = 'TaskSmart'; // Default title
    next();
});

// Routes
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));
app.use('/tasks', require('./routes/tasks'));
app.use('/about', require('./routes/about'));
app.use('/logs', require('./routes/logs'));
app.use('/admin', require('./routes/admin'));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', {
        title: 'Error',
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).render('error', {
        title: '404 Not Found',
        message: 'The page you are looking for does not exist.'
    });
});

// Create HTTP server
const server = http.createServer(app);

// Socket.IO setup
const ioServer = io(server);

// Socket.IO connection handling
ioServer.on('connection', (socket) => {
    console.log('New client connected');
    
    // Send initial data
    const sendInitialData = async () => {
        try {
            const lastUser = await User.findOne().sort({ lastLogin: -1 });
            const geolocationData = await geolocationService.getGeolocationData(socket.handshake.address);
            
            socket.emit('dashboardData', {
                lastUser,
                geolocationData
            });
        } catch (error) {
            console.error('Error sending initial data:', error);
        }
    };

    // Send initial data when client connects
    sendInitialData();

    // Set up interval to update data every 30 seconds
    const updateInterval = setInterval(sendInitialData, 30000);

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('Client disconnected');
        clearInterval(updateInterval);
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('MongoDB Connected');
});