import {createLogger, transports, format} from 'winston';

function isObject(obj: any): boolean {
  return obj !== undefined && obj !== null && obj.constructor === Object;
}

const logFormat = format.printf(
  info =>
    `[${info.level}] ${info.timestamp} : ${
      isObject(info.message) ? JSON.stringify(info.message) : info.message
    }`
);

const formatConsole = format.combine(
  format.colorize({all: true}),
  format.timestamp(),
  logFormat
);

const formatFile = format.combine(format.timestamp(), logFormat);

const logger = createLogger({
  level: 'debug',
  transports: [
    new transports.Console({format: formatConsole}),
    new transports.File({
      format: formatFile,
      filename: 'error.log',
      level: 'error',
    }),
    new transports.File({
      format: formatFile,
      filename: 'combined.log',
    }),
  ],
  exceptionHandlers: [
    new transports.File({
      format: formatFile,
      filename: 'exceptions.log',
    }),
    new transports.Console({format: formatConsole}),
  ],
});

export {logger};
