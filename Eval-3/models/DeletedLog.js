const mongoose = require('mongoose');

const DeletedLogSchema = new mongoose.Schema({
    originalType: {
        type: String,
        enum: ['access', 'task'],
        required: true
    },
    content: {
        type: String,
        required: true
    },
    deletedAt: {
        type: Date,
        default: Date.now
    },
    deletedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

const ActivityLogSchema = new mongoose.Schema({
    action: {
        type: String,
        enum: ['add', 'update', 'delete'],
        required: true
    },
    entityType: {
        type: String,
        required: true
    },
    entityId: {
        type: String,
        required: true
    },
    changes: {
        type: Object,
        required: true
    },
    performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const DeletedLog = mongoose.models.DeletedLog || mongoose.model('DeletedLog', DeletedLogSchema);
const ActivityLog = mongoose.models.ActivityLog || mongoose.model('ActivityLog', ActivityLogSchema);

module.exports = { DeletedLog, ActivityLog }; 