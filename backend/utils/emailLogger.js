const fs = require('fs');
const path = require('path');

const logEmailActivity = (type, recipient, subject, success, error = null) => {
  try {
    const logDir = path.join(__dirname, '../logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir);
    }
    
    const logFile = path.join(logDir, 'email.log');
    const timestamp = new Date().toISOString();
    const status = success ? 'SUCCESS' : 'FAILED';
    const errorMsg = error ? `\nError: ${error.message || error}` : '';
    
    const logEntry = `[${timestamp}] [${status}] [${type}] To: ${recipient}, Subject: ${subject}${errorMsg}\n`;
    
    fs.appendFileSync(logFile, logEntry);
  } catch (err) {
    console.error('Error al registrar actividad de correo:', err);
  }
};

module.exports = { logEmailActivity };