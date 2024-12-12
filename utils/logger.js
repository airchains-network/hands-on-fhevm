// Logger
import winston from "winston";
const { combine, colorize, printf } = winston.format;

const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

const logger = winston.createLogger({
  level: "info",
  format: combine(
    colorize(),
    winston.format.timestamp({ format: "HH:mm:ss" }),
    logFormat,
  ),
  transports: [
    new winston.transports.Console({
      format: combine(
        colorize(),
        winston.format.timestamp({ format: "HH:mm:ss" }),
        printf(({ level, message, timestamp }) => {
          return `${timestamp} ${level}: ${message}`;
        }),
      ),
    }),
    new winston.transports.File({
      filename: "app.log",
      format: combine(
        winston.format.timestamp({ format: "HH:mm:ss" }),
        logFormat,
      ),
    }),
  ],
});

export default logger;
