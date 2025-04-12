const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Login Page
router.get('/login', (req, res) => {
    res.render('users/login', {
        title: 'Login - TaskSmart',
        user: req.user
    });
});

// Login Handle
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

// Register Page
router.get('/register', (req, res) => {
    res.render('users/register', {
        title: 'Register',
        user: req.user
    });
});

// Register Handle
router.post('/register', async (req, res) => {
    const { name, email, password, password2 } = req.body;
    let errors = [];

    // Check required fields
    if (!name || !email || !password || !password2) {
        errors.push({ msg: 'Please fill in all fields' });
    }

    // Check passwords match
    if (password !== password2) {
        errors.push({ msg: 'Passwords do not match' });
    }

    // Check password length
    if (password.length < 6) {
        errors.push({ msg: 'Password should be at least 6 characters' });
    }

    if (errors.length > 0) {
        res.render('users/register', {
            title: 'Register',
            errors,
            name,
            email,
            password,
            password2,
            user: req.user
        });
    } else {
        try {
            const user = await User.findOne({ email: email });
            if (user) {
                errors.push({ msg: 'Email is already registered' });
                res.render('users/register', {
                    title: 'Register',
                    errors,
                    name,
                    email,
                    password,
                    password2,
                    user: req.user
                });
            } else {
                const newUser = new User({
                    name,
                    email,
                    password,
                    role: 'user'
                });

                // Hash password
                const salt = await bcrypt.genSalt(10);
                newUser.password = await bcrypt.hash(password, salt);

                // Save user
                await newUser.save();
                req.flash('success_msg', 'You are now registered and can log in');
                res.redirect('/users/login');
            }
        } catch (err) {
            console.error(err);
            req.flash('error_msg', 'Error registering user');
            res.redirect('/users/register');
        }
    }
});

// Logout Handle
router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error(err);
        }
        req.flash('success_msg', 'You are logged out');
        res.redirect('/users/login');
    });
});

module.exports = router; 