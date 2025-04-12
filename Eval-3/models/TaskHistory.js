const mongoose = require('mongoose');

const TaskHistorySchema = new mongoose.Schema({
    taskId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
    },
    action: {
        type: String,
        enum: ['created', 'updated', 'deleted'],
        required: true
    },
    taskData: {
        title: String,
        description: String,
        status: String,
        dueDate: Date
    },
    changes: {
        type: Object,
        default: {}
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

const TaskHistory = mongoose.models.TaskHistory || mongoose.model('TaskHistory', TaskHistorySchema);
module.exports = TaskHistory; 