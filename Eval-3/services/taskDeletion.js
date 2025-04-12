const Task = require('../models/Task');
const DeletedTask = require('../models/DeletedTask');
const { taskLogger } = require('../config/logger');

class TaskDeletionService {
    async permanentDelete(taskId, userId) {
        try {
            // Find and delete the task
            const task = await Task.findOneAndDelete({ _id: taskId, user: userId });
            
            if (!task) {
                throw new Error('Task not found');
            }

            // Log the deletion
            taskLogger.info(`Task permanently deleted: ${taskId} by user: ${userId}`);

            return {
                success: true,
                message: 'Task permanently deleted',
                task
            };
        } catch (error) {
            taskLogger.error(`Error in permanent deletion: ${error.message}`);
            throw error;
        }
    }

    async moveToJunk(taskId, userId) {
        try {
            // Find the task
            const task = await Task.findOne({ _id: taskId, user: userId });
            
            if (!task) {
                throw new Error('Task not found');
            }

            // Create a copy in the junk collection
            const deletedTask = new DeletedTask({
                originalId: task._id,
                title: task.title,
                description: task.description,
                status: task.status,
                user: task.user,
                deletedAt: new Date(),
                deletedBy: userId
            });

            await deletedTask.save();

            // Delete from main collection
            await Task.findByIdAndDelete(taskId);

            // Log the move to junk
            taskLogger.info(`Task moved to junk: ${taskId} by user: ${userId}`);

            return {
                success: true,
                message: 'Task moved to junk',
                task: deletedTask
            };
        } catch (error) {
            taskLogger.error(`Error moving task to junk: ${error.message}`);
            throw error;
        }
    }

    async restoreFromJunk(taskId, userId) {
        try {
            // Find the task in junk
            const deletedTask = await DeletedTask.findOne({ _id: taskId, user: userId });
            
            if (!deletedTask) {
                throw new Error('Task not found in junk');
            }

            // Create a new task in the main collection
            const restoredTask = new Task({
                title: deletedTask.title,
                description: deletedTask.description,
                status: deletedTask.status,
                user: deletedTask.user
            });

            await restoredTask.save();

            // Delete from junk collection
            await DeletedTask.findByIdAndDelete(taskId);

            // Log the restoration
            taskLogger.info(`Task restored from junk: ${taskId} by user: ${userId}`);

            return {
                success: true,
                message: 'Task restored from junk',
                task: restoredTask
            };
        } catch (error) {
            taskLogger.error(`Error restoring task from junk: ${error.message}`);
            throw error;
        }
    }

    async emptyJunk(userId) {
        try {
            // Delete all tasks in junk for the user
            const result = await DeletedTask.deleteMany({ user: userId });

            // Log the junk emptying
            taskLogger.info(`Junk emptied for user: ${userId}, ${result.deletedCount} tasks deleted`);

            return {
                success: true,
                message: `Successfully deleted ${result.deletedCount} tasks from junk`,
                count: result.deletedCount
            };
        } catch (error) {
            taskLogger.error(`Error emptying junk: ${error.message}`);
            throw error;
        }
    }
}

module.exports = new TaskDeletionService(); 