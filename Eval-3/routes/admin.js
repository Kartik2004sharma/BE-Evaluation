const express = require('express');
const router = express.Router();
const User = require('../models/User');
const geolocationService = require('../services/geolocationService');
const GeolocationService = require('../services/geolocation');

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
    if (req.isAuthenticated() && req.user.role === 'admin') {
        return next();
    }
    req.flash('error', 'You do not have permission to access this page');
    res.redirect('/');
};

// Admin Dashboard
router.get('/dashboard', isAdmin, async (req, res) => {
    try {
        // Get the last operated account (most recent login)
        const lastUser = await User.findOne().sort({ lastLogin: -1 });
        
        // Get geolocation data
        const geolocationData = await geolocationService.getGeolocationData(req.ip);
        
        res.render('admin/dashboard', {
            title: 'Admin Dashboard',
            lastUser,
            geolocationData
        });
    } catch (error) {
        console.error('Admin dashboard error:', error);
        req.flash('error', 'Error loading admin dashboard');
        res.redirect('/');
    }
});

// Test IPStack API
router.get('/test-geolocation', isAdmin, async (req, res) => {
    try {
        const geolocation = new GeolocationService();
        const location = await geolocation.getLocationByIP();
        
        res.json({
            success: true,
            location,
            apiKey: process.env.IPSTACK_API_KEY ? 'API Key is set' : 'API Key is missing'
        });
    } catch (error) {
        console.error('Geolocation test error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router; 