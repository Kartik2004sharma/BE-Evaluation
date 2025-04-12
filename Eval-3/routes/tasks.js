const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../middleware/auth');
const Task = require('../models/Task');
const geolocationService = require('../services/geolocation');
const taskDeletionService = require('../services/taskDeletion');
const { taskLogger } = require('../config/logger');
const TaskHistory = require('../models/TaskHistory');


router.get('/', ensureAuthenticated, async (req, res) => {
    try {
        const tasks = await Task.find({ user: req.user.id }).sort({ date: -1 });
        const taskHistory = await TaskHistory.find()
            .populate('performedBy', 'name email')
            .sort({ timestamp: -1 })
            .limit(50);

        taskLogger.info(`User ${req.user.email} viewed all tasks`);
        res.render('tasks/index', {
            title: 'Tasks',
            tasks,
            taskHistory
        });
    } catch (error) {
        taskLogger.error(`Error fetching tasks: ${error.message}`);
        req.flash('error', 'Error fetching tasks');
        res.redirect('/');
    }
});


router.get('/add', ensureAuthenticated, (req, res) => {
    res.render('tasks/add');
});


router.post('/', ensureAuthenticated, async (req, res) => {
    try {
        const { title, description, dueDate } = req.body;
        const task = new Task({
            title,
            description,
            dueDate,
            user: req.user.id
        });
        await task.save();

        // Record task creation in history
        await TaskHistory.create({
            taskId: task._id,
            action: 'created',
            taskData: {
                title: task.title,
                description: task.description,
                dueDate: task.dueDate,
                status: task.status
            },
            performedBy: req.user.id
        });

        taskLogger.info(`User ${req.user.email} created task: ${title}`);
        req.flash('success', 'Task created successfully');
        res.redirect('/tasks');
    } catch (error) {
        taskLogger.error(`Error creating task: ${error.message}`);
        req.flash('error', 'Error creating task');
        res.redirect('/tasks');
    }
});

router.get('/edit/:id', ensureAuthenticated, async (req, res) => {
    try {
        const task = await Task.findOne({
            _id: req.params.id,
            user: req.user.id
        });
        if (!task) {
            req.flash('error_msg', 'Task not found');
            return res.redirect('/tasks');
        }
        res.render('tasks/edit', { task });
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Error loading task');
        res.redirect('/tasks');
    }
});

router.put('/:id', ensureAuthenticated, async (req, res) => {
    try {
        const { title, description, dueDate, status } = req.body;
        const oldTask = await Task.findById(req.params.id);
        
        if (!oldTask) {
            req.flash('error', 'Task not found');
            return res.redirect('/tasks');
        }

        // Calculate changes
        const changes = {};
        if (title !== oldTask.title) changes.title = { from: oldTask.title, to: title };
        if (description !== oldTask.description) changes.description = { from: oldTask.description, to: description };
        if (dueDate !== oldTask.dueDate) changes.dueDate = { from: oldTask.dueDate, to: dueDate };
        if (status !== oldTask.status) changes.status = { from: oldTask.status, to: status };

        // Update task
        const task = await Task.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            { title, description, dueDate, status },
            { new: true }
        );

        // Record task update in history
        await TaskHistory.create({
            taskId: task._id,
            action: 'updated',
            taskData: {
                title: task.title,
                description: task.description,
                dueDate: task.dueDate,
                status: task.status
            },
            changes,
            performedBy: req.user.id
        });

        taskLogger.info(`User ${req.user.email} updated task: ${title}`);
        req.flash('success', 'Task updated successfully');
        res.redirect('/tasks');
    } catch (error) {
        taskLogger.error(`Error updating task: ${error.message}`);
        req.flash('error', 'Error updating task');
        res.redirect('/tasks');
    }
});

router.delete('/:id', ensureAuthenticated, async (req, res) => {
    try {
        const task = await Task.findOne({ _id: req.params.id, user: req.user.id });
        
        if (!task) {
            req.flash('error', 'Task not found');
            return res.redirect('/tasks');
        }

        // Record task deletion in history
        await TaskHistory.create({
            taskId: task._id,
            action: 'deleted',
            taskData: {
                title: task.title,
                description: task.description,
                dueDate: task.dueDate,
                status: task.status
            },
            performedBy: req.user.id
        });

        // Delete the task using findOneAndDelete
        await Task.findOneAndDelete({ _id: req.params.id, user: req.user.id });

        taskLogger.info(`User ${req.user.email} deleted task: ${task.title}`);
        req.flash('success', 'Task deleted successfully');
        res.redirect('/tasks');
    } catch (error) {
        taskLogger.error(`Error deleting task: ${error.message}`);
        req.flash('error', 'Error deleting task');
        res.redirect('/tasks');
    }
});

router.delete('/:id/permanent', async (req, res) => {
    try {
        await taskDeletionService.permanentDelete(req.params.id, req.user.id);
        req.flash('success_msg', 'Task permanently deleted');
        res.redirect('/tasks');
    } catch (error) {
        taskLogger.error(`Error permanently deleting task: ${error.message}`);
        req.flash('error_msg', 'Error permanently deleting task');
        res.redirect('/tasks');
    }
});

router.get('/junk', async (req, res) => {
    try {
        const deletedTasks = await DeletedTask.find({ user: req.user.id })
            .sort({ deletedAt: -1 });
        
        res.render('tasks/junk', {
            title: 'Junk Tasks',
            tasks: deletedTasks,
            user: req.user
        });
    } catch (error) {
        taskLogger.error(`Error fetching junk tasks: ${error.message}`);
        req.flash('error_msg', 'Error fetching junk tasks');
        res.redirect('/tasks');
    }
});

router.post('/junk/:id/restore', async (req, res) => {
    try {
        await taskDeletionService.restoreFromJunk(req.params.id, req.user.id);
        req.flash('success_msg', 'Task restored from junk');
        res.redirect('/tasks');
    } catch (error) {
        taskLogger.error(`Error restoring task: ${error.message}`);
        req.flash('error_msg', 'Error restoring task');
        res.redirect('/tasks/junk');
    }
});

router.post('/junk/empty', async (req, res) => {
    try {
        const result = await taskDeletionService.emptyJunk(req.user.id);
        req.flash('success_msg', result.message);
        res.redirect('/tasks/junk');
    } catch (error) {
        taskLogger.error(`Error emptying junk: ${error.message}`);
        req.flash('error_msg', 'Error emptying junk');
        res.redirect('/tasks/junk');
    }
});

router.get('/history', ensureAuthenticated, async (req, res) => {
    try {
        const taskHistory = await TaskHistory.find()
            .populate('performedBy', 'name email')
            .sort({ timestamp: -1 })
            .limit(100);

        res.render('tasks/history', {
            title: 'Task History',
            taskHistory
        });
    } catch (error) {
        taskLogger.error(`Error fetching task history: ${error.message}`);
        req.flash('error', 'Error fetching task history');
        res.redirect('/tasks');
    }
});

module.exports = router; 