const path = require('path');
const fs = require('fs');
const { createLogger, format, transports } = require('winston');

const env = process.env.NODE_ENV || 'development';
const logDir = 'logs';

// Create the log directory if it does not exist
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const filename = path.join(logDir, 'app.log');
const logger = createLogger({
    level: env === 'development' ? 'debug' : 'info',
    format: format.combine(
      format.colorize(),
      format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
      }),
      format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
    ),
    transports: [
        new transports.Console({
          level: env === 'development' ? 'debug' : 'error', // En Producción solo pinta error
          format: format.combine(
            format.colorize(),
            format.printf(
              info => `${info.timestamp} ${info.level}: ${info.message}`
            )
          )
        }),
        new transports.File({ filename })
      ]
  });

module.exports = logger;