// File system

const fs = require('fs');
const path = require('path');

const folder = path.join(__dirname, '..', 'logs');
fs.mkdirSync(folder, { recursive: true }); // create logs/ if missing
const file = path.join(folder, 'app.log');

/**
 * Write one line to logs/app.log and the console.
 * Format: 2026-10-19T08:00:00.000Z [ERROR] message
 */
function write(level, message) {
    const line = `${new Date().toISOString()} [${level}] ${message}\n`;
    fs.appendFile(file, line, () => { }); // don't crash the app if logging fails
    level === 'ERROR' ? console.error(line.trim()) : console.log(line.trim());
}

// several parts allowed, like console.error('Login error:', err.message)
module.exports = {
    info: (...parts) => write('INFO', parts.join(' ')),
    warn: (...parts) => write('WARN', parts.join(' ')),
    error: (...parts) => write('ERROR', parts.join(' ')),
};