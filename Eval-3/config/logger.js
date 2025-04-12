const winston = require('winston');
const path = require('path');

// Create logs directory if it doesn't exist
const fs = require('fs');
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

// Define log format
const logFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
        return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    })
);

// Create access logger
const accessLogger = winston.createLogger({
    level: 'info',
    format: logFormat,
    transports: [
        new winston.transports.File({ 
            filename: path.join(logsDir, 'access.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5
        })
    ]
});

// Create task logger
const taskLogger = winston.createLogger({
    level: 'info',
    format: logFormat,
    transports: [
        new winston.transports.File({ 
            filename: path.join(logsDir, 'tasks.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5
        })
    ]
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
    accessLogger.add(new winston.transports.Console({
        format: winston.format.simple()
    }));
    taskLogger.add(new winston.transports.Console({
        format: winston.format.simple()
    }));
}

// Function to read logs
const readLogs = (logFile) => {
    try {
        const logPath = path.join(logsDir, logFile);
        if (fs.existsSync(logPath)) {
            return fs.readFileSync(logPath, 'utf8').split('\n').filter(line => line.trim());
        }
        return [];
    } catch (error) {
        console.error('Error reading logs:', error);
        return [];
    }
};

// Function to clear logs
const clearLogs = (logFile) => {
    try {
        const logPath = path.join(logsDir, logFile);
        if (fs.existsSync(logPath)) {
            fs.writeFileSync(logPath, '');
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error clearing logs:', error);
        return false;
    }
};

module.exports = {
    accessLogger,
    taskLogger,
    readLogs,
    clearLogs
}; 