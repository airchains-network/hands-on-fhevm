import winston from "winston";
import util from "util";

const { combine, colorize, timestamp, splat, printf } = winston.format;

const logFormat = printf(({ level, message, timestamp, ...meta }) => {
  const formattedMessage = util.format(message, ...Object.values(meta));
  return `${timestamp} ${level}: ${formattedMessage}`;
});

const logger = winston.createLogger({
  level: "info",
  format: combine(timestamp({ format: "HH:mm:ss" }), splat(), logFormat),
  transports: [
    new winston.transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: "HH:mm:ss" }),
        splat(),
        printf(({ level, message, timestamp, ...meta }) => {
          const formattedMessage = util.format(message, ...Object.values(meta));
          return `${timestamp} ${level}: ${formattedMessage}`;
        }),
      ),
    }),
    new winston.transports.File({
      filename: "app.log",
      format: combine(
        timestamp({ format: "HH:mm:ss" }),
        splat(),
        printf(({ level, message, timestamp, ...meta }) => {
          const formattedMessage = util.format(message, ...Object.values(meta));
          return `${timestamp} ${level}: ${formattedMessage}`;
        }),
      ),
    }),
  ],
});

logger.boldinfo = function (message, ...meta) {
  const boldMessage = `\x1b[1m${message}\x1b[0m`;
  this.info(boldMessage, ...meta);
};

export default logger;
