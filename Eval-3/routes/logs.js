const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const { DeletedLog, ActivityLog } = require('../models/DeletedLog');
const TaskHistory = require('../models/TaskHistory');

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
    if (req.isAuthenticated() && req.user.role === 'admin') {
        return next();
    }
    req.flash('error', 'You do not have permission to access this page');
    res.redirect('/');
};

// View all logs
router.get('/', isAdmin, async (req, res) => {
    try {
        // Read current logs
        const accessLogs = await fs.readFile(path.join(__dirname, '../logs/access.log'), 'utf8')
            .then(data => data.trim().split('\n'))
            .catch(() => []);
        
        const taskLogs = await fs.readFile(path.join(__dirname, '../logs/tasks.log'), 'utf8')
            .then(data => data.trim().split('\n'))
            .catch(() => []);

        // Get deleted logs
        const deletedLogs = await DeletedLog.find()
            .populate('deletedBy', 'name email')
            .sort({ deletedAt: -1 })
            .limit(50);

        // Get activity logs
        const activityLogs = await ActivityLog.find()
            .populate('performedBy', 'name email')
            .sort({ timestamp: -1 })
            .limit(50);

        // Get task history
        const taskHistory = await TaskHistory.find()
            .populate('performedBy', 'name email')
            .sort({ timestamp: -1 })
            .limit(50);

        res.render('logs/index', {
            title: 'System Logs',
            accessLogs: accessLogs || [],
            taskLogs: taskLogs || [],
            deletedLogs: deletedLogs || [],
            activityLogs: activityLogs || [],
            taskHistory: taskHistory || [],
            user: req.user
        });
    } catch (error) {
        console.error('Error reading logs:', error);
        req.flash('error', 'Error reading logs');
        res.redirect('/');
    }
});

// View access logs
router.get('/access', isAdmin, async (req, res) => {
    try {
        const logs = await fs.readFile(path.join(__dirname, '../logs/access.log'), 'utf8');
        res.render('logs/access', {
            title: 'Access Logs',
            logs,
            user: req.user
        });
    } catch (error) {
        console.error('Error reading access logs:', error);
        req.flash('error', 'Error reading access logs');
        res.redirect('/logs');
    }
});

// View task logs
router.get('/tasks', isAdmin, async (req, res) => {
    try {
        const logs = await fs.readFile(path.join(__dirname, '../logs/tasks.log'), 'utf8');
        res.render('logs/tasks', {
            title: 'Task Logs',
            logs,
            user: req.user
        });
    } catch (error) {
        console.error('Error reading task logs:', error);
        req.flash('error', 'Error reading task logs');
        res.redirect('/logs');
    }
});

// Clear logs
router.post('/clear', isAdmin, async (req, res) => {
    try {
        const { logType } = req.body;
        
        if (logType === 'access' || logType === 'all') {
            const accessContent = await fs.readFile(path.join(__dirname, '../logs/access.log'), 'utf8');
            if (accessContent.trim()) {
                await DeletedLog.create({
                    originalType: 'access',
                    content: accessContent,
                    deletedBy: req.user._id
                });
            }
            await fs.writeFile(path.join(__dirname, '../logs/access.log'), '');
        }
        
        if (logType === 'tasks' || logType === 'all') {
            const tasksContent = await fs.readFile(path.join(__dirname, '../logs/tasks.log'), 'utf8');
            if (tasksContent.trim()) {
                await DeletedLog.create({
                    originalType: 'task',
                    content: tasksContent,
                    deletedBy: req.user._id
                });
            }
            await fs.writeFile(path.join(__dirname, '../logs/tasks.log'), '');
        }

        // Log the clear action
        await ActivityLog.create({
            action: 'delete',
            entityType: 'logs',
            entityId: logType,
            changes: { type: logType },
            performedBy: req.user._id
        });

        req.flash('success', 'Logs cleared successfully');
        res.redirect('/logs');
    } catch (error) {
        console.error('Error clearing logs:', error);
        req.flash('error', 'Error clearing logs');
        res.redirect('/logs');
    }
});

module.exports = router; 