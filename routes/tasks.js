const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../middleware/auth');
const Task = require('../models/Task');


router.get('/', ensureAuthenticated, async (req, res) => {
    try {
        const tasks = await Task.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.render('tasks/index', { tasks });
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Error loading tasks');
        res.redirect('/dashboard');
    }
});


router.get('/add', ensureAuthenticated, (req, res) => {
    res.render('tasks/add');
});


router.post('/', ensureAuthenticated, async (req, res) => {
    try {
        const { title, description, dueDate, priority, status } = req.body;
        const newTask = new Task({
            title,
            description,
            dueDate,
            priority,
            status,
            user: req.user.id
        });
        await newTask.save();
        req.flash('success_msg', 'Task added successfully');
        res.redirect('/tasks');
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Error creating task');
        res.redirect('/tasks/add');
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
        const task = await Task.findOne({
            _id: req.params.id,
            user: req.user.id
        });
        if (!task) {
            req.flash('error_msg', 'Task not found');
            return res.redirect('/tasks');
        }
        
        const { title, description, dueDate, priority, status } = req.body;
        task.title = title;
        task.description = description;
        task.dueDate = dueDate;
        task.priority = priority;
        task.status = status;
        
        await task.save();
        req.flash('success_msg', 'Task updated successfully');
        res.redirect('/tasks');
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Error updating task');
        res.redirect('/tasks');
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await Task.findByIdAndDelete(req.params.id);
        req.flash('success_msg', 'Task deleted successfully');
        res.redirect('/tasks');
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Error deleting task');
        res.redirect('/tasks');
    }
});

module.exports = router; 