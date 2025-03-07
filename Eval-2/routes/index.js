const express = require('express');
const router = express.Router();
const Task = require('../models/Task');

const ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash('error_msg', 'Please log in to view this resource');
    res.redirect('/users/login');
};

router.get('/', (req, res) => {
    res.render('index');
});

router.get('/dashboard', ensureAuthenticated, async (req, res) => {
    try {
        const tasks = await Task.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(5);
        const totalTasks = await Task.countDocuments({ user: req.user.id });
        const completedTasks = await Task.countDocuments({ user: req.user.id, status: 'completed' });
        const pendingTasks = totalTasks - completedTasks;

        res.render('dashboard', {
            user: req.user,
            tasks,
            totalTasks,
            completedTasks,
            pendingTasks
        });
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Error loading dashboard');
        res.redirect('/');
    }
});

module.exports = router; 